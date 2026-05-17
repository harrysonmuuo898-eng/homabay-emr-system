const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  staffID: { type: String, required: true, unique: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "doctor", "nurse", "technician", "staff"]
  },
  department: { type: String, default: "General" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
