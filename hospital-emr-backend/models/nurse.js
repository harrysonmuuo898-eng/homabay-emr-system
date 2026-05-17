const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  staffID: { type: String, unique: true },
  name: String,
  department: String,
  role: { type: String, default: "Nurse" }
});

module.exports = mongoose.model('Nurse', nurseSchema);
