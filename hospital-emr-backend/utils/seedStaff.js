const Staff = require("../models/staff");
const { hashPassword } = require("./auth");

function defaultStaff() {
  const users = [];

  if (process.env.DEFAULT_ADMIN_USER && process.env.DEFAULT_ADMIN_PASSWORD) {
    users.push({
      staffID: "ADM-001",
      username: process.env.DEFAULT_ADMIN_USER.trim().toLowerCase(),
      password: process.env.DEFAULT_ADMIN_PASSWORD,
      name: "System Administrator",
      role: "admin",
      department: "Administration"
    });
  }

  if (process.env.DEFAULT_DOCTOR_USER && process.env.DEFAULT_DOCTOR_PASSWORD) {
    users.push({
      staffID: "DOC-001",
      username: process.env.DEFAULT_DOCTOR_USER.trim().toLowerCase(),
      password: process.env.DEFAULT_DOCTOR_PASSWORD,
      name: "Duty Doctor",
      role: "doctor",
      department: "Consultation"
    });
  }

  if (process.env.DEFAULT_NURSE_USER && process.env.DEFAULT_NURSE_PASSWORD) {
    users.push({
      staffID: "NUR-001",
      username: process.env.DEFAULT_NURSE_USER.trim().toLowerCase(),
      password: process.env.DEFAULT_NURSE_PASSWORD,
      name: "Duty Nurse",
      role: "nurse",
      department: "Nursing"
    });
  }

  if (process.env.DEFAULT_TECH_USER && process.env.DEFAULT_TECH_PASSWORD) {
    users.push({
      staffID: "TEC-001",
      username: process.env.DEFAULT_TECH_USER.trim().toLowerCase(),
      password: process.env.DEFAULT_TECH_PASSWORD,
      name: "Department Technician",
      role: "technician",
      department: "Diagnostics"
    });
  }

  return users;
}

async function seedStaff() {
  const users = defaultStaff();
  if (!users.length) return;

  for (const user of users) {
    const exists = await Staff.findOne({ username: user.username });
    if (!exists) {
      await Staff.create({
        ...user,
        passwordHash: hashPassword(user.password)
      });
    }
  }
}

module.exports = { seedStaff };
