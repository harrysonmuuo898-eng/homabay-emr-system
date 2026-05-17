const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  staffID: { type: String, unique: true },
  name: String,
  department: String,
  role: { type: String, default: "Doctor" }
});

module.exports = mongoose.model('Doctor', doctorSchema);
