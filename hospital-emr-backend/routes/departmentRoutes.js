const express = require("express");
const Billing = require("../models/billing");
const { createDepartmentRecord, modelForDepartment } = require("../models/departmentRecord");
const BloodRequest = require("../models/bloodRequest");
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

function isOperationalDepartment(department) {
  return ["biomedic", "ict"].includes(String(department || "").trim().toLowerCase());
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

function normalizeBloodType(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function parseBloodAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const match = String(value || "").replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function emptyBloodInventory() {
  return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].reduce((summary, type) => {
    summary[type] = { bloodType: type, amountCollected: 0, amountAvailable: 0, units: 0 };
    return summary;
  }, {});
}

async function buildBloodInventory() {
  const inventory = emptyBloodInventory();

  if (isMongoReady()) {
    const BloodDonationRecord = modelForDepartment("Blood Donation");
    const [donations, fulfilledRequests] = await Promise.all([
      BloodDonationRecord.find().lean(),
      BloodRequest.find({ status: "Fulfilled" }).lean()
    ]);

    donations.forEach(record => {
      const type = normalizeBloodType(record.details?.bloodType || record.details?.bloodGroup);
      if (!inventory[type]) return;
      const amount = parseBloodAmount(record.details?.amountCollected || record.details?.volume);
      inventory[type].amountCollected += amount;
      inventory[type].amountAvailable += amount;
      inventory[type].units += 1;
    });

    fulfilledRequests.forEach(request => {
      const type = normalizeBloodType(request.bloodType);
      if (inventory[type]) inventory[type].amountAvailable -= parseBloodAmount(request.amountRequested);
    });

    return Object.values(inventory);
  }

  (store.departmentRecordTables["Blood Donation"] || []).forEach(record => {
    const type = normalizeBloodType(record.details?.bloodType || record.details?.bloodGroup);
    if (!inventory[type]) return;
    const amount = parseBloodAmount(record.details?.amountCollected || record.details?.volume);
    inventory[type].amountCollected += amount;
    inventory[type].amountAvailable += amount;
    inventory[type].units += 1;
  });

  store.bloodRequests
    .filter(request => request.status === "Fulfilled")
    .forEach(request => {
      const type = normalizeBloodType(request.bloodType);
      if (inventory[type]) inventory[type].amountAvailable -= parseBloodAmount(request.amountRequested);
    });

  return Object.values(inventory);
}

/**
 * POST /add - Record a department service for a patient
 * Creates or updates a billing record with service details
 * Accessible by: admin, doctor, nurse, technician
 */
router.post("/add", requireRole("admin", "doctor", "nurse", "technician"), async (req, res, next) => {
  try {
    let patientID = String(req.body.patientID || req.body.id || "").trim();
    const service = normalizeService(req.body);
    const isBloodDonation = service.department.toLowerCase() === "blood donation";
    const isExternalBloodDonation = isBloodDonation && !patientID;
    const isOperationalRecord = isOperationalDepartment(service.department);

    if (isExternalBloodDonation) {
      patientID = `DONOR-${Date.now()}`;
      service.details.donorReference = patientID;
    }
    if (isOperationalRecord && !patientID) {
      patientID = `${service.department.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${Date.now()}`;
      service.details.jobReference = patientID;
    }

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
      const patient = (isExternalBloodDonation || isOperationalRecord) ? null : await Patient.findOne({ patientID });
      if (!isExternalBloodDonation && !isOperationalRecord && !patient) {
        console.error("[DeptAdd] Patient not found (MongoDB):", patientID);
        return res.status(404).json({ error: "Patient not found" });
      }

      if (service.department.toLowerCase() === "mortuary" && !service.details.mortuaryID) {
        service.details.mortuaryID = await generateMortuaryID();
      }

      const staffSummary = recordedBy(req.staff);
      if (isExternalBloodDonation) {
        const record = await createDepartmentRecord({ patientID, ...service, recordedBy: staffSummary });
        console.log("[DeptAdd] External blood donation recorded (MongoDB):", patientID);
        return res.status(201).json(record.departmentRecord);
      }
      if (isOperationalRecord) {
        const record = await createDepartmentRecord({ patientID, ...service, recordedBy: staffSummary });
        console.log("[DeptAdd] Operational department record saved (MongoDB):", patientID, service.department);
        return res.status(201).json(record.departmentRecord);
      }

      let bill = await Billing.findOne({ patientID, status: "Pending" });
      if (!bill) bill = new Billing({ patientID, services: [], totalAmount: 0, status: "Pending" });
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
    if (!isExternalBloodDonation && !isOperationalRecord && !store.findPatient(patientID)) {
      console.error("[DeptAdd] Patient not found (Store):", patientID);
      return res.status(404).json({ error: "Patient not found" });
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

    if (isExternalBloodDonation) {
      const record = {
        _id: store.nextId("department-record"),
        patientID,
        ...serviceRecord
      };
      storeDepartmentRecord(record);
      console.log("[DeptAdd] External blood donation recorded (Store):", patientID);
      return res.status(201).json(record);
    }
    if (isOperationalRecord) {
      const record = {
        _id: store.nextId("department-record"),
        patientID,
        ...serviceRecord
      };
      storeDepartmentRecord(record);
      console.log("[DeptAdd] Operational department record saved (Store):", patientID, service.department);
      return res.status(201).json(record);
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

router.get("/blood/inventory", requireRole("admin", "doctor", "nurse", "technician"), async (req, res, next) => {
  try {
    res.json(await buildBloodInventory());
  } catch (err) {
    next(err);
  }
});

router.get("/blood/requests", requireRole("admin", "doctor", "nurse", "technician"), async (req, res, next) => {
  try {
    if (isMongoReady()) {
      const requests = await BloodRequest.find().sort({ createdAt: -1 }).limit(100).lean();
      return res.json(requests);
    }

    res.json(store.bloodRequests.slice(-100).reverse());
  } catch (err) {
    next(err);
  }
});

router.post("/blood/requests", requireRole("admin", "doctor", "nurse"), async (req, res, next) => {
  try {
    const patientID = String(req.body.patientID || "").trim();
    const bloodType = normalizeBloodType(req.body.bloodType);
    const amountRequested = parseBloodAmount(req.body.amountRequested);
    const requestedByDepartment = String(req.body.requestedByDepartment || "ICU").trim() || "ICU";
    const urgency = String(req.body.urgency || "Urgent").trim();
    const reason = String(req.body.reason || "").trim();

    if (!patientID) return res.status(400).json({ error: "patientID is required" });
    if (!bloodType) return res.status(400).json({ error: "bloodType is required" });
    if (!amountRequested) return res.status(400).json({ error: "amountRequested must be a positive number" });

    const requestPayload = {
      patientID,
      requestedByDepartment,
      bloodType,
      amountRequested,
      urgency: ["Routine", "Urgent", "Emergency"].includes(urgency) ? urgency : "Urgent",
      reason,
      status: "Pending",
      requestedBy: recordedBy(req.staff)
    };

    if (isMongoReady()) {
      const Patient = require("../models/patient");
      const patient = await Patient.findOne({ patientID });
      if (!patient) return res.status(404).json({ error: "Patient not found" });
      const created = await BloodRequest.create(requestPayload);
      return res.status(201).json(created);
    }

    if (!store.findPatient(patientID)) return res.status(404).json({ error: "Patient not found" });
    const created = {
      _id: store.nextId("blood-request"),
      ...requestPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.bloodRequests.push(created);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.post("/blood/requests/:id/fulfill", requireRole("admin", "nurse", "technician"), async (req, res, next) => {
  try {
    if (isMongoReady()) {
      const request = await BloodRequest.findById(req.params.id);
      if (!request) return res.status(404).json({ error: "Blood request not found" });
      request.status = "Fulfilled";
      request.fulfilledAt = new Date();
      request.fulfilledBy = recordedBy(req.staff);
      await request.save();
      return res.json(request);
    }

    const request = store.bloodRequests.find(item => item._id === req.params.id);
    if (!request) return res.status(404).json({ error: "Blood request not found" });
    request.status = "Fulfilled";
    request.fulfilledAt = new Date().toISOString();
    request.fulfilledBy = recordedBy(req.staff);
    request.updatedAt = new Date().toISOString();
    res.json(request);
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
