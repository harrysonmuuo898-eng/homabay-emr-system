const Department = require("../models/department");
const { departments } = require("./departments");

async function seedDepartments() {
  if (!departments.length) return;

  for (const [index, name] of departments.entries()) {
    const deptID = `DPT-${String(index + 1).padStart(3, "0")}`;
    await Department.updateOne(
      { deptID },
      {
        $set: { name },
        $setOnInsert: { deptID, services: [] }
      },
      { upsert: true }
    );
  }
}

module.exports = {
  seedDepartments
};
