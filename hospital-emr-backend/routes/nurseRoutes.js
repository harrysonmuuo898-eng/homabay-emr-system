const express = require("express");
const Nurse = require("../models/nurse");
const store = require("../data/store");
const { isMongoReady } = require("../utils/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", requireRole("admin"), async (req, res, next) => {
  try {
    if (isMongoReady()) return res.json(await Nurse.find().lean());
    res.json(store.nurses);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const nurse = {
      staffID: String(req.body.staffID || "").trim(),
      name: String(req.body.name || "").trim(),
      department: String(req.body.department || "General").trim(),
      role: "Nurse"
    };

    if (!nurse.staffID || !nurse.name) {
      return res.status(400).json({ error: "staffID and name are required" });
    }

    if (isMongoReady()) return res.status(201).json(await Nurse.create(nurse));
    if (store.nurses.some(item => item.staffID === nurse.staffID)) {
      return res.status(409).json({ error: "Nurse already exists" });
    }
    store.nurses.push(nurse);
    res.status(201).json(nurse);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
