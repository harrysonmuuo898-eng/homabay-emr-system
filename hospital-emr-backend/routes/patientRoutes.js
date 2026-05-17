const express = require("express");
const Patient = require("../models/patient");
const Billing = require("../models/billing");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function normalizePatient(body) {
  const firstName = String(body.firstName || "").trim();
  const middleName = String(body.middleName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const name = [firstName, middleName, lastName].filter(Boolean).join(" ") || String(body.name || "").trim();

  return {
    patientID: String(body.patientID || body.id || "").trim(),
    firstName,
    middleName,
    lastName,
    name,
    patientType: String(body.patientType || body.type || "").trim(),
    dob: body.dob || undefined,
    ageYears: Number(body.ageYears || body.age || 0) || undefined,
    gender: body.gender || "",
    contact: body.contact || "",
    address: body.address || "",
    nextOfKin: body.nextOfKin || "",
    nextOfKinContact: body.nextOfKinContact || "",
    insuranceID: body.insuranceID || "",
    nationalID: body.nationalID || "",
    allergies: Array.isArray(body.allergies) ? body.allergies : String(body.allergies || "").split(",").map(item => item.trim()).filter(Boolean),
    medicalHistory: Array.isArray(body.medicalHistory) ? body.medicalHistory : []
  };
}

function patientIdPrefix(date = new Date()) {
  return `OP-H${String(date.getFullYear()).slice(-2)}`;
}

async function generatePatientID() {
  const prefix = patientIdPrefix();
  const latest = await Patient.findOne({ patientID: new RegExp(`^${prefix}-\\d+$`) })
    .sort({ patientID: -1 })
    .select("patientID")
    .lean();

  const nextNumber = latest
    ? Number(String(latest.patientID).split("-").pop() || 0) + 1
    : 1;

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

function publicPatient(patient) {
  return {
    patientID: patient.patientID,
    id: patient.patientID,
    name: patient.name,
    firstName: patient.firstName,
    middleName: patient.middleName,
    lastName: patient.lastName,
    patientType: patient.patientType,
    type: patient.patientType,
    dob: patient.dob,
    ageYears: patient.ageYears,
    gender: patient.gender,
    contact: patient.contact,
    address: patient.address,
    nextOfKin: patient.nextOfKin,
    nextOfKinContact: patient.nextOfKinContact,
    insuranceID: patient.insuranceID,
    nationalID: patient.nationalID,
    allergies: patient.allergies || [],
    medicalHistory: patient.medicalHistory || [],
    registeredBy: patient.registeredBy,
    createdAt: patient.createdAt
  };
}

router.use(requireAuth);

router.get("/", requireRole("admin", "doctor", "nurse"), async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 }).lean();
    res.json(patients.map(publicPatient));
  } catch (err) {
    next(err);
  }
});

router.get("/next-id", requireRole("admin", "nurse"), async (req, res, next) => {
  try {
    res.json({ patientID: await generatePatientID() });
  } catch (err) {
    next(err);
  }
});

router.post(["/", "/register"], requireRole("admin", "nurse"), async (req, res, next) => {
  try {
    const patient = normalizePatient(req.body);
    if (!patient.patientID) patient.patientID = await generatePatientID();

    if (!patient.firstName || !patient.middleName || !patient.lastName || !patient.patientType) {
      return res.status(400).json({ error: "Three patient names and patientType are required" });
    }

    if (!["Inpatient", "Outpatient"].includes(patient.patientType)) {
      return res.status(400).json({ error: "patientType must be Inpatient or Outpatient" });
    }

    let exists = await Patient.findOne({ patientID: patient.patientID });
    let attempts = 0;
    while (exists && patient.patientID.startsWith(`${patientIdPrefix()}-`) && attempts < 5) {
      patient.patientID = await generatePatientID();
      exists = await Patient.findOne({ patientID: patient.patientID });
      attempts += 1;
    }
    if (exists) return res.status(409).json({ error: "Patient already registered" });

    const created = await Patient.create({ ...patient, registeredBy: req.staff.staffID });
    res.status(201).json(publicPatient(created));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Patient already registered" });
    }
    next(err);
  }
});

router.get("/:patientID", requireRole("admin", "doctor", "nurse"), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patientID: req.params.patientID }).lean();
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(publicPatient(patient));
  } catch (err) {
    next(err);
  }
});

router.get("/:patientID/profile", requireRole("admin", "doctor", "nurse"), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patientID: req.params.patientID }).lean();
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const bills = await Billing.find({ patientID: req.params.patientID }).lean();
    const services = bills.flatMap(bill => bill.services || []);

    const total = services.reduce((sum, service) => sum + Number(service.cost || 0), 0);
    res.json({ patient: publicPatient(patient), services, patientServices: services, total });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
