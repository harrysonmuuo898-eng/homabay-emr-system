const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  deptID: { type: String, unique: true },
  name: String,
  services: [{ description: String, cost: Number }]
});

module.exports = mongoose.model('Department', departmentSchema);
