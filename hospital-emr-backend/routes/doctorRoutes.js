const express = require("express");
const Doctor = require("../models/doctor");
const store = require("../data/store");
const { isMongoReady } = require("../utils/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", requireRole("admin"), async (req, res, next) => {
  try {
    if (isMongoReady()) return res.json(await Doctor.find().lean());
    res.json(store.doctors);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const doctor = {
      staffID: String(req.body.staffID || "").trim(),
      name: String(req.body.name || "").trim(),
      department: String(req.body.department || "General").trim(),
      role: "Doctor"
    };

    if (!doctor.staffID || !doctor.name) {
      return res.status(400).json({ error: "staffID and name are required" });
    }

    if (isMongoReady()) return res.status(201).json(await Doctor.create(doctor));
    if (store.doctors.some(item => item.staffID === doctor.staffID)) {
      return res.status(409).json({ error: "Doctor already exists" });
    }
    store.doctors.push(doctor);
    res.status(201).json(doctor);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
