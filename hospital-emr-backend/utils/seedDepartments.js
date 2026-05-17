const Department = require("../models/department");
const { departments } = require("./departments");

async function seedDepartments() {
  if (!departments.length) return;

  for (const [index, name] of departments.entries()) {
    const deptID = `DPT-${String(index + 1).padStart(3, "0")}`;
    const existing = await Department.findOne({ name });
    if (!existing) {
      await Department.create({ deptID, name, services: [] });
    }
  }
}

module.exports = {
  seedDepartments
};
