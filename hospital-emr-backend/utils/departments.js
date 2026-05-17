const departments = [
  "Administration",
  "Consultation",
  "Nursing",
  "Diagnostics",
  "General",
  "SHA",
  "Mortuary",
  "Blood Donation",
  "Rental",
  "Funzone",
  "MCH",
  "Maternity",
  "MRI",
  "Theatre",
  "Wards",
  "Pharmacy",
  "Eye Clinic",
  "Laboratory",
  "Chronic Centre",
  "ICT"
];

function normalizeDepartment(input, fallback = null) {
  if (!input || typeof input !== "string") return fallback;
  const clean = input.trim();
  const match = departments.find(dept => dept.toLowerCase() === clean.toLowerCase());
  return match || clean;
}

module.exports = {
  departments,
  normalizeDepartment
};
