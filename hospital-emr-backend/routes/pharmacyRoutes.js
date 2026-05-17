const express = require("express");
const Medicine = require("../models/medicine ");
const store = require("../data/store");
const { isMongoReady } = require("../utils/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", requireRole("admin", "nurse", "technician"), async (req, res, next) => {
  try {
    if (isMongoReady()) return res.json(await Medicine.find().lean());
    res.json(store.medicines);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin", "nurse", "technician"), async (req, res, next) => {
  try {
    const medicine = {
      drugID: String(req.body.drugID || store.nextId("drug")).trim(),
      name: String(req.body.name || "").trim(),
      description: String(req.body.description || "").trim(),
      price: Number(req.body.price),
      stock: Number(req.body.stock || 0)
    };

    if (!medicine.name || !Number.isFinite(medicine.price) || medicine.price < 0) {
      return res.status(400).json({ error: "name and a valid price are required" });
    }

    if (isMongoReady()) return res.status(201).json(await Medicine.create(medicine));
    store.medicines.push(medicine);
    res.status(201).json(medicine);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
