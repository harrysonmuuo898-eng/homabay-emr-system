const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientID: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  dob: Date,
  ageYears: Number,
  gender: String,
  contact: String,
  address: String,
  nextOfKin: String,
  nextOfKinContact: String,
  coverageType: { type: String, default: "No Insurance / Self Pay" },
  insuranceID: String,
  nationalID: String,
  patientType: { type: String, enum: ["Inpatient", "Outpatient"], required: true },
  allergies: [String],
  medicalHistory: [String],
  registeredBy: String
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
