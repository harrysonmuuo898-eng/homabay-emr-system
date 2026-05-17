const express = require("express");
const Staff = require("../models/staff");
const { verifyPassword, signToken, hashPassword } = require("../utils/auth");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function publicStaff(staff) {
  return {
    staffID: staff.staffID,
    username: staff.username,
    name: staff.name,
    role: staff.role,
    department: staff.department,
    active: staff.active !== false
  };
}

async function findStaff(username) {
  const cleanUsername = String(username || "").trim().toLowerCase();
  return Staff.findOne({ username: cleanUsername, active: true }).lean();
}

router.get("/status", async (req, res, next) => {
  try {
    const count = await Staff.countDocuments();
    res.json({ registrationOpen: count === 0 });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const staff = await findStaff(req.body.username);
    if (!staff || !verifyPassword(req.body.password, staff.passwordHash)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({
      token: signToken(staff),
      staff: publicStaff(staff)
    });
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const existing = await Staff.countDocuments();
    if (existing > 0) {
      return res.status(403).json({ error: "Registration is closed. Sign in as an admin user to create new staff." });
    }

    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();
    const staffID = String(req.body.staffID || "").trim();
    const name = String(req.body.name || "").trim();
    const role = String(req.body.role || "admin").trim().toLowerCase();
    const department = String(req.body.department || "Administration").trim();

    if (!staffID || !username || !password || !name) {
      return res.status(400).json({ error: "staffID, username, password and name are required" });
    }

    const validRoles = ["admin", "doctor", "nurse", "technician", "staff"];
    const normalizedRole = validRoles.includes(role) ? role : "admin";

    const created = await Staff.create({
      staffID,
      username,
      passwordHash: hashPassword(password),
      name,
      role: normalizedRole,
      department,
      active: true
    });

    res.status(201).json({
      token: signToken(created),
      staff: publicStaff(created)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Staff user already exists" });
    }
    next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ staff: publicStaff(req.staff) });
});

router.get("/staff-list", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const staff = await Staff.find({ active: true }).select("-passwordHash").lean();
    res.json(staff);
  } catch (err) {
    next(err);
  }
});

router.post("/staff", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const staff = {
      staffID: String(req.body.staffID || "").trim(),
      username: String(req.body.username || "").trim().toLowerCase(),
      passwordHash: hashPassword(req.body.password || "ChangeMe123"),
      name: String(req.body.name || "").trim(),
      role: String(req.body.role || "staff").trim(),
      department: String(req.body.department || "General").trim(),
      active: true
    };

    if (!staff.staffID || !staff.username || !staff.name || !staff.role) {
      return res.status(400).json({ error: "staffID, username, name and role are required" });
    }

    const validRoles = ["admin", "doctor", "nurse", "technician", "staff"];
    if (!validRoles.includes(staff.role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    const created = await Staff.create(staff);
    return res.status(201).json({
      staffID: created.staffID,
      username: created.username,
      name: created.name,
      role: created.role,
      department: created.department,
      active: created.active
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ error: `${field} already exists` });
    }
    next(err);
  }
});


module.exports = router;
