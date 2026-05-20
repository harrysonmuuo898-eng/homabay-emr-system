const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
  patientID: { type: String, required: true, index: true },
  requestedByDepartment: { type: String, required: true, default: "ICU" },
  bloodType: { type: String, required: true },
  amountRequested: { type: Number, required: true, min: 1 },
  urgency: { type: String, enum: ["Routine", "Urgent", "Emergency"], default: "Urgent" },
  reason: String,
  status: { type: String, enum: ["Pending", "Fulfilled", "Rejected"], default: "Pending" },
  fulfilledAt: Date,
  requestedBy: {
    staffID: String,
    name: String,
    role: String,
    department: String
  },
  fulfilledBy: {
    staffID: String,
    name: String,
    role: String,
    department: String
  }
}, { timestamps: true });

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
