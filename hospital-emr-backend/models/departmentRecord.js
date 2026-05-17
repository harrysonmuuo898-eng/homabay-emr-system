const mongoose = require("mongoose");

const departmentRecordSchema = new mongoose.Schema({
  patientID: { type: String, required: true, index: true },
  department: { type: String, required: true, index: true },
  description: { type: String, required: true },
  cost: { type: Number, default: 0 },
  details: mongoose.Schema.Types.Mixed,
  recordedBy: {
    staffID: String,
    name: String,
    role: String,
    department: String
  }
}, { timestamps: true });

const DepartmentRecord = mongoose.model("DepartmentRecord", departmentRecordSchema);

function departmentCollectionName(department) {
  const slug = String(department || "general")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "general";
  return `department_${slug}_records`;
}

function departmentModelName(department) {
  const collection = departmentCollectionName(department);
  return collection
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function modelForDepartment(department) {
  const modelName = departmentModelName(department);
  if (mongoose.models[modelName]) return mongoose.models[modelName];
  return mongoose.model(modelName, departmentRecordSchema, departmentCollectionName(department));
}

async function createDepartmentRecord(record) {
  const DepartmentSpecificRecord = modelForDepartment(record.department);
  const [sharedRecord, departmentRecord] = await Promise.all([
    DepartmentRecord.create(record),
    DepartmentSpecificRecord.create(record)
  ]);

  return { sharedRecord, departmentRecord };
}

module.exports = DepartmentRecord;
module.exports.departmentRecordSchema = departmentRecordSchema;
module.exports.departmentCollectionName = departmentCollectionName;
module.exports.modelForDepartment = modelForDepartment;
module.exports.createDepartmentRecord = createDepartmentRecord;
