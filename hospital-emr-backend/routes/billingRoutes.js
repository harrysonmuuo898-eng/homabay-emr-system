const express = require("express");
const Billing = require("../models/billing");
const { createDepartmentRecord } = require("../models/departmentRecord");
const Patient = require("../models/patient");
const store = require("../data/store");
const { isMongoReady } = require("../utils/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function billTotal(services) {
  return (services || []).reduce((sum, service) => sum + Number(service.cost || 0), 0);
}

function summarizeStats(totalPatients, bills) {
  const deptCounts = {};
  let revenue = 0;

  bills.forEach(bill => {
    const total = Number(bill.totalAmount || billTotal(bill.services));
    revenue += total;
    (bill.services || []).forEach(service => {
      const dept = service.department || String(service).split(":")[0];
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
  });

  return { totalPatients, revenue, deptCounts };
}

function normalizeDepartmentName(value) {
  const clean = String(value || "Unassigned").trim();
  return clean || "Unassigned";
}

function publicStaffSummary(staff) {
  return {
    staffID: staff.staffID,
    name: staff.name,
    role: staff.role,
    department: staff.department,
    active: staff.active !== false
  };
}

function publicPatientSummary(patient) {
  return {
    patientID: patient.patientID,
    name: patient.name,
    patientType: patient.patientType,
    gender: patient.gender,
    contact: patient.contact,
    createdAt: patient.createdAt
  };
}

function buildAdminOverview({ patients, bills, staff }) {
  const patientMap = new Map((patients || []).map(patient => [patient.patientID, publicPatientSummary(patient)]));
  const departmentMap = new Map();
  const totals = {
    patients: patients.length,
    doctors: 0,
    nurses: 0,
    technicians: 0,
    admins: 0,
    otherStaff: 0,
    activeStaff: 0,
    departments: 0,
    services: 0,
    revenue: 0,
    pendingBills: 0,
    paidBills: 0
  };

  function ensureDepartment(name) {
    const departmentName = normalizeDepartmentName(name);
    if (!departmentMap.has(departmentName)) {
      departmentMap.set(departmentName, {
        name: departmentName,
        staff: [],
        doctors: [],
        nurses: [],
        technicians: [],
        patients: [],
        services: [],
        revenue: 0,
        serviceCount: 0
      });
    }
    return departmentMap.get(departmentName);
  }

  (staff || []).forEach(member => {
    const role = String(member.role || "staff").toLowerCase();
    const department = ensureDepartment(member.department);
    const summary = publicStaffSummary(member);
    department.staff.push(summary);
    if (role === "doctor") {
      totals.doctors += 1;
      department.doctors.push(summary);
    } else if (role === "nurse") {
      totals.nurses += 1;
      department.nurses.push(summary);
    } else if (role === "technician") {
      totals.technicians += 1;
      department.technicians.push(summary);
    } else if (role === "admin") {
      totals.admins += 1;
    } else {
      totals.otherStaff += 1;
    }
    if (member.active !== false) totals.activeStaff += 1;
  });

  (bills || []).forEach(bill => {
    const billTotalValue = Number(bill.totalAmount || billTotal(bill.services));
    totals.revenue += billTotalValue;
    if (bill.status === "Paid") totals.paidBills += 1;
    else totals.pendingBills += 1;

    (bill.services || []).forEach(service => {
      const department = ensureDepartment(service.department);
      const serviceCost = Number(service.cost || 0);
      const patient = patientMap.get(bill.patientID) || { patientID: bill.patientID, name: "Unknown Patient" };
      const patientExists = department.patients.some(item => item.patientID === patient.patientID);

      if (!patientExists) department.patients.push(patient);
      department.services.push({
        patientID: bill.patientID,
        patientName: patient.name,
        description: service.description,
        cost: serviceCost,
        recordedBy: service.recordedBy,
        createdAt: service.createdAt
      });
      department.revenue += serviceCost;
      department.serviceCount += 1;
      totals.services += 1;
    });
  });

  const registration = ensureDepartment("Registration");
  (patients || []).forEach(patient => {
    if (!registration.patients.some(item => item.patientID === patient.patientID)) {
      registration.patients.push(publicPatientSummary(patient));
    }
  });

  const departments = Array.from(departmentMap.values())
    .map(department => ({
      ...department,
      patientCount: department.patients.length,
      doctorCount: department.doctors.length,
      nurseCount: department.nurses.length,
      technicianCount: department.technicians.length,
      staffCount: department.staff.length,
      services: department.services.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 20)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  totals.departments = departments.length;
  return { totals, departments };
}

function recordedBy(staff) {
  return {
    staffID: staff.staffID,
    name: staff.name,
    role: staff.role,
    department: staff.department
  };
}

function storeDepartmentRecord(record) {
  store.departmentRecords.push(record);
  const key = String(record.department || "General").trim() || "General";
  store.departmentRecordTables[key] = store.departmentRecordTables[key] || [];
  store.departmentRecordTables[key].push(record);
}

router.use(requireAuth);

/**
 * POST /add - Add a service to patient's billing record
 * Semantic alias for department service recording
 * Creates or updates a pending bill with service details
 * Accessible by: admin, doctor, nurse, technician
 */
router.post("/add", requireRole("admin", "doctor", "nurse", "technician"), async (req, res, next) => {
  try {
    // Semantic alias to /api/departments/add for service recording
    const patientID = String(req.body.patientID || req.body.id || "").trim();
    const department = String(req.body.department || "").trim();
    const description = String(req.body.description || "").trim();
    const cost = Number(req.body.cost);
    const details = req.body.details && typeof req.body.details === "object" ? req.body.details : {};

    // Validation
    if (!patientID) {
      console.error("[BillingAdd] Missing patientID");
      return res.status(400).json({ error: "patientID is required" });
    }
    if (!department || !description) {
      console.error("[BillingAdd] Missing department or description for patient:", patientID);
      return res.status(400).json({ error: "department and description are required" });
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      console.error("[BillingAdd] Invalid cost:", cost, "for patient:", patientID);
      return res.status(400).json({ error: "cost must be a positive number" });
    }

    // MongoDB path
    if (isMongoReady()) {
      const patient = await Patient.findOne({ patientID });
      if (!patient) {
        console.error("[BillingAdd] Patient not found (MongoDB):", patientID);
        return res.status(404).json({ error: "Patient not found" });
      }

      let bill = await Billing.findOne({ patientID, status: "Pending" });
      if (!bill) bill = new Billing({ patientID, services: [], totalAmount: 0, status: "Pending" });

      const staffSummary = recordedBy(req.staff);
      bill.services.push({
        department,
        description,
        cost,
        details,
        recordedBy: staffSummary
      });
      bill.totalAmount += cost;
      await Promise.all([
        bill.save(),
        createDepartmentRecord({ patientID, department, description, cost, details, recordedBy: staffSummary })
      ]);
      console.log("[BillingAdd] Service added (MongoDB):", patientID, department, "Cost:", cost);
      return res.status(201).json(bill);
    }

    // In-memory store path
    if (!store.findPatient(patientID)) {
      console.error("[BillingAdd] Patient not found (Store):", patientID);
      return res.status(404).json({ error: "Patient not found" });
    }

    let bill = store.findPendingBill(patientID);
    if (!bill) {
      bill = {
        _id: store.nextId("bill"),
        patientID,
        services: [],
        totalAmount: 0,
        status: "Pending",
        paymentMethod: "SHA",
        createdAt: new Date().toISOString()
      };
      store.bills.push(bill);
    }

    const staffSummary = recordedBy(req.staff);
    const serviceRecord = {
      department,
      description,
      cost,
      details,
      recordedBy: staffSummary,
      createdAt: new Date().toISOString()
    };
    bill.services.push(serviceRecord);
    storeDepartmentRecord({
      _id: store.nextId("department-record"),
      patientID,
      ...serviceRecord
    });
    bill.totalAmount += cost;
    console.log("[BillingAdd] Service added (Store):", patientID, department, "Cost:", cost);
    res.status(201).json(bill);
  } catch (err) {
    console.error("[BillingAdd] Error:", err.message);
    next(err);
  }
});

/**
 * GET /recent/:department - Get recent services by department
 * Returns last 10 services for a specific department, sorted by date
 * Accessible by: admin, doctor, nurse, technician
 */
router.get("/recent/:department", requireRole("admin", "doctor", "nurse", "technician"), async (req, res, next) => {
  try {
    const department = String(req.params.department || "").trim();
    if (!department) {
      console.error("[BillingRecent] Missing department parameter");
      return res.status(400).json({ error: "Department is required" });
    }

    console.log("[BillingRecent] Fetching recent services for department:", department);

    if (isMongoReady()) {
      const bills = await Billing.find({ "services.department": department }).lean();
      const services = bills.flatMap(bill => (bill.services || [])
        .filter(service => String(service.department || "").trim().toLowerCase() === department.toLowerCase())
        .map(service => ({ patientID: bill.patientID, ...service })));
      const sorted = services.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 10);
      console.log("[BillingRecent] Found", sorted.length, "recent services (MongoDB)");
      return res.json(sorted);
    }

    const services = store.bills.flatMap(bill => (bill.services || [])
      .filter(service => String(service.department || "").trim().toLowerCase() === department.toLowerCase())
      .map(service => ({ patientID: bill.patientID, ...service })));
    const sorted = services.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 10);
    console.log("[BillingRecent] Found", sorted.length, "recent services (Store)");
    res.json(sorted);
  } catch (err) {
    console.error("[BillingRecent] Error:", err.message);
    next(err);
  }
});

/**
 * POST /generate - Generate or fetch a billing record
 * Creates a new billing record if none exists for the patient
 * Accessible by: admin, nurse
 */
router.post("/generate", requireRole("admin", "nurse"), async (req, res, next) => {
  try {
    const patientID = String(req.body.patientID || "").trim();
    if (!patientID) {
      console.error("[BillingGenerate] Missing patientID");
      return res.status(400).json({ error: "patientID is required" });
    }

    if (isMongoReady()) {
      const patient = await Patient.findOne({ patientID });
      if (!patient) return res.status(404).json({ error: "Patient not found" });

      let bill = await Billing.findOne({ patientID, status: "Pending" });
      if (!bill) {
        bill = await Billing.create({ patientID, services: req.body.services || [], totalAmount: Number(req.body.totalAmount || 0) });
      }
      return res.json(bill);
    }

    if (!store.findPatient(patientID)) return res.status(404).json({ error: "Patient not found" });
    let bill = store.findPendingBill(patientID);
    if (!bill) {
      bill = {
        _id: store.nextId("bill"),
        patientID,
        services: req.body.services || [],
        totalAmount: Number(req.body.totalAmount || 0),
        paymentMethod: "SHA",
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      store.bills.push(bill);
    }
    res.json(bill);
  } catch (err) {
    next(err);
  }
});

router.post("/pay/:id", requireRole("admin", "nurse"), async (req, res, next) => {
  try {
    const method = req.body.method || req.body.paymentMethod || "SHA";
    if (!["SHA", "M-Pesa"].includes(method)) {
      return res.status(400).json({ error: "Payment method must be SHA or M-Pesa" });
    }

    if (isMongoReady()) {
      const bill = await Billing.findById(req.params.id);
      if (!bill) return res.status(404).json({ error: "Bill not found" });
      bill.status = "Paid";
      bill.paymentMethod = method;
      await bill.save();
      return res.json({ message: "Payment successful", bill });
    }

    const bill = store.bills.find(item => item._id === req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    bill.status = "Paid";
    bill.paymentMethod = method;
    res.json({ message: "Payment successful", bill });
  } catch (err) {
    next(err);
  }
});

router.post("/pay", requireRole("admin", "nurse"), async (req, res, next) => {
  try {
    const patientID = String(req.body.patientID || "").trim();
    const method = req.body.method || req.body.paymentMethod || "SHA";
    if (!patientID) return res.status(400).json({ error: "patientID is required" });
    if (!["SHA", "M-Pesa"].includes(method)) {
      return res.status(400).json({ error: "Payment method must be SHA or M-Pesa" });
    }

    if (isMongoReady()) {
      const patient = await Patient.findOne({ patientID });
      if (!patient) return res.status(404).json({ error: "Patient not found" });

      let bill = await Billing.findOne({ patientID, status: "Pending" });
      if (!bill) bill = await Billing.create({ patientID, services: [], totalAmount: 0 });
      bill.status = "Paid";
      bill.paymentMethod = method;
      await bill.save();
      return res.json({ message: "Payment successful", bill });
    }

    if (!store.findPatient(patientID)) return res.status(404).json({ error: "Patient not found" });
    let bill = store.findPendingBill(patientID);
    if (!bill) {
      bill = {
        _id: store.nextId("bill"),
        patientID,
        services: [],
        totalAmount: 0,
        paymentMethod: method,
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      store.bills.push(bill);
    }

    bill.status = "Paid";
    bill.paymentMethod = method;
    res.json({ message: "Payment successful", bill });
  } catch (err) {
    next(err);
  }
});

router.get("/patient/:patientID", requireRole("admin", "doctor", "nurse"), async (req, res, next) => {
  try {
    if (isMongoReady()) {
      const bills = await Billing.find({ patientID: req.params.patientID }).lean();
      return res.json(bills);
    }

    res.json(store.bills.filter(bill => bill.patientID.toLowerCase() === req.params.patientID.toLowerCase()));
  } catch (err) {
    next(err);
  }
});

router.get("/stats", requireRole("admin"), async (req, res, next) => {
  try {
    if (isMongoReady()) {
      const totalPatients = await Patient.countDocuments();
      const bills = await Billing.find().lean();
      return res.json(summarizeStats(totalPatients, bills));
    }

    res.json(summarizeStats(store.patients.length, store.bills));
  } catch (err) {
    next(err);
  }
});

router.get("/admin-overview", requireRole("admin"), async (req, res, next) => {
  try {
    if (isMongoReady()) {
      const Staff = require("../models/staff");
      const [patients, bills, staff] = await Promise.all([
        Patient.find().sort({ createdAt: -1 }).lean(),
        Billing.find().lean(),
        Staff.find({ active: true }).select("-passwordHash").lean()
      ]);
      return res.json(buildAdminOverview({ patients, bills, staff }));
    }

    res.json(buildAdminOverview({
      patients: store.patients,
      bills: store.bills,
      staff: store.staff
    }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
