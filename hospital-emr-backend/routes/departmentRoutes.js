const express = require("express");
const Billing = require("../models/billing");
const { createDepartmentRecord, modelForDepartment } = require("../models/departmentRecord");
const store = require("../data/store");
const { isMongoReady } = require("../utils/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * Normalizes service data from request body
 * @param {Object} body - Request body containing service data
 * @returns {Object} Normalized service object with department, description, cost, details
 */
function normalizeService(body) {
  const details = body.details && typeof body.details === "object" ? body.details : {};
  return {
    department: String(body.department || "").trim(),
    description: String(body.description || "").trim(),
    cost: Number(body.cost),
    details
  };
}

router.use(requireAuth);

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

function mortuaryIdPrefix(date = new Date()) {
  return `MOR-H${String(date.getFullYear()).slice(-2)}`;
}

async function generateMortuaryID() {
  const prefix = mortuaryIdPrefix();
  const MortuaryRecord = modelForDepartment("Mortuary");
  const latest = await MortuaryRecord.findOne({ "details.mortuaryID": new RegExp(`^${prefix}-\\d+$`) })
    .sort({ "details.mortuaryID": -1 })
    .select("details.mortuaryID")
    .lean();
  const nextNumber = latest?.details?.mortuaryID
    ? Number(String(latest.details.mortuaryID).split("-").pop() || 0) + 1
    : 1;
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

/**
 * POST /add - Record a department service for a patient
 * Creates or updates a billing record with service details
 * Accessible by: admin, doctor, nurse, technician
 */
router.post("/add", requireRole("admin", "doctor", "nurse", "technician"), async (req, res, next) => {
  try {
    const patientID = String(req.body.patientID || req.body.id || "").trim();
    const service = normalizeService(req.body);

    // Validation: Required fields
    if (!patientID) {
      console.error("[DeptAdd] Missing patientID");
      return res.status(400).json({ error: "patientID is required" });
    }
    if (!service.department || !service.description) {
      console.error("[DeptAdd] Missing department or description for patient:", patientID);
      return res.status(400).json({ error: "department and description are required" });
    }
    if (!Number.isFinite(service.cost) || service.cost <= 0) {
      console.error("[DeptAdd] Invalid cost for patient:", patientID, "cost:", service.cost);
      return res.status(400).json({ error: "cost must be a positive number" });
    }

    // MongoDB path
    if (isMongoReady()) {
      const Patient = require("../models/patient");
      const patient = await Patient.findOne({ patientID });
      if (!patient) {
        console.error("[DeptAdd] Patient not found (MongoDB):", patientID);
        return res.status(404).json({ error: "Patient not found" });
      }

      let bill = await Billing.findOne({ patientID, status: "Pending" });
      if (!bill) bill = new Billing({ patientID, services: [], totalAmount: 0, status: "Pending" });
      if (service.department.toLowerCase() === "mortuary" && !service.details.mortuaryID) {
        service.details.mortuaryID = await generateMortuaryID();
      }

      const staffSummary = recordedBy(req.staff);
      bill.services.push({
        ...service,
        recordedBy: staffSummary
      });
      bill.totalAmount += service.cost;
      await Promise.all([
        bill.save(),
        createDepartmentRecord({ patientID, ...service, recordedBy: staffSummary })
      ]);
      console.log("[DeptAdd] Service recorded successfully (MongoDB):", patientID, service.department);
      return res.status(201).json(bill);
    }

    // In-memory store path (fallback)
    if (!store.findPatient(patientID)) {
      console.error("[DeptAdd] Patient not found (Store):", patientID);
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
    if (service.department.toLowerCase() === "mortuary" && !service.details.mortuaryID) {
      service.details.mortuaryID = `MOR-H${String(new Date().getFullYear()).slice(-2)}-${String(store.departmentRecordTables.Mortuary?.length + 1 || 1).padStart(4, "0")}`;
    }

    const staffSummary = recordedBy(req.staff);
    const serviceRecord = {
      ...service,
      recordedBy: staffSummary,
      createdAt: new Date().toISOString()
    };
    bill.services.push(serviceRecord);
    storeDepartmentRecord({
      _id: store.nextId("department-record"),
      patientID,
      ...serviceRecord
    });
    bill.totalAmount += service.cost;
    console.log("[DeptAdd] Service recorded successfully (Store):", patientID, service.department);
    res.status(201).json(bill);
  } catch (err) {
    console.error("[DeptAdd] Error recording service:", err.message);
    next(err);
  }
});

router.get("/records/:department", requireRole("admin", "doctor", "nurse", "technician"), async (req, res, next) => {
  try {
    const department = String(req.params.department || "").trim();
    if (!department) return res.status(400).json({ error: "Department is required" });

    if (isMongoReady()) {
      const DepartmentSpecificRecord = modelForDepartment(department);
      const records = await DepartmentSpecificRecord.find().sort({ createdAt: -1 }).limit(100).lean();
      return res.json(records);
    }

    res.json((store.departmentRecordTables[department] || []).slice(-100).reverse());
  } catch (err) {
    next(err);
  }
});

/**
 * GET /services/:patientID - Retrieve all services for a patient
 * Returns array of services from all billing records
 * Accessible by: admin, doctor, nurse
 */
router.get("/services/:patientID", requireRole("admin", "doctor", "nurse"), async (req, res, next) => {
  try {
    const patientID = req.params.patientID;
    console.log("[DeptServices] Fetching services for patient:", patientID);
    
    if (isMongoReady()) {
      const bills = await Billing.find({ patientID }).lean();
      const services = bills.flatMap(bill => bill.services || []);
      console.log("[DeptServices] Found", services.length, "services (MongoDB)");
      return res.json(services);
    }

    const services = store.getPatientServices(patientID);
    console.log("[DeptServices] Found", services.length, "services (Store)");
    res.json(services);
  } catch (err) {
    console.error("[DeptServices] Error fetching services:", err.message);
    next(err);
  }
});

module.exports = router;
