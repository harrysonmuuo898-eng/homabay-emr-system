const patients = [];
const bills = [];
const doctors = [];
const nurses = [];
const medicines = [];
const staff = [];
const departmentRecords = [];
const departmentRecordTables = {};

function findPatient(patientID) {
  return patients.find(patient => patient.patientID.toLowerCase() === String(patientID).toLowerCase());
}

function findPendingBill(patientID) {
  return bills.find(bill => bill.patientID.toLowerCase() === String(patientID).toLowerCase() && bill.status === "Pending");
}

function getPatientServices(patientID) {
  return bills
    .filter(bill => bill.patientID.toLowerCase() === String(patientID).toLowerCase())
    .flatMap(bill => bill.services || []);
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

module.exports = {
  patients,
  bills,
  doctors,
  nurses,
  medicines,
  staff,
  departmentRecords,
  departmentRecordTables,
  findPatient,
  findPendingBill,
  getPatientServices,
  nextId
};
