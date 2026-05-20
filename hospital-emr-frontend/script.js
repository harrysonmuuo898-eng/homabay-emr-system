const STORAGE_KEY = "referralHospitalEmr";
const AUTH_KEY = "referralHospitalAuth";

let API_BASE = window.EMR_API_BASE || (
  location.protocol === "file:" ? "http://localhost:5000/api" : `${location.origin}/api`
);

async function loadRuntimeConfig() {
  if (window.EMR_API_BASE) {
    API_BASE = window.EMR_API_BASE;
    return;
  }

  try {
    const response = await fetch("/config.json", { cache: "no-store" });
    if (!response.ok) return;

    const config = await response.json();
    const apiBase = String(config.apiBase || "").trim();
    if (apiBase && !apiBase.includes("YOUR-BACKEND-URL")) {
      API_BASE = apiBase.replace(/\/$/, "");
    }
  } catch {
    // Local file previews and older deployments can continue using the default API base.
  }
}

const navItems = [
  ["Home", "../index.html", "index.html", []],
  ["Registration", "registration.html", null, ["admin", "nurse"]],
  ["Doctor", "doctor.html", null, ["admin", "doctor"]],
  ["Nurse", "nurse.html", null, ["admin", "nurse"]],
  ["Lab", "laboratory.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["Radiology", "radiology.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["X-Ray", "xray.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["MRI", "mri.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["Eye", "eye.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["ICU", "icu.html", null, ["admin", "doctor", "nurse"]],
  ["HDU", "hdu.html", null, ["admin", "doctor", "nurse"]],
  ["Maternity", "maternity.html", null, ["admin", "doctor", "nurse"]],
  ["MCH", "mch.html", null, ["admin", "doctor", "nurse"]],
  ["Theatre", "theatre.html", null, ["admin", "doctor", "nurse"]],
  ["Wards", "wards.html", null, ["admin", "doctor", "nurse"]],
  ["Pharmacy", "pharmacy.html", null, ["admin", "nurse", "technician"]],
  ["Chronic", "chronic.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["OPD", "opd.html", null, ["admin", "doctor", "nurse"]],
  ["Dental", "dental.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["Hope Center", "hope-center.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["Mental Health", "mental-health.html", null, ["admin", "doctor", "nurse"]],
  ["Stress Counseling", "stress-counseling.html", null, ["admin", "doctor", "nurse"]],
  ["Therapy", "therapy-records.html", null, ["admin", "doctor", "nurse"]],
  ["Biomedic", "biomedic.html", null, ["admin", "technician"]],
  ["ICT", "ict.html", null, ["admin", "technician"]],
  ["Blood", "blood donation.html", null, ["admin", "nurse", "technician"]],
  ["Mortuary", "mortuary.html", null, ["admin", "doctor"]],
  ["Rental", "rental.html", null, ["admin"]],
  ["Billing", "billing.html", null, ["admin", "nurse"]],
  ["Profile", "patientprofile.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["Staff", "staff.html", null, ["admin"]],
  ["Admin", "admin.html", null, ["admin"]]
];

const allDepartments = [
  { name: "Departments", file: "departments.html", image: "images/departments.svg", label: "Browse every workspace" },
  { name: "Registration", file: "registration.html", image: "images/registration.svg", label: "Patient intake and admissions" },
  { name: "Doctor", file: "doctor.html", image: "images/doctor.svg", label: "Clinical review and consultations" },
  { name: "Nurse", file: "nurse.html", image: "images/nurse.svg", label: "Nursing workflow and care plans" },
  { name: "Laboratory", file: "laboratory.html", image: "images/laboratory.svg", label: "Diagnostics and lab results" },
  { name: "Radiology", file: "radiology.html", image: "images/xray.svg", label: "Full body and bone scanning" },
  { name: "X-Ray", file: "xray.html", image: "images/xray.svg", label: "Radiology imaging unit" },
  { name: "MRI", file: "mri.html", image: "images/mri.svg", label: "Advanced diagnostic scans" },
  { name: "Eye Care", file: "eye.html", image: "images/eye.svg", label: "Ophthalmology services" },
  { name: "ICU", file: "icu.html", image: "images/icu.svg", label: "Critical care monitoring" },
  { name: "HDU", file: "hdu.html", image: "images/icu.svg", label: "High-dependency isolation care" },
  { name: "Maternity", file: "maternity.html", image: "images/maternity.svg", label: "Maternal health support" },
  { name: "MCH", file: "mch.html", image: "images/mch.svg", label: "Mother-child health services" },
  { name: "Theatre", file: "theatre.html", image: "images/theatre.svg", label: "Surgical theatre coordination" },
  { name: "Wards", file: "wards.html", image: "images/wards.svg", label: "Inpatient room assignments" },
  { name: "Pharmacy", file: "pharmacy.html", image: "images/pharmacy.svg", label: "Medication dispensing unit" },
  { name: "Chronic Centre", file: "chronic.html", image: "images/chronic.svg", label: "HIV/AIDS and TB care follow-up" },
  { name: "Outpatient Department", file: "opd.html", image: "images/doctor.svg", label: "OPD triage, review, and referrals" },
  { name: "Dental Department", file: "dental.html", image: "images/clinical-team.svg", label: "Dental visits and oral care records" },
  { name: "Hope Center", file: "hope-center.html", image: "images/chronic.svg", label: "Hope Center program support" },
  { name: "Mental Health", file: "mental-health.html", image: "images/clinical-team.svg", label: "Mental health reviews and care plans" },
  { name: "Stress Counseling", file: "stress-counseling.html", image: "images/profile.svg", label: "Stress assessment and counseling notes" },
  { name: "Therapy Records", file: "therapy-records.html", image: "images/profile.svg", label: "Therapy sessions and progress notes" },
  { name: "Biomedic", file: "biomedic.html", image: "images/ict.svg", label: "Biomedical equipment service records" },
  { name: "ICT", file: "ict.html", image: "images/ict.svg", label: "System, device, and network support" },
  { name: "Blood Bank", file: "blood donation.html", image: "images/blood-donation.svg", label: "Blood collection and tracking" },
  { name: "Mortuary", file: "mortuary.html", image: "images/mortuary.svg", label: "Postmortem and records" },
  { name: "Billing", file: "billing.html", image: "images/billing.svg", label: "Invoice and payment processing" },
  { name: "Patient Profile", file: "patientprofile.html", image: "images/profile.svg", label: "Patient records and history" },
  { name: "Admin", file: "admin.html", image: "images/admin.svg", label: "System settings and analytics" },
  { name: "Staff", file: "staff.html", image: "images/staff.svg", label: "Manage hospital personnel" },
  { name: "Rental", file: "rental.html", image: "images/rental.svg", label: "Facility rental services" }
];

const departmentVisuals = {
  "admin dashboard": "admin.svg",
  billing: "billing.svg",
  "blood donation": "blood-donation.svg",
  "doctor dashboard": "doctor.svg",
  "eye clinic": "eye.svg",
  "icu department": "icu.svg",
  "laboratory department": "laboratory.svg",
  "maternity department": "maternity.svg",
  "mch department": "mch.svg",
  "mortuary department": "mortuary.svg",
  "mri department": "mri.svg",
  "nurse dashboard": "nurse.svg",
  "patient profile": "profile.svg",
  pharmacy: "pharmacy.svg",
  "radiology department": "xray.svg",
  "chronic centre": "chronic.svg",
  "outpatient department": "doctor.svg",
  "dental department": "clinical-team.svg",
  "hope center": "chronic.svg",
  "mental health": "clinical-team.svg",
  "stress counseling": "profile.svg",
  "therapy records": "profile.svg",
  biomedic: "ict.svg",
  "hdu department": "icu.svg",
  "ict department": "ict.svg",
  "patient registration": "registration.svg",
  "rental department": "rental.svg",
  "staff management": "staff.svg",
  "theatre department": "theatre.svg",
  "wards department": "wards.svg",
  "x-ray department": "xray.svg"
};

const departmentCapabilities = {
  "admin dashboard": ["Department oversight", "Staff totals", "Patient totals", "Revenue review", "System reports"],
  billing: ["Generate bill", "Review patient services", "SHA payment", "M-Pesa payment", "Receipt totals"],
  "blood donation": ["Donor record", "Blood group", "Screening status", "Unit number", "Blood collection tracking"],
  "chronic centre": ["HIV/AIDS visit", "TB care visit", "Medicine refill", "Missed dose tracking", "Viral load/CD4", "Next clinic date"],
  "doctor dashboard": ["Consultation", "Diagnosis", "Treatment plan", "Prescription", "Referral", "Follow-up date"],
  "eye clinic": ["Visual acuity", "Eye pressure", "Eye diagnosis", "Treatment", "Follow-up"],
  "ict department": ["System issue", "Network issue", "Device issue", "Printer/scanner issue", "User account support", "Resolution notes"],
  "icu department": ["ICU admission", "Bed number", "Critical level", "Monitoring plan", "Daily review"],
  "laboratory department": ["Lab test", "Specimen", "Sample ID", "Result summary", "Verification"],
  "maternity department": ["Maternity visit", "Fetal status", "Delivery plan", "Procedure notes", "Follow-up"],
  "mch department": ["ANC/PNC service", "Immunization", "Growth monitoring", "Next visit", "Vaccine batch"],
  "mortuary department": ["Body admission", "Public/private storage", "Viewing request", "Cause-of-death review", "Postmortem", "Release", "Six-month disposal"],
  "mri department": ["MRI scan", "Contrast status", "Safety checklist", "Radiology report", "Radiologist review"],
  "nurse dashboard": ["Vitals", "Nursing intervention", "Medication given", "Patient response", "Shift notes"],
  "patient profile": ["Patient details", "Care timeline", "Services history", "Total cost", "Clinical alerts"],
  pharmacy: ["Medication dispensing", "Prescription number", "Dispensing status", "Pharmacist notes", "Stock handoff"],
  "radiology department": ["Full body scan", "Bone scan", "Trauma imaging", "Radiology report", "Contrast status"],
  "outpatient department": ["Triage", "Chief complaint", "Clinical review", "Referral", "Disposition"],
  "dental department": ["Dental exam", "Tooth chart", "Procedure", "Oral health notes", "Follow-up"],
  "hope center": ["Program visit", "Counseling", "Adherence", "Community follow-up", "Next appointment"],
  "mental health": ["Assessment", "Risk level", "Diagnosis", "Care plan", "Follow-up"],
  "stress counseling": ["Stress score", "Counseling session", "Coping plan", "Review date", "Progress notes"],
  "therapy records": ["Therapy session", "Goal tracking", "Intervention", "Progress", "Next session"],
  biomedic: ["Equipment service", "Asset number", "Fault report", "Maintenance status", "Engineer notes"],
  "patient registration": ["Auto patient ID", "Patient identity", "Next of kin", "Insurance/SHA ID", "Allergies", "Medical history"],
  "hdu department": ["Isolation admission", "Contagious disease", "PPE level", "Vitals monitoring", "Infection control"],
  "rental department": ["Asset issue", "Room/facility rental", "Return status", "Approval", "Rental notes"],
  "staff management": ["Create staff account", "Assign role", "Assign department", "Manage access"],
  "theatre department": ["Surgery type", "Anesthesia", "Consent", "Surgeon", "Operative notes", "Outcome"],
  "wards department": ["Ward admission", "Bed assignment", "Daily care", "Discharge plan", "Progress notes"],
  "x-ray department": ["X-Ray imaging", "Image number", "Report status", "Radiographer", "Radiology findings"]
};

const capabilityTargets = {
  "blood donation": {
    "Donor record": "[name='donorName']",
    "Blood group": "[name='bloodType']",
    "Screening status": "[name='screeningStatus']",
    "Unit number": "[name='unitNumber']",
    "Blood collection tracking": "#bloodInventory"
  }
};

const reliabilityFields = {
  Doctor: [
    ["Priority", "select", "priority", ["Routine", "Urgent", "Emergency"]],
    ["Clinical Status", "select", "clinicalStatus", ["Stable", "Needs review", "Admit", "Refer"]],
    ["Reviewing Doctor", "input", "reviewingDoctor"]
  ],
  Nurse: [
    ["Pain Score", "input", "painScore"],
    ["Care Status", "select", "careStatus", ["Completed", "Ongoing", "Escalated"]],
    ["Shift", "select", "shift", ["Morning", "Evening", "Night"]]
  ],
  Laboratory: [
    ["Sample ID", "input", "sampleID"],
    ["Result Status", "select", "resultStatus", ["Pending", "Preliminary", "Verified"]],
    ["Verified By", "input", "verifiedBy"]
  ],
  "X-Ray": [
    ["Image Number", "input", "imageNumber"],
    ["Report Status", "select", "reportStatus", ["Pending", "Reported", "Reviewed"]],
    ["Radiographer", "input", "radiographer"]
  ],
  MRI: [
    ["Scan Number", "input", "scanNumber"],
    ["Safety Checklist", "select", "safetyChecklist", ["Completed", "Pending"]],
    ["Radiologist", "input", "radiologist"]
  ],
  Radiology: [
    ["Scan Number", "input", "scanNumber"],
    ["Scan Scope", "select", "scanScope", ["Full body", "Bones", "Spine", "Chest", "Abdomen", "Trauma series"]],
    ["Radiologist", "input", "radiologist"]
  ],
  "Eye Clinic": [
    ["Left Eye VA", "input", "leftEyeAcuity"],
    ["Right Eye VA", "input", "rightEyeAcuity"],
    ["Follow-up Required", "select", "followUpRequired", ["No", "Yes"]]
  ],
  ICU: [
    ["Bed Number", "input", "bedNumber"],
    ["Critical Level", "select", "criticalLevel", ["Stable", "Guarded", "Critical"]],
    ["Monitoring Plan", "textarea", "monitoringPlan"]
  ],
  HDU: [
    ["Isolation Room", "input", "isolationRoom"],
    ["Disease Risk", "select", "diseaseRisk", ["Ebola", "Corona", "TB", "Other contagious disease"]],
    ["PPE Level", "select", "ppeLevel", ["Standard", "Droplet", "Airborne", "Full barrier"]]
  ],
  Maternity: [
    ["Gravida / Para", "input", "gravidaPara"],
    ["Fetal Status", "select", "fetalStatus", ["Normal", "Watch", "Urgent review"]],
    ["Delivery Plan", "textarea", "deliveryPlan"]
  ],
  MCH: [
    ["Clinic Type", "select", "clinicType", ["ANC", "PNC", "Immunization", "Growth monitoring"]],
    ["Next Visit", "input", "nextVisit", null, "date"],
    ["Vaccine / Service Batch", "input", "batchNumber"]
  ],
  Theatre: [
    ["Surgeon", "input", "surgeon"],
    ["Procedure Status", "select", "procedureStatus", ["Scheduled", "Completed", "Cancelled"]],
    ["Consent Confirmed", "select", "consentConfirmed", ["Yes", "No"]]
  ],
  Wards: [
    ["Admission Status", "select", "admissionStatus", ["Admitted", "Observation", "Discharged"]],
    ["Attending Clinician", "input", "attendingClinician"],
    ["Discharge Plan", "textarea", "dischargePlan"]
  ],
  Pharmacy: [
    ["Prescription Number", "input", "prescriptionNumber"],
    ["Dispensing Status", "select", "dispensingStatus", ["Pending", "Dispensed", "Partially dispensed"]],
    ["Pharmacist", "input", "pharmacist"]
  ],
  "Chronic Centre": [
    ["Program", "select", "program", ["HIV/AIDS Care", "TB Care", "HIV/TB Co-infection"]],
    ["Adherence", "select", "adherence", ["Good", "Missed doses", "Interrupted treatment"]],
    ["Next Refill Date", "input", "nextRefillDate", null, "date"]
  ],
  "Outpatient Department": [
    ["Triage Level", "select", "triageLevel", ["Routine", "Urgent", "Emergency"]],
    ["Disposition", "select", "disposition", ["Treat and discharge", "Review", "Refer", "Admit"]],
    ["Reviewing Clinician", "input", "reviewingClinician"]
  ],
  "Dental Department": [
    ["Tooth Number / Area", "input", "toothArea"],
    ["Procedure Status", "select", "procedureStatus", ["Planned", "Completed", "Referred"]],
    ["Dentist", "input", "dentist"]
  ],
  "Hope Center": [
    ["Program", "select", "program", ["Counseling", "Adherence support", "Community follow-up", "Health education"]],
    ["Visit Status", "select", "status", ["Completed", "Needs follow-up", "Referred"]],
    ["Next Appointment", "input", "nextAppointment", null, "date"]
  ],
  "Mental Health": [
    ["Risk Level", "select", "riskLevel", ["Low", "Moderate", "High", "Emergency"]],
    ["Care Status", "select", "status", ["Stable", "Needs review", "Referred"]],
    ["Clinician", "input", "clinician"]
  ],
  "Stress Counseling": [
    ["Stress Level", "select", "stressLevel", ["Mild", "Moderate", "Severe"]],
    ["Session Status", "select", "status", ["Completed", "Follow-up needed", "Referred"]],
    ["Counselor", "input", "counselor"]
  ],
  "Therapy Records": [
    ["Therapy Type", "select", "therapyType", ["Individual", "Group", "Family", "Rehabilitation"]],
    ["Progress", "select", "progress", ["Improving", "Stable", "Needs support"]],
    ["Therapist", "input", "therapist"]
  ],
  Biomedic: [
    ["Asset Number", "input", "assetNumber"],
    ["Maintenance Status", "select", "maintenanceStatus", ["Open", "In progress", "Resolved", "Decommissioned"]],
    ["Biomedical Engineer", "input", "biomedicalEngineer"]
  ],
  ICT: [
    ["Department Affected", "input", "departmentAffected"],
    ["Priority", "select", "priority", ["Routine", "Urgent", "Critical"]],
    ["Resolution Status", "select", "status", ["Open", "In progress", "Resolved", "Escalated"]]
  ],
  "Blood Donation": [
    ["Blood Group", "select", "bloodType", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
    ["Screening Status", "select", "screeningStatus", ["Pending", "Passed", "Deferred"]],
    ["Unit Number", "input", "unitNumber"]
  ],
  Mortuary: [
    ["Case Number", "input", "caseNumber"],
    ["Storage Type", "select", "storageType", ["Public Storage", "Private Storage", "Public Viewing Room", "Private Viewing Room", "Not Applicable"]],
    ["Space Status", "select", "spaceStatus", ["Occupied", "Available", "Reserved", "Released"]],
    ["Body Viewing Request", "select", "viewingRequest", ["No viewing requested", "Public viewing room", "Private viewing room", "Viewing completed"]],
    ["Cause of Death Status", "select", "causeKnown", ["Pending review", "Known", "Family requested determination", "Referred for postmortem"]],
    ["Disposal Eligibility", "select", "disposalEligibility", ["Not due", "Due after six months", "Approved for disposal", "Disposed"]],
    ["Release Status", "select", "releaseStatus", ["In storage", "Awaiting documents", "Cleared for release", "Released to family", "Transferred"]],
    ["Authorized Contact", "input", "authorizedContact"]
  ],
  Rental: [
    ["Asset / Room", "input", "assetName"],
    ["Return Status", "select", "returnStatus", ["Issued", "Returned", "Overdue"]],
    ["Approved By", "input", "approvedBy"]
  ]
};

let patients = [];
let services = {};
let bloodRequests = [];
let apiAvailable = false;
let auth = loadAuth();

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}

function saveAuth(nextAuth) {
  auth = nextAuth;
  if (nextAuth) localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
  else localStorage.removeItem(AUTH_KEY);
}

function currentStaff() {
  return auth?.staff || null;
}

function hasRole(roles = []) {
  const staff = currentStaff();
  return !roles.length || (staff && roles.includes(staff.role));
}

function normalizeKey(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function departmentNameForPage(page, label = "") {
  const pageName = clean(page).replace(/\.html$/i, "").toLowerCase();
  const names = {
    admin: "Administration",
    billing: "Billing",
    "blood donation": "Blood Donation",
    chronic: "Chronic Centre",
    doctor: "Doctor",
    departments: "Departments",
    eye: "Eye Clinic",
    hdu: "HDU",
    icu: "ICU",
    ict: "ICT",
    laboratory: "Laboratory",
    maternity: "Maternity",
    mch: "MCH",
    mortuary: "Mortuary",
    mri: "MRI",
    nurse: "Nurse",
    opd: "Outpatient Department",
    dental: "Dental Department",
    "hope-center": "Hope Center",
    "mental-health": "Mental Health",
    "stress-counseling": "Stress Counseling",
    "therapy-records": "Therapy Records",
    biomedic: "Biomedic",
    pharmacy: "Pharmacy",
    radiology: "Radiology",
    registration: "Registration",
    rental: "Rental",
    staff: "Administration",
    theatre: "Theatre",
    wards: "Wards",
    xray: "X-Ray"
  };
  return names[pageName] || clean(label);
}

function staffDepartmentKey() {
  const staff = currentStaff();
  if (!staff) return "";
  const department = clean(staff.department);
  const role = clean(staff.role);
  const aliases = {
    administration: "administration",
    consultation: "doctor",
    diagnostics: "laboratory",
    nursing: "nurse",
    sha: "billing"
  };
  return aliases[normalizeKey(department)] || normalizeKey(department || role);
}

function canSeeDepartmentItem(page, label = "") {
  const staff = currentStaff();
  if (!staff || staff.role === "admin") return true;
  if (!page || page === "../index.html" || page === "index.html") return true;
  if (label === "Home") return true;

  const itemDepartment = departmentNameForPage(page, label);
  if (["Departments", "Patient Profile", "Admin", "Staff"].includes(itemDepartment)) return false;

  return normalizeKey(itemDepartment) === staffDepartmentKey();
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    saveAuth(null);
    throw new Error("Please sign in again.");
  }

  if (!response.ok) throw new Error(data.error || "Server request failed");
  return data;
}

async function checkApi() {
  try {
    await apiRequest("/health");
    apiAvailable = true;
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    patients = Array.isArray(saved?.patients) ? saved.patients : [];
    services = saved?.services && typeof saved.services === "object" ? saved.services : {};
    bloodRequests = Array.isArray(saved?.bloodRequests) ? saved.bloodRequests : [];
  } catch {
    patients = [];
    services = {};
    bloodRequests = [];
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ patients, services, bloodRequests }));
}

function clean(value) {
  return String(value ?? "").trim();
}

function money(value) {
  return `${Number(value || 0).toLocaleString()} KES`;
}

function profileHref(patientID) {
  return `patientprofile.html?id=${encodeURIComponent(clean(patientID))}`;
}

function bloodAmount(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function bloodMl(value) {
  return `${Number(value || 0).toLocaleString()} ml`;
}

function escapeHtml(value) {
  return clean(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function notify(message, type = "info") {
  const text = clean(message);
  let notice = document.querySelector(".notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.className = "notice";
    (document.querySelector("main") || document.body).prepend(notice);
  }
  notice.textContent = text;
  notice.dataset.type = type;
  notice.classList.add("is-visible");
  if (type === "error") alert(text);
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function splitList(value) {
  return clean(value).split(",").map(item => item.trim()).filter(Boolean);
}

function patientIdPrefix(date = new Date()) {
  return `OP-H${String(date.getFullYear()).slice(-2)}`;
}

function nextLocalPatientID() {
  const prefix = patientIdPrefix();
  const max = patients.reduce((highest, patient) => {
    const id = String(patient.patientID || patient.id || "");
    if (!id.startsWith(`${prefix}-`)) return highest;
    const value = Number(id.split("-").pop());
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

function setRegistrationPatientID(value) {
  const input = document.getElementById("patientID");
  const preview = document.getElementById("patientIdPreview");
  if (input) input.value = value;
  if (preview) preview.textContent = value;
}

function renderPatientIdSlip(patient) {
  const slip = document.getElementById("patientIdSlip");
  if (!slip || !patient) return;

  const patientID = patient.id || patient.patientID;
  slip.innerHTML = `
    <div class="id-slip-card">
      <div>
        <p class="eyebrow">Patient identification slip</p>
        <h2>Referral Hospital</h2>
      </div>
      <div class="id-slip-main">
        <span>Patient ID</span>
        <strong>${escapeHtml(patientID)}</strong>
      </div>
      <div class="id-slip-details">
        <p><strong>Name:</strong> ${escapeHtml(patient.name)}</p>
        <p><strong>Type:</strong> ${escapeHtml(patient.patientType || patient.type || "")}</p>
        <p><strong>Coverage:</strong> ${escapeHtml(patient.coverageType || "No Insurance / Self Pay")}</p>
        <p><strong>Registered:</strong> ${escapeHtml(new Date().toLocaleString())}</p>
      </div>
      <div class="id-slip-actions">
        <button type="button" onclick="printPatientIdSlip()">Print Patient ID</button>
        <a class="btn btn-secondary" href="patientprofile.html?id=${encodeURIComponent(patientID)}">Open Profile</a>
      </div>
    </div>
  `;
  slip.classList.add("is-visible");
  slip.scrollIntoView({ behavior: "smooth", block: "center" });
}

function printPatientIdSlip() {
  document.body.classList.add("printing-id-slip");
  window.print();
  setTimeout(() => document.body.classList.remove("printing-id-slip"), 500);
}

function mortuaryIdPrefix(date = new Date()) {
  return `MOR-H${String(date.getFullYear()).slice(-2)}`;
}

function nextLocalMortuaryID() {
  const prefix = mortuaryIdPrefix();
  const savedRecords = Object.values(services).flat();
  const max = savedRecords.reduce((highest, service) => {
    const id = String(service.details?.mortuaryID || "");
    if (!id.startsWith(`${prefix}-`)) return highest;
    const value = Number(id.split("-").pop());
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

function refreshMortuaryID() {
  const input = document.getElementById("mortuaryID");
  if (!input || input.value) return;
  input.value = nextLocalMortuaryID();
}

async function refreshRegistrationPatientID() {
  if (!document.getElementById("registrationForm")) return;

  let nextId = nextLocalPatientID();
  if (apiAvailable) {
    try {
      const response = await apiRequest("/patients/next-id");
      nextId = response.patientID || nextId;
    } catch {
      // Keep the local generated ID if the backend cannot be reached.
    }
  }
  setRegistrationPatientID(nextId);
}

function mergePatientFromApi(apiPatient) {
  const patient = {
    id: apiPatient.id || apiPatient.patientID,
    patientID: apiPatient.id || apiPatient.patientID,
    firstName: apiPatient.firstName || "",
    middleName: apiPatient.middleName || "",
    lastName: apiPatient.lastName || "",
    name: apiPatient.name,
    type: apiPatient.type || apiPatient.patientType,
    patientType: apiPatient.type || apiPatient.patientType,
    dob: apiPatient.dob,
    ageYears: apiPatient.ageYears,
    gender: apiPatient.gender,
    contact: apiPatient.contact,
    address: apiPatient.address,
    nextOfKin: apiPatient.nextOfKin,
    nextOfKinContact: apiPatient.nextOfKinContact,
    coverageType: apiPatient.coverageType || "No Insurance / Self Pay",
    insuranceID: apiPatient.insuranceID,
    nationalID: apiPatient.nationalID,
    allergies: apiPatient.allergies || [],
    medicalHistory: apiPatient.medicalHistory || [],
    createdAt: apiPatient.createdAt
  };

  const existingIndex = patients.findIndex(item => item.id?.toLowerCase() === patient.id.toLowerCase());
  if (existingIndex >= 0) patients[existingIndex] = { ...patients[existingIndex], ...patient };
  else patients.push(patient);

  services[patient.id] = services[patient.id] || [];
  saveState();
  return patient;
}

function ensurePatient(id) {
  return patients.find(patient => patient.id?.toLowerCase() === clean(id).toLowerCase());
}

async function findPatient(id) {
  const localPatient = ensurePatient(id);
  if (localPatient) return localPatient;

  if (apiAvailable && clean(id)) {
    const apiPatient = await apiRequest(`/patients/${encodeURIComponent(clean(id))}`);
    return mergePatientFromApi(apiPatient);
  }
  return null;
}

async function loginStaff(username, password) {
  if (!apiAvailable) await checkApi();
  if (!apiAvailable) {
    notify("Backend is not reachable. Start the server before signing in.", "error");
    return false;
  }

  try {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    saveAuth(result);
    notify(`Signed in as ${result.staff.name} (${result.staff.role}).`, "success");
    setupNavigation();
    setTimeout(() => {
      location.href = result.staff.role === "admin" ? "admin.html" : "../index.html";
    }, 450);
    return true;
  } catch (err) {
    notify(err.message, "error");
    return false;
  }
}

async function isStaffRegistrationOpen() {
  try {
    const status = await apiRequest("/auth/status");
    return Boolean(status.registrationOpen);
  } catch {
    return false;
  }
}

async function registerStaffFromForm(form) {
  if (!apiAvailable) await checkApi();
  if (!apiAvailable) {
    notify("Backend is not reachable. Start the server before creating an account.", "error");
    return false;
  }

  try {
    const data = formData(form);
    const payload = {
      staffID: clean(data.staffID),
      username: clean(data.username),
      password: String(data.password || "").trim(),
      name: clean(data.name),
      role: String(data.role || "admin").trim(),
      department: clean(data.department) || "Administration"
    };

    if (!payload.staffID || !payload.username || !payload.password || !payload.name) {
      notify("Staff ID, username, password and name are required.", "error");
      return false;
    }

    const result = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    saveAuth(result);
    notify(`Account created as ${result.staff.name} (${result.staff.role}).`, "success");
    setupNavigation();
    setTimeout(() => {
      location.href = result.staff.role === "admin" ? "admin.html" : "../index.html";
    }, 450);
    return true;
  } catch (err) {
    notify(err.message, "error");
    return false;
  }
}

function logoutStaff() {
  saveAuth(null);
  location.href = "login.html";
}

async function registerPatientFromForm(form) {
  const data = formData(form);
  if (!clean(data.patientID)) data.patientID = nextLocalPatientID();
  const patientName = [data.firstName, data.middleName, data.lastName].map(clean).filter(Boolean).join(" ");

  if (!data.firstName || !data.middleName || !data.lastName || !data.patientType) {
    notify("Three names and patient type are required.", "error");
    return false;
  }

  const payload = {
    ...data,
    patientID: clean(data.patientID),
    firstName: clean(data.firstName),
    middleName: clean(data.middleName),
    lastName: clean(data.lastName),
    name: patientName,
    coverageType: clean(data.coverageType) || "No Insurance / Self Pay",
    insuranceID: clean(data.coverageType) === "No Insurance / Self Pay" ? "" : clean(data.insuranceID),
    ageYears: Number(data.ageYears || 0),
    allergies: splitList(data.allergies),
    medicalHistory: splitList(data.medicalHistory)
  };

  if (apiAvailable) {
    try {
      const apiPatient = await apiRequest("/patients/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      mergePatientFromApi(apiPatient);
      notify(`Patient ${patientName} registered.`, "success");
      form.reset();
      renderPatientIdSlip(apiPatient);
      await refreshRegistrationPatientID();
      setTimeout(() => printPatientIdSlip(), 300);
      return true;
    } catch (err) {
      notify(err.message, "error");
      return false;
    }
  }

  const localPatient = { ...payload, id: payload.patientID, type: payload.patientType, createdAt: new Date().toISOString() };
  patients.push(localPatient);
  services[payload.patientID] = [];
  saveState();
  notify(`Patient ${patientName} registered locally.`, "success");
  form.reset();
  renderPatientIdSlip(localPatient);
  await refreshRegistrationPatientID();
  setTimeout(() => printPatientIdSlip(), 300);
  return true;
}

async function addDepartmentActivity(payload) {
  const patientId = clean(payload.patientID);
  const department = clean(payload.department);
  const description = clean(payload.description);
  const amount = Number(payload.cost);
  const isBloodDonation = department.toLowerCase() === "blood donation";
  const isOperationalRecord = ["biomedic", "ict"].includes(department.toLowerCase());

  if ((!patientId && !isBloodDonation && !isOperationalRecord) || !department || !description) {
    notify(isBloodDonation || isOperationalRecord ? "Department and activity summary are required." : "Patient ID, department, and activity summary are required.", "error");
    return false;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    notify("Enter a valid cost.", "error");
    return false;
  }

  const patient = (isBloodDonation && !patientId) || isOperationalRecord ? null : await findPatient(patientId).catch(() => null);
  if (!isBloodDonation && !isOperationalRecord && !patient) {
    notify("Patient not found or you are not authorized to view this patient.", "error");
    return false;
  }

  const service = {
    department,
    description,
    cost: amount,
    details: payload.details || {},
    recordedBy: currentStaff(),
    createdAt: new Date().toISOString()
  };

  if (apiAvailable) {
    try {
      await apiRequest("/departments/add", {
        method: "POST",
        body: JSON.stringify({ ...(patient ? { patientID: patient.id } : patientId ? { patientID: patientId } : {}), ...service })
      });
    } catch (err) {
      notify(err.message, "error");
      return false;
    }
  }

  const recordKey = patient?.id || patientId || payload.details?.donorReference || `${department.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${Date.now()}`;
  if (!patient && isBloodDonation) service.details.donorReference = recordKey;
  services[recordKey] = services[recordKey] || [];
  services[recordKey].push(service);
  saveState();
  notify(patient ? `${department} activity recorded for ${patient.name}.` : `${department} record saved.`, "success");
  return true;
}

async function createStaffFromForm(form) {
  if (!apiAvailable) await checkApi();
  if (!apiAvailable) {
    notify("Backend is not reachable. Start the server before creating staff.", "error");
    return false;
  }

  try {
    const data = formData(form);
    const payload = {
      staffID: clean(data.staffID),
      username: clean(data.username),
      password: String(data.password || "").trim(),
      name: clean(data.name),
      role: String(data.role || "staff").trim(),
      department: clean(data.department) || "General"
    };

    if (!payload.staffID || !payload.username || !payload.password || !payload.name || !payload.role) {
      notify("All fields are required.", "error");
      return false;
    }

    const result = await apiRequest("/auth/staff", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    notify(`Staff ${result.name} (${result.role}) created successfully.`, "success");
    form.reset();
    await fetchAndDisplayStaff();
    return true;
  } catch (err) {
    notify(err.message, "error");
    return false;
  }
}

async function fetchAndDisplayStaff() {
  if (!apiAvailable) await checkApi();
  if (!apiAvailable) return;

  try {
    const staffList = document.getElementById("staffList");
    if (!staffList) return;

    const data = await apiRequest("/auth/staff-list");
    const staffArray = Array.isArray(data) ? data : data.staff || [];

    if (!staffArray.length) {
      staffList.innerHTML = `<p style="padding: 1rem;">No staff members created yet.</p>`;
      return;
    }

    staffList.innerHTML = `
      <h3>Current Staff</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Staff ID</th><th>Name</th><th>Username</th><th>Role</th><th>Department</th></tr></thead>
          <tbody>
            ${staffArray.map(staff => `
              <tr>
                <td>${escapeHtml(staff.staffID)}</td>
                <td>${escapeHtml(staff.name)}</td>
                <td>${escapeHtml(staff.username)}</td>
                <td>${escapeHtml(staff.role)}</td>
                <td>${escapeHtml(staff.department)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch {
    // Keep staff list quiet if the server is unavailable.
  }
}

async function recordDepartmentForm(form, department) {
  const data = formData(form);
  const details = { ...data };
  delete details.patientID;
  delete details.cost;

  const summary =
    data.description ||
    data.test ||
    data.procedure ||
    data.service ||
    data.medication ||
    data.result ||
    data.chiefComplaint ||
    data.diagnosis ||
    "Department service";

  const ok = await addDepartmentActivity({
    patientID: data.patientID,
    department,
    description: summary,
    cost: data.cost,
    details
  });

  if (ok) {
    form.reset();
    refreshMortuaryID();
    await loadDepartmentActivity();
    await loadBloodBank();
    await loadMaternityOverview();
    await loadWardPopulationSummary();
    await loadGenericDepartmentOverview();
  }
}

function renderDepartmentActivityPanel(department, activities) {
  const isBloodDonation = String(department || "").toLowerCase() === "blood donation";
  const rows = !Array.isArray(activities) || !activities.length
    ? `<tr><td colspan="5">No recent activity recorded for ${escapeHtml(department)}.</td></tr>`
    : activities.map(service => isBloodDonation ? `
      <tr>
        <td>${escapeHtml(service.details?.donorName || "")}</td>
        <td>${escapeHtml(service.details?.bloodType || service.details?.bloodGroup || "")}</td>
        <td>${bloodMl(bloodAmount(service.details?.amountCollected || service.details?.volume))}</td>
        <td>${escapeHtml(service.details?.unitNumber || service.details?.donorReference || service.patientID || "")}</td>
        <td>${escapeHtml(service.createdAt ? new Date(service.createdAt).toLocaleString() : "")}</td>
      </tr>
    ` : `
      <tr>
        <td><a class="table-link" href="${profileHref(service.patientID || "")}">${escapeHtml(service.patientID || "")}</a></td>
        <td>${escapeHtml(service.description)}</td>
        <td>${escapeHtml(service.recordedBy?.name || "")}</td>
        <td>${escapeHtml(service.createdAt ? new Date(service.createdAt).toLocaleString() : "")}</td>
        <td>${money(service.cost)}</td>
      </tr>
    `).join("");

  return `
    <h3>${escapeHtml(department)} Activity</h3>
    <div class="table-wrap">
      <table>
        <thead>${isBloodDonation
          ? "<tr><th>Donor</th><th>Type</th><th>Collected</th><th>Unit / Ref</th><th>Date</th></tr>"
          : "<tr><th>Patient ID</th><th>Service</th><th>Recorded By</th><th>Date</th><th>Cost</th></tr>"
        }</thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function emptyBloodInventory() {
  return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => ({
    bloodType: type,
    amountCollected: 0,
    amountAvailable: 0,
    units: 0
  }));
}

function localBloodInventory() {
  const inventory = Object.fromEntries(emptyBloodInventory().map(item => [item.bloodType, item]));
  Object.values(services).flat()
    .filter(service => String(service.department || "").toLowerCase() === "blood donation")
    .forEach(service => {
      const type = clean(service.details?.bloodType || service.details?.bloodGroup).toUpperCase();
      if (!inventory[type]) return;
      const amount = bloodAmount(service.details?.amountCollected || service.details?.volume);
      inventory[type].amountCollected += amount;
      inventory[type].amountAvailable += amount;
      inventory[type].units += 1;
    });

  bloodRequests
    .filter(request => request.status === "Fulfilled")
    .forEach(request => {
      const type = clean(request.bloodType).toUpperCase();
      if (inventory[type]) inventory[type].amountAvailable -= bloodAmount(request.amountRequested);
    });

  return Object.values(inventory);
}

function localBloodCollections() {
  return Object.entries(services).flatMap(([patientID, patientServices]) => (
    patientServices || []
  )
    .filter(service => String(service.department || "").toLowerCase() === "blood donation")
    .map(service => ({ patientID, ...service })))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function renderBloodInventoryRows(inventory) {
  return (inventory || emptyBloodInventory()).map(item => `
    <tr>
      <td>${escapeHtml(item.bloodType)}</td>
      <td>${bloodMl(item.amountCollected)}</td>
      <td>${bloodMl(item.amountAvailable)}</td>
      <td>${Number(item.units || 0).toLocaleString()}</td>
    </tr>
  `).join("");
}

function renderBloodCollectionRows(collections) {
  if (!collections.length) return `<tr><td colspan="7">No blood collections recorded yet.</td></tr>`;
  return collections.map(record => {
    const details = record.details || {};
    const bloodType = details.bloodType || details.bloodGroup || "";
    const amountCollected = details.amountCollected || details.volume || 0;
    return `
      <tr>
        <td>${escapeHtml(details.donorReference || record.patientID || "")}</td>
        <td>${escapeHtml(details.donorName || "")}</td>
        <td>${escapeHtml(bloodType)}</td>
        <td>${bloodMl(bloodAmount(amountCollected))}</td>
        <td>${escapeHtml(details.screeningStatus || "")}</td>
        <td>${escapeHtml(details.unitNumber || "")}</td>
        <td>${escapeHtml(record.createdAt ? new Date(record.createdAt).toLocaleString() : "")}</td>
      </tr>
    `;
  }).join("");
}

function renderBloodRequestRows(requests) {
  if (!requests.length) return `<tr><td colspan="7">No blood requests yet.</td></tr>`;
  const canFulfill = hasRole(["admin", "nurse", "technician"]) &&
    (document.body.classList.contains("dept-blood-donation") || document.body.classList.contains("dept-admin"));
  return requests.map(request => `
    <tr>
      <td><a class="table-link" href="${profileHref(request.patientID)}">${escapeHtml(request.patientID)}</a></td>
      <td>${escapeHtml(request.bloodType)}</td>
      <td>${bloodMl(request.amountRequested)}</td>
      <td>${escapeHtml(request.urgency || "")}</td>
      <td>${escapeHtml(request.requestedByDepartment || "")}</td>
      <td>${escapeHtml(request.status || "Pending")}</td>
      <td>
        ${request.status === "Pending" && canFulfill
          ? `<button type="button" class="btn-small" onclick="fulfillBloodRequest('${escapeHtml(request._id)}')">Fulfill</button>`
          : ""}
      </td>
    </tr>
  `).join("");
}

function localDepartmentRecords(department) {
  return Object.entries(services).flatMap(([patientID, patientServices]) => (
    patientServices || []
  )
    .filter(service => String(service.department || "").trim().toLowerCase() === department.toLowerCase())
    .map(service => ({ patientID, ...service })))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function isMaternityDelivered(record) {
  const details = record.details || {};
  return clean(details.deliveryStatus).toLowerCase() === "delivered" ||
    clean(record.description).toLowerCase().includes("delivery") ||
    clean(record.description).toLowerCase().includes("birth");
}

function isMaternityDelivering(record) {
  const details = record.details || {};
  return clean(details.deliveryStatus).toLowerCase() === "delivering" ||
    clean(details.motherStatus).toLowerCase().includes("labour") ||
    clean(record.description).toLowerCase().includes("delivering");
}

function maternityMetricValue(records, key) {
  return records.filter(record => {
    const details = record.details || {};
    const babyOutcome = clean(details.babyOutcome).toLowerCase();
    const birthMethod = clean(details.birthMethod).toLowerCase();
    const extraCare = clean(details.extraCareNeeded).toLowerCase();
    const description = clean(record.description).toLowerCase();

    if (key === "delivered") return isMaternityDelivered(record);
    if (key === "delivering") return isMaternityDelivering(record);
    if (key === "safeBirth") return babyOutcome === "born safely";
    if (key === "bornDead") return babyOutcome === "born dead";
    if (key === "extraCare") return babyOutcome.includes("icu") || extraCare === "icu" || extraCare === "hdu" || extraCare === "newborn unit" || extraCare === "observation";
    if (key === "surgery") return birthMethod.includes("surgery") || birthMethod.includes("c-section") || description.includes("c-section") || description.includes("surgery");
    if (key === "normal") return birthMethod === "normal delivery" || description.includes("normal delivery");
    return false;
  }).length;
}

function renderMaternityRows(records) {
  if (!records.length) return `<tr><td colspan="8">No maternity records saved yet.</td></tr>`;
  return records.slice(0, 80).map(record => {
    const details = record.details || {};
    return `
      <tr>
        <td><a class="table-link" href="${profileHref(record.patientID)}">${escapeHtml(record.patientID || "")}</a></td>
        <td>${escapeHtml(record.description || "")}</td>
        <td>${escapeHtml(details.motherStatus || "")}</td>
        <td>${escapeHtml(details.deliveryStatus || "")}</td>
        <td>${escapeHtml(details.babyOutcome || "")}</td>
        <td>${escapeHtml(details.birthMethod || "")}</td>
        <td>${escapeHtml(details.extraCareNeeded || "")}</td>
        <td>${escapeHtml(record.createdAt ? new Date(record.createdAt).toLocaleString() : "")}</td>
      </tr>
    `;
  }).join("");
}

async function loadMaternityOverview() {
  const panel = document.getElementById("maternityOverview");
  if (!panel) return;

  try {
    const records = apiAvailable
      ? await apiRequest("/departments/records/Maternity")
      : localDepartmentRecords("Maternity");

    const metrics = [
      ["Mothers Delivered", maternityMetricValue(records, "delivered")],
      ["Delivering", maternityMetricValue(records, "delivering")],
      ["Born Safely", maternityMetricValue(records, "safeBirth")],
      ["Born Dead", maternityMetricValue(records, "bornDead")],
      ["Baby Needs ICU / Extra Care", maternityMetricValue(records, "extraCare")],
      ["Birth Surgery / C-Section", maternityMetricValue(records, "surgery")],
      ["Normal Birth", maternityMetricValue(records, "normal")],
      ["Other Maternity Services", Math.max(0, records.length - maternityMetricValue(records, "delivered") - maternityMetricValue(records, "delivering"))]
    ];

    panel.innerHTML = `
      <div class="panel-title"><span>MAT</span><strong>Maternity Delivery Overview</strong></div>
      <div class="maternity-metrics">
        ${metrics.map(([label, value]) => metricCard(label, value)).join("")}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Patient</th><th>Service</th><th>Mother</th><th>Delivery</th><th>Baby Outcome</th><th>Birth Method</th><th>Extra Care</th><th>Date</th></tr></thead>
          <tbody>${renderMaternityRows(records || [])}</tbody>
        </table>
      </div>
    `;
  } catch (err) {
    panel.innerHTML = `<p class="notice is-visible">${escapeHtml(err.message || "Unable to load maternity overview.")}</p>`;
  }
}

function wardGroupCounts(records) {
  const counts = {
    children: 0,
    mothers: 0,
    male: 0,
    aged: 0,
    other: 0,
    total: records.length
  };

  records.forEach(record => {
    const group = clean(record.details?.patientGroup).toLowerCase();
    if (group === "child") counts.children += 1;
    else if (group === "mother") counts.mothers += 1;
    else if (group === "male") counts.male += 1;
    else if (group === "aged person") counts.aged += 1;
    else counts.other += 1;
  });

  return counts;
}

function renderWardPopulationRows(records) {
  if (!records.length) return `<tr><td colspan="6">No ward population records saved yet.</td></tr>`;
  return records.slice(0, 80).map(record => {
    const details = record.details || {};
    return `
      <tr>
        <td><a class="table-link" href="${profileHref(record.patientID)}">${escapeHtml(record.patientID || "")}</a></td>
        <td>${escapeHtml(details.patientGroup || "")}</td>
        <td>${escapeHtml(details.ward || "")}</td>
        <td>${escapeHtml(details.wardBed || "")}</td>
        <td>${escapeHtml(details.days || "")}</td>
        <td>${escapeHtml(record.createdAt ? new Date(record.createdAt).toLocaleString() : "")}</td>
      </tr>
    `;
  }).join("");
}

const customOverviewDepartments = new Set(["Blood Donation", "Maternity", "Wards"]);

function shouldUseGenericDepartmentOverview(department) {
  return department && !customOverviewDepartments.has(department);
}

function recordSearchText(record) {
  const detailValues = Object.values(record.details || {}).join(" ");
  return `${record.description || ""} ${detailValues}`.toLowerCase();
}

function recordHasAny(record, terms) {
  const text = recordSearchText(record);
  return terms.some(term => text.includes(term.toLowerCase()));
}

function recordDetail(record, fields) {
  const details = record.details || {};
  for (const field of fields) {
    const value = details[field];
    if (value !== undefined && value !== null && clean(value)) return value;
  }
  return "";
}

function countRecords(records, terms) {
  return records.filter(record => recordHasAny(record, terms)).length;
}

function departmentFlowConfig(department) {
  const baseColumns = [
    ["Status", ["status", "clinicalStatus", "reportStatus", "resultStatus", "procedureStatus", "dispensingStatus", "careStatus", "releaseStatus"]],
    ["Priority", ["priority", "criticalLevel", "urgency", "transmissionRisk"]],
    ["Staff Notes", ["notes", "staffNotes", "findings", "result", "diagnosis"]]
  ];

  const configs = {
    Doctor: {
      metrics: [
        ["Consultations", records => records.length],
        ["Urgent / Emergency", records => countRecords(records, ["urgent", "emergency"])],
        ["Admit / Refer", records => countRecords(records, ["admit", "refer"])],
        ["Follow-ups", records => countRecords(records, ["follow"])]
      ],
      columns: [["Diagnosis", ["diagnosis"]], ["Priority", ["priority"]], ["Status", ["clinicalStatus"]]]
    },
    Nurse: {
      metrics: [
        ["Nursing Records", records => records.length],
        ["Completed Care", records => countRecords(records, ["completed"])],
        ["Ongoing Care", records => countRecords(records, ["ongoing"])],
        ["Escalated", records => countRecords(records, ["escalated"])]
      ],
      columns: [["Care Status", ["careStatus"]], ["Shift", ["shift"]], ["Pain Score", ["painScore"]]]
    },
    Laboratory: {
      metrics: [
        ["Lab Tests", records => records.length],
        ["Pending", records => countRecords(records, ["pending"])],
        ["Verified", records => countRecords(records, ["verified"])],
        ["Samples", records => records.filter(record => clean(record.details?.sampleID)).length]
      ],
      columns: [["Sample ID", ["sampleID"]], ["Result Status", ["resultStatus"]], ["Verified By", ["verifiedBy"]]]
    },
    Radiology: {
      metrics: [
        ["Scans", records => records.length],
        ["Full Body", records => countRecords(records, ["full body"])],
        ["Bone / Trauma", records => countRecords(records, ["bone", "trauma"])],
        ["Reported", records => countRecords(records, ["reported", "reviewed"])]
      ],
      columns: [["Scan Scope", ["scanScope", "bodyRegion"]], ["Report Status", ["reportStatus"]], ["Radiologist", ["radiologist"]]]
    },
    "X-Ray": {
      metrics: [
        ["X-Ray Records", records => records.length],
        ["Pending Reports", records => countRecords(records, ["pending"])],
        ["Reported", records => countRecords(records, ["reported", "reviewed"])],
        ["Images", records => records.filter(record => clean(record.details?.imageNumber)).length]
      ],
      columns: [["Image No.", ["imageNumber"]], ["Report Status", ["reportStatus"]], ["Radiographer", ["radiographer"]]]
    },
    MRI: {
      metrics: [
        ["MRI Scans", records => records.length],
        ["With Contrast", records => countRecords(records, ["with contrast"])],
        ["Checklist Done", records => countRecords(records, ["completed"])],
        ["Radiologist Reviewed", records => records.filter(record => clean(record.details?.radiologist)).length]
      ],
      columns: [["Scan No.", ["scanNumber"]], ["Checklist", ["safetyChecklist"]], ["Radiologist", ["radiologist"]]]
    },
    "Eye Clinic": {
      metrics: [
        ["Eye Visits", records => records.length],
        ["Follow-up Needed", records => countRecords(records, ["yes", "follow"])],
        ["Treated", records => countRecords(records, ["treatment", "treated"])],
        ["Pressure / Acuity", records => records.filter(record => clean(record.details?.leftEyeAcuity) || clean(record.details?.rightEyeAcuity)).length]
      ],
      columns: [["Left VA", ["leftEyeAcuity"]], ["Right VA", ["rightEyeAcuity"]], ["Follow-up", ["followUpRequired"]]]
    },
    ICU: {
      metrics: [
        ["ICU Records", records => records.length],
        ["Critical", records => countRecords(records, ["critical"])],
        ["Ventilated", records => countRecords(records, ["ventilation", "mechanical"])],
        ["Stable", records => countRecords(records, ["stable"])]
      ],
      columns: [["Bed", ["bedNumber"]], ["Critical Level", ["criticalLevel"]], ["Ventilation", ["ventilation"]]]
    },
    HDU: {
      metrics: [
        ["HDU Records", records => records.length],
        ["Isolation Active", records => countRecords(records, ["isolation active", "isolation"])],
        ["Ebola / Corona", records => countRecords(records, ["ebola", "corona"])],
        ["Cleared", records => countRecords(records, ["cleared"])]
      ],
      columns: [["Isolation Room", ["isolationRoom"]], ["Risk", ["diseaseRisk", "transmissionRisk"]], ["PPE", ["ppeLevel"]]]
    },
    MCH: {
      metrics: [
        ["MCH Services", records => records.length],
        ["ANC", records => countRecords(records, ["anc"])],
        ["PNC", records => countRecords(records, ["pnc"])],
        ["Immunization", records => countRecords(records, ["immunization", "vaccine"])]
      ],
      columns: [["Clinic Type", ["clinicType"]], ["Next Visit", ["nextVisit"]], ["Batch", ["batchNumber"]]]
    },
    Theatre: {
      metrics: [
        ["Theatre Records", records => records.length],
        ["Scheduled", records => countRecords(records, ["scheduled"])],
        ["Completed", records => countRecords(records, ["completed"])],
        ["Cancelled", records => countRecords(records, ["cancelled"])]
      ],
      columns: [["Surgeon", ["surgeon"]], ["Status", ["procedureStatus"]], ["Consent", ["consentConfirmed"]]]
    },
    Pharmacy: {
      metrics: [
        ["Prescriptions", records => records.length],
        ["Dispensed", records => countRecords(records, ["dispensed"])],
        ["Pending", records => countRecords(records, ["pending"])],
        ["Partial", records => countRecords(records, ["partially"])]
      ],
      columns: [["Prescription", ["prescriptionNumber"]], ["Dispensing", ["dispensingStatus"]], ["Pharmacist", ["pharmacist"]]]
    },
    "Chronic Centre": {
      metrics: [
        ["Chronic Visits", records => records.length],
        ["HIV Care", records => countRecords(records, ["hiv"])],
        ["TB Care", records => countRecords(records, ["tb"])],
        ["Missed / Interrupted", records => countRecords(records, ["missed", "interrupted"])]
      ],
      columns: [["Program", ["program"]], ["Adherence", ["adherence"]], ["Next Refill", ["nextRefillDate"]]]
    },
    "Outpatient Department": {
      metrics: [
        ["OPD Visits", records => records.length],
        ["Urgent", records => countRecords(records, ["urgent", "emergency"])],
        ["Referrals", records => countRecords(records, ["refer", "referral"])],
        ["Admissions", records => countRecords(records, ["admit", "admission"])]
      ],
      columns: [["Triage", ["triageLevel"]], ["Disposition", ["disposition"]], ["Clinician", ["reviewingClinician"]]]
    },
    "Dental Department": {
      metrics: [
        ["Dental Records", records => records.length],
        ["Completed", records => countRecords(records, ["completed"])],
        ["Planned", records => countRecords(records, ["planned"])],
        ["Referred", records => countRecords(records, ["referred"])]
      ],
      columns: [["Tooth / Area", ["toothArea"]], ["Status", ["procedureStatus"]], ["Dentist", ["dentist"]]]
    },
    "Hope Center": {
      metrics: [
        ["Hope Center Visits", records => records.length],
        ["Counseling", records => countRecords(records, ["counseling"])],
        ["Adherence", records => countRecords(records, ["adherence"])],
        ["Follow-up", records => countRecords(records, ["follow-up", "follow up"])]
      ],
      columns: [["Program", ["program"]], ["Status", ["status"]], ["Next Appointment", ["nextAppointment"]]]
    },
    "Mental Health": {
      metrics: [
        ["Mental Health Visits", records => records.length],
        ["High Risk", records => countRecords(records, ["high", "emergency"])],
        ["Referred", records => countRecords(records, ["referred"])],
        ["Stable", records => countRecords(records, ["stable"])]
      ],
      columns: [["Risk", ["riskLevel"]], ["Status", ["status"]], ["Clinician", ["clinician"]]]
    },
    "Stress Counseling": {
      metrics: [
        ["Counseling Sessions", records => records.length],
        ["Severe Stress", records => countRecords(records, ["severe"])],
        ["Follow-up", records => countRecords(records, ["follow-up", "follow up"])],
        ["Referred", records => countRecords(records, ["referred"])]
      ],
      columns: [["Stress Level", ["stressLevel"]], ["Status", ["status"]], ["Counselor", ["counselor"]]]
    },
    "Therapy Records": {
      metrics: [
        ["Therapy Sessions", records => records.length],
        ["Individual", records => countRecords(records, ["individual"])],
        ["Group", records => countRecords(records, ["group"])],
        ["Improving", records => countRecords(records, ["improving"])]
      ],
      columns: [["Therapy Type", ["therapyType"]], ["Progress", ["progress"]], ["Therapist", ["therapist"]]]
    },
    Biomedic: {
      metrics: [
        ["Equipment Records", records => records.length],
        ["Open", records => countRecords(records, ["open"])],
        ["In Progress", records => countRecords(records, ["in progress"])],
        ["Resolved", records => countRecords(records, ["resolved"])]
      ],
      columns: [["Asset", ["assetNumber"]], ["Maintenance", ["maintenanceStatus"]], ["Engineer", ["biomedicalEngineer"]]]
    },
    ICT: {
      metrics: [
        ["ICT Tickets", records => records.length],
        ["Open", records => countRecords(records, ["open"])],
        ["In Progress", records => countRecords(records, ["in progress"])],
        ["Resolved", records => countRecords(records, ["resolved"])]
      ],
      columns: [["Affected Dept.", ["departmentAffected"]], ["Priority", ["priority"]], ["Status", ["status"]]]
    },
    Mortuary: {
      metrics: [
        ["Mortuary Records", records => records.length],
        ["Admissions", records => countRecords(records, ["admission"])],
        ["Viewing", records => countRecords(records, ["viewing"])],
        ["Released", records => countRecords(records, ["released"])]
      ],
      columns: [["Mortuary ID", ["mortuaryID"]], ["Storage", ["storageType", "spaceStatus"]], ["Release", ["releaseStatus"]]]
    },
    Rental: {
      metrics: [
        ["Rental Records", records => records.length],
        ["Issued", records => countRecords(records, ["issued"])],
        ["Returned", records => countRecords(records, ["returned"])],
        ["Overdue", records => countRecords(records, ["overdue"])]
      ],
      columns: [["Asset / Room", ["assetName"]], ["Return Status", ["returnStatus"]], ["Approved By", ["approvedBy"]]]
    }
  };

  return configs[department] || {
    metrics: [
      ["Total Records", records => records.length],
      ["Pending / Open", records => countRecords(records, ["pending", "open"])],
      ["Completed", records => countRecords(records, ["completed", "done", "resolved", "reviewed"])],
      ["Needs Review", records => countRecords(records, ["review", "urgent", "escalated"])]
    ],
    columns: baseColumns
  };
}

function renderFlowMetrics(department, records) {
  const config = departmentFlowConfig(department);
  const revenue = records.reduce((sum, record) => sum + Number(record.cost || 0), 0);
  const metrics = [
    ...config.metrics.map(([label, getValue]) => [label, getValue(records)]),
    ["Revenue", money(revenue)]
  ];
  return metrics.map(([label, value]) => metricCard(label, value)).join("");
}

function renderGenericDepartmentRows(department, records) {
  const config = departmentFlowConfig(department);
  if (!records.length) return `<tr><td colspan="${config.columns.length + 4}">No department records saved yet.</td></tr>`;
  return records.slice(0, 80).map(record => {
    const detailCells = config.columns.map(([, fields]) => `<td>${escapeHtml(recordDetail(record, fields))}</td>`).join("");
    return `
      <tr>
        <td><a class="table-link" href="${profileHref(record.patientID)}">${escapeHtml(record.patientID || "")}</a></td>
        <td>${escapeHtml(record.description || "")}</td>
        ${detailCells}
        <td>${escapeHtml(record.recordedBy?.name || "")}</td>
        <td>${escapeHtml(record.createdAt ? new Date(record.createdAt).toLocaleString() : "")}</td>
      </tr>
    `;
  }).join("");
}

async function loadGenericDepartmentOverview() {
  const panel = document.getElementById("genericDepartmentOverview");
  const form = document.querySelector("[data-department-form]");
  const department = form?.dataset.departmentForm;
  if (!panel || !shouldUseGenericDepartmentOverview(department)) return;

  try {
    const records = apiAvailable
      ? await apiRequest(`/departments/records/${encodeURIComponent(department)}`)
      : localDepartmentRecords(department);
    const flowRecords = records || [];
    const config = departmentFlowConfig(department);

    panel.innerHTML = `
      <div class="panel-title"><span>${escapeHtml(department.slice(0, 3).toUpperCase())}</span><strong>${escapeHtml(department)} Flow Overview</strong></div>
      <div class="department-overview-grid">
        ${renderFlowMetrics(department, flowRecords)}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Patient</th><th>Service</th>${config.columns.map(([label]) => `<th>${escapeHtml(label)}</th>`).join("")}<th>Recorded By</th><th>Date</th></tr></thead>
          <tbody>${renderGenericDepartmentRows(department, flowRecords)}</tbody>
        </table>
      </div>
    `;
  } catch (err) {
    panel.innerHTML = `<p class="notice is-visible">${escapeHtml(err.message || "Unable to load department overview.")}</p>`;
  }
}

async function loadWardPopulationSummary() {
  const panel = document.getElementById("wardPopulationSummary");
  if (!panel) return;

  try {
    const records = apiAvailable
      ? await apiRequest("/departments/records/Wards")
      : localDepartmentRecords("Wards");
    const counts = wardGroupCounts(records || []);

    panel.innerHTML = `
      <div class="panel-title"><span>WRD</span><strong>Ward Population Totals</strong></div>
      <div class="ward-population-grid">
        ${metricCard("All Ward Patients", counts.total)}
        ${metricCard("Children", counts.children)}
        ${metricCard("Mothers", counts.mothers)}
        ${metricCard("Male Patients", counts.male)}
        ${metricCard("Aged People", counts.aged)}
        ${metricCard("Other Patients", counts.other)}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Patient</th><th>Group</th><th>Ward</th><th>Bed / Space</th><th>Days</th><th>Date</th></tr></thead>
          <tbody>${renderWardPopulationRows(records || [])}</tbody>
        </table>
      </div>
    `;
  } catch (err) {
    panel.innerHTML = `<p class="notice is-visible">${escapeHtml(err.message || "Unable to load ward population totals.")}</p>`;
  }
}

async function loadBloodBank() {
  const inventoryPanel = document.getElementById("bloodInventory");
  const requestPanel = document.getElementById("bloodRequests");
  const collectedPanel = document.getElementById("bloodCollected");
  if (!inventoryPanel && !requestPanel && !collectedPanel) return;

  try {
    let inventory = localBloodInventory();
    let requests = bloodRequests;
    let collections = localBloodCollections();

    if (apiAvailable) {
      [inventory, requests, collections] = await Promise.all([
        apiRequest("/departments/blood/inventory"),
        apiRequest("/departments/blood/requests"),
        apiRequest("/departments/records/Blood%20Donation")
      ]);
      bloodRequests = requests;
      saveState();
    }

    if (inventoryPanel) {
      inventoryPanel.innerHTML = `
        <h3>Blood Type Inventory</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Collected</th><th>Available</th><th>Units</th></tr></thead>
            <tbody>${renderBloodInventoryRows(inventory)}</tbody>
          </table>
        </div>
      `;
    }

    if (requestPanel) {
      const requestTitle = document.body.classList.contains("dept-blood-donation")
        ? "ICU Blood Requests"
        : "Blood Requests";
      requestPanel.innerHTML = `
        <h3>${requestTitle}</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Patient</th><th>Type</th><th>Amount</th><th>Urgency</th><th>From</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${renderBloodRequestRows(requests || [])}</tbody>
          </table>
        </div>
      `;
    }

    if (collectedPanel) {
      collectedPanel.innerHTML = `
        <h3>All Blood Collected</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Donor Ref</th><th>Donor</th><th>Type</th><th>Collected</th><th>Screening</th><th>Unit No.</th><th>Date</th></tr></thead>
            <tbody>${renderBloodCollectionRows(collections || [])}</tbody>
          </table>
        </div>
      `;
    }
  } catch (err) {
    const message = `<p class="notice is-visible">${escapeHtml(err.message || "Unable to load blood bank.")}</p>`;
    if (inventoryPanel) inventoryPanel.innerHTML = message;
    if (requestPanel) requestPanel.innerHTML = message;
    if (collectedPanel) collectedPanel.innerHTML = message;
  }
}

async function requestBloodFromForm(form) {
  const data = formData(form);
  const payload = {
    patientID: clean(data.patientID),
    requestedByDepartment: clean(data.requestedByDepartment) || "ICU",
    bloodType: clean(data.bloodType).toUpperCase(),
    amountRequested: bloodAmount(data.amountRequested),
    urgency: clean(data.urgency) || "Urgent",
    reason: clean(data.reason)
  };

  if (!payload.patientID || !payload.bloodType || !payload.amountRequested) {
    notify("Patient ID, blood type, and requested amount are required.", "error");
    return false;
  }

  if (apiAvailable) {
    try {
      const created = await apiRequest("/departments/blood/requests", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      bloodRequests.unshift(created);
    } catch (err) {
      notify(err.message, "error");
      return false;
    }
  } else {
    const patient = await findPatient(payload.patientID).catch(() => null);
    if (!patient) {
      notify("Patient not found.", "error");
      return false;
    }
    bloodRequests.unshift({
      _id: `blood-request-${Date.now()}`,
      ...payload,
      status: "Pending",
      createdAt: new Date().toISOString(),
      requestedBy: currentStaff()
    });
  }

  saveState();
  form.reset();
  notify("Blood request sent to Blood Donation.", "success");
  await loadBloodBank();
  return true;
}

async function fulfillBloodRequest(id) {
  if (!id) return;

  if (apiAvailable) {
    try {
      await apiRequest(`/departments/blood/requests/${encodeURIComponent(id)}/fulfill`, {
        method: "POST",
        body: JSON.stringify({})
      });
    } catch (err) {
      notify(err.message, "error");
      return;
    }
  } else {
    const request = bloodRequests.find(item => item._id === id);
    if (request) {
      request.status = "Fulfilled";
      request.fulfilledAt = new Date().toISOString();
      request.fulfilledBy = currentStaff();
    }
  }

  saveState();
  notify("Blood request fulfilled.", "success");
  await loadBloodBank();
}

async function loadDepartmentActivity() {
  const panel = document.getElementById("deptActivity");
  if (!panel) return;

  const form = document.querySelector("[data-department-form]");
  const department = form?.dataset.departmentForm || null;
  if (!department) return;

  panel.innerHTML = `<p>Loading ${escapeHtml(department)} activity...</p>`;

  try {
    let activities = [];
    if (apiAvailable) {
      activities = ["blood donation", "biomedic", "ict"].includes(department.toLowerCase())
        ? await apiRequest(`/departments/records/${encodeURIComponent(department)}`)
        : await apiRequest(`/billing/recent/${encodeURIComponent(department)}`);
    } else {
      activities = Object.values(services).flat()
        .filter(item => String(item.department || "").trim().toLowerCase() === department.toLowerCase())
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);
    }

    panel.innerHTML = renderDepartmentActivityPanel(department, activities);
  } catch (err) {
    panel.innerHTML = `<p class="notice error">${escapeHtml(err.message || "Unable to load department activity.")}</p>`;
  }
}

async function initDepartmentPage() {
  if (document.getElementById("deptActivity")) {
    await loadDepartmentActivity();
  }
  if (document.getElementById("bloodInventory") || document.getElementById("bloodRequests") || document.getElementById("bloodCollected")) {
    await loadBloodBank();
  }
  if (document.getElementById("maternityOverview")) {
    await loadMaternityOverview();
  }
  if (document.getElementById("wardPopulationSummary")) {
    await loadWardPopulationSummary();
  }
  if (document.getElementById("genericDepartmentOverview")) {
    await loadGenericDepartmentOverview();
  }
}

async function generateBill(patientID, method) {
  const patient = await findPatient(patientID).catch(() => null);
  if (!patient) {
    notify("No registered patient found for this ID.", "error");
    return null;
  }

  let patientServices = services[patient.id] || [];
  if (apiAvailable) {
    try {
      const profile = await apiRequest(`/patients/${encodeURIComponent(patient.id)}/profile`);
      patientServices = profile.services || profile.patientServices || [];
      services[patient.id] = patientServices;
      saveState();
    } catch (err) {
      notify(err.message, "error");
      return null;
    }
  }

  const total = patientServices.reduce((sum, service) => sum + Number(service.cost || 0), 0);
  const paymentMethod = clean(method) || "Not selected";

  if (apiAvailable) {
    try {
      await apiRequest("/billing/pay", {
        method: "POST",
        body: JSON.stringify({ patientID: patient.id, method: paymentMethod })
      });
    } catch (err) {
      notify(err.message, "error");
      return null;
    }
  }

  renderBill({ patient, patientServices, total, paymentMethod });
  notify(`Bill for ${patient.name}: ${money(total)}.`, "success");
  return { patient, patientServices, total, paymentMethod };
}

async function getPatientProfile(pid) {
  if (apiAvailable) {
    const profile = await apiRequest(`/patients/${encodeURIComponent(clean(pid))}/profile`);
    const patient = mergePatientFromApi(profile.patient);
    const patientServices = profile.services || profile.patientServices || [];
    services[patient.id] = patientServices;
    saveState();
    return {
      patient,
      patientServices,
      total: Number(profile.total || patientServices.reduce((sum, service) => sum + Number(service.cost || 0), 0))
    };
  }

  const patient = ensurePatient(pid);
  if (!patient) return null;
  const patientServices = services[patient.id] || [];
  const total = patientServices.reduce((sum, service) => sum + Number(service.cost || 0), 0);
  return { patient, patientServices, total };
}

async function getStats() {
  if (apiAvailable) return apiRequest("/billing/stats");

  const deptCounts = {};
  let revenue = 0;
  Object.values(services).forEach(patientServices => {
    patientServices.forEach(service => {
      revenue += Number(service.cost || 0);
      deptCounts[service.department] = (deptCounts[service.department] || 0) + 1;
    });
  });

  return { totalPatients: patients.length, revenue, deptCounts };
}

function renderServicesRows(patientServices) {
  if (!patientServices.length) return `<tr><td colspan="5">No services recorded yet.</td></tr>`;
  return patientServices.map(service => `
    <tr>
      <td>${escapeHtml(service.department)}</td>
      <td>${escapeHtml(service.description)}</td>
      <td>${escapeHtml(service.recordedBy?.name || "")}</td>
      <td>${escapeHtml(service.createdAt ? new Date(service.createdAt).toLocaleString() : "")}</td>
      <td>${money(service.cost)}</td>
    </tr>
  `).join("");
}

function renderPatientDetails(patient) {
  return `
    <div class="profile-grid">
      <p><strong>ID:</strong> ${escapeHtml(patient.id)}</p>
      <p><strong>Name:</strong> ${escapeHtml(patient.name)}</p>
      <p><strong>Type:</strong> ${escapeHtml(patient.type)}</p>
      <p><strong>DOB:</strong> ${escapeHtml(patient.dob ? String(patient.dob).slice(0, 10) : "")}</p>
      <p><strong>Age:</strong> ${escapeHtml(patient.ageYears)}</p>
      <p><strong>Gender:</strong> ${escapeHtml(patient.gender)}</p>
      <p><strong>Contact:</strong> ${escapeHtml(patient.contact)}</p>
      <p><strong>National ID:</strong> ${escapeHtml(patient.nationalID)}</p>
      <p><strong>Coverage:</strong> ${escapeHtml(patient.coverageType || "No Insurance / Self Pay")}</p>
      <p><strong>Insurance/SHA:</strong> ${escapeHtml(patient.insuranceID || "Not provided")}</p>
      <p><strong>Next of Kin:</strong> ${escapeHtml(patient.nextOfKin)} ${escapeHtml(patient.nextOfKinContact)}</p>
      <p><strong>Allergies:</strong> ${escapeHtml((patient.allergies || []).join(", "))}</p>
      <p><strong>History:</strong> ${escapeHtml((patient.medicalHistory || []).join(", "))}</p>
    </div>
  `;
}

function renderBill({ patient, patientServices, total, paymentMethod }) {
  const container = document.getElementById("bill") || document.getElementById("profile");
  if (!container) return;
  container.innerHTML = `
    <h3>Billing Receipt</h3>
    ${renderPatientDetails(patient)}
    <p><strong>Payment:</strong> ${escapeHtml(paymentMethod)}</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Department</th><th>Service</th><th>Recorded By</th><th>Date</th><th>Cost</th></tr></thead>
        <tbody>${renderServicesRows(patientServices)}</tbody>
      </table>
    </div>
    <h3>Total: ${money(total)}</h3>
  `;
}

async function showProfile() {
  try {
    const profile = await getPatientProfile(document.getElementById("pid")?.value);
    if (!profile) {
      notify("Patient not found.", "error");
      return;
    }
    const { patient, patientServices, total } = profile;
    const container = document.getElementById("profile");
    container.innerHTML = `
      <h3>Patient Details</h3>
      ${renderPatientDetails(patient)}
      <h3>Care Activity</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Department</th><th>Service</th><th>Recorded By</th><th>Date</th><th>Cost</th></tr></thead>
          <tbody>${renderServicesRows(patientServices)}</tbody>
        </table>
      </div>
      <h3>Total Cost: ${money(total)}</h3>
    `;
  } catch (err) {
    notify(err.message, "error");
  }
}

async function showStats() {
  try {
    const stats = await getStats();
    const statsEl = document.getElementById("stats");
    if (statsEl) {
      const deptRows = Object.entries(stats.deptCounts || {}).length
        ? Object.entries(stats.deptCounts).map(([dept, count]) => `<li>${escapeHtml(dept)}: ${count} services</li>`).join("")
        : "<li>No services recorded yet.</li>";

      statsEl.innerHTML = `
        <h3>Hospital Statistics</h3>
        <p><strong>Total Patients:</strong> ${stats.totalPatients}</p>
        <p><strong>Total Revenue:</strong> ${money(stats.revenue)}</p>
        <h4>Services per Department</h4>
        <ul>${deptRows}</ul>
      `;
    }

    drawStatsChart(stats.deptCounts || {});
  } catch (err) {
    notify(err.message, "error");
  }
}

function drawStatsChart(deptCounts) {
  const canvas = document.getElementById("chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const entries = Object.entries(deptCounts);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#64777f";
  ctx.font = "14px Segoe UI, Arial";
  if (!entries.length) {
    ctx.fillText("No department services recorded yet.", 24, 42);
    return;
  }
  const max = Math.max(...entries.map(([, count]) => count), 1);
  const gap = 18;
  const barWidth = Math.max(34, (canvas.width - 80 - gap * entries.length) / entries.length);
  let x = 40;
  entries.forEach(([dept, count]) => {
    const barHeight = Math.round((canvas.height - 90) * (count / max));
    const y = canvas.height - 48 - barHeight;
    ctx.fillStyle = "#087f8c";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#10242b";
    ctx.fillText(String(count), x, y - 8);
    ctx.fillStyle = "#64777f";
    ctx.fillText(dept.slice(0, 10), x, canvas.height - 20);
    x += barWidth + gap;
  });
}

function metricCard(label, value) {
  return `
    <div class="stat-card">
      <div class="number">${escapeHtml(value)}</div>
      <div class="label">${escapeHtml(label)}</div>
    </div>
  `;
}

function renderNameList(items, emptyText) {
  if (!items || !items.length) return `<span class="muted-text">${escapeHtml(emptyText)}</span>`;
  return items.slice(0, 6).map(item => `
    <span class="admin-pill">${escapeHtml(item.name || item.staffID || item.patientID)}</span>
  `).join("");
}

function departmentFileForName(name) {
  const normalized = clean(name).toLowerCase();
  const match = allDepartments.find(dept => {
    const deptName = dept.name.toLowerCase();
    return deptName === normalized ||
      deptName.includes(normalized) ||
      normalized.includes(deptName.replace(" bank", "").replace(" care", "").replace(" centre", ""));
  });
  return match ? match.file : "departments.html";
}

function renderAdminDepartment(department) {
  const services = department.services && department.services.length
    ? department.services.slice(0, 6).map(service => `
      <tr>
        <td><a class="table-link" href="${profileHref(service.patientID)}">${escapeHtml(service.patientID)}</a></td>
        <td>${escapeHtml(service.patientName)}</td>
        <td>${escapeHtml(service.description)}</td>
        <td>${money(service.cost)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4">No services recorded yet.</td></tr>`;

  return `
    <article class="admin-department-card">
      <div class="admin-department-head">
        <div>
          <h3>${escapeHtml(department.name)}</h3>
          <p>${department.patientCount || 0} patients, ${department.staffCount || 0} staff, ${department.serviceCount || 0} services</p>
        </div>
        <strong>${money(department.revenue || 0)}</strong>
      </div>
      <div class="admin-card-actions">
        <a class="btn btn-secondary" href="${departmentFileForName(department.name)}">Open Workspace</a>
        <a class="btn btn-light" href="patientprofile.html">View Patient Profile</a>
        <a class="btn btn-light" href="billing.html">Open Billing</a>
      </div>

      <div class="admin-mini-grid">
        ${metricCard("Doctors", department.doctorCount || 0)}
        ${metricCard("Nurses", department.nurseCount || 0)}
        ${metricCard("Technicians", department.technicianCount || 0)}
        ${metricCard("Patients", department.patientCount || 0)}
      </div>

      <div class="admin-roster">
        <div><strong>Doctors</strong>${renderNameList(department.doctors, "No doctors assigned")}</div>
        <div><strong>Nurses</strong>${renderNameList(department.nurses, "No nurses assigned")}</div>
        <div><strong>Patients</strong>${renderNameList(department.patients, "No patients recorded")}</div>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr><th>Patient ID</th><th>Patient</th><th>Recent Service</th><th>Cost</th></tr></thead>
          <tbody>${services}</tbody>
        </table>
      </div>
    </article>
  `;
}

async function loadAdminOverview() {
  const summary = document.getElementById("adminSummary");
  const departmentPanel = document.getElementById("adminDepartments");
  if (!summary || !departmentPanel) return;

  summary.innerHTML = metricCard("Loading", "...");
  departmentPanel.innerHTML = `<p>Loading department details...</p>`;

  try {
    const overview = await apiRequest("/billing/admin-overview");
    const totals = overview.totals || {};

    summary.innerHTML = [
      ["Patients", totals.patients || 0],
      ["Doctors", totals.doctors || 0],
      ["Nurses", totals.nurses || 0],
      ["Technicians", totals.technicians || 0],
      ["Active Staff", totals.activeStaff || 0],
      ["Departments", totals.departments || 0],
      ["Services", totals.services || 0],
      ["Revenue", money(totals.revenue || 0)]
    ].map(([label, value]) => metricCard(label, value)).join("");

    departmentPanel.innerHTML = (overview.departments || []).length
      ? overview.departments.map(renderAdminDepartment).join("")
      : `<p>No department data is available yet.</p>`;

    await showStats();
  } catch (err) {
    summary.innerHTML = "";
    departmentPanel.innerHTML = `<div class="notice is-visible">${escapeHtml(err.message || "Unable to load admin overview.")}</div>`;
  }
}

function setupNavigation() {
  if (document.body.classList.contains("home-page")) return;

  if (document.body.classList.contains("departments-page")) {
    const topNav = document.querySelector(".top-nav");
    if (!topNav) return;
    const visibleItems = navItems.filter(([label, page, , roles]) => hasRole(roles) && canSeeDepartmentItem(page, label));
    topNav.innerHTML = visibleItems.map(([label, page]) => {
      const href = label === "Home" ? "../index.html" : page;
      return `<a href="${href}">${label}</a>`;
    }).join("");
    topNav.innerHTML += auth ? `<button class="nav-button" onclick="logoutStaff()">Sign Out</button>` : `<a href="login.html">Sign In</a>`;
    return;
  }

  const header = document.querySelector("header");
  if (!header) return;
  header.querySelector(".app-nav")?.remove();
  header.querySelector(".staff-chip")?.remove();

  const current = location.pathname.split("/").pop();
  const nav = document.createElement("nav");
  nav.className = "app-nav";
  nav.setAttribute("aria-label", "EMR modules");

  const visibleItems = navItems.filter(([label, page, , roles]) => hasRole(roles) && canSeeDepartmentItem(page, label));
  nav.innerHTML = visibleItems.map(([label, page, homePage]) => {
    const href = label === "Home" ? "../index.html" : page;
    const isActive = current === page || (homePage && current === homePage);
    return `<a class="${isActive ? "is-active" : ""}" href="${href}">${label}</a>`;
  }).join("");

  nav.innerHTML += current === "login.html"
    ? ""
    : auth ? `<button class="nav-button" onclick="logoutStaff()">Sign Out</button>` : `<a href="login.html">Sign In</a>`;

  header.append(nav);

  if (auth?.staff && current !== "login.html") {
    const chip = document.createElement("span");
    chip.className = "staff-chip";
    chip.textContent = `${auth.staff.name} - ${auth.staff.role}`;
    header.append(chip);
  }
}

function departmentLabelFromPage() {
  const heading = document.querySelector("header h2")?.textContent || document.title || "Department";
  if (["Outpatient Department", "Dental Department"].includes(heading.trim())) return heading.trim();
  return heading.replace(/\s+Dashboard$/i, "").replace(/\s+Department$/i, "").trim();
}

function metricSetForDepartment(label) {
  const key = label.toLowerCase();
  const sets = {
    "patient profile": [["Records", "Protected"], ["Timeline", "Complete"], ["Access", "Role based"], ["Status", "Ready"]],
    icu: [["Beds", "6"], ["Critical", "3"], ["Ventilated", "2"], ["Rounds", "Due"]],
    mch: [["Clinic", "Open"], ["ANC", "12"], ["Immunization", "18"], ["Follow-ups", "6"]],
    mortuary: [["Cases", "4"], ["Released", "2"], ["Pending", "1"], ["Storage", "Available"]],
    rental: [["Assets", "18"], ["Issued", "7"], ["Returns", "3"], ["Revenue", "KES 9K"]],
    staff: [["Staff", "Active"], ["Roles", "Protected"], ["Accounts", "Managed"], ["Audit", "On"]]
  };
  return sets[key] || [["Queue", "Active"], ["Waiting", "6"], ["Completed", "14"], ["Handoffs", "3"]];
}

function createQuickStats(label) {
  const stats = document.createElement("div");
  stats.className = "quick-stats";
  stats.innerHTML = metricSetForDepartment(label).map(([metricLabel, number]) => `
    <div class="stat-card">
      <div class="number">${escapeHtml(number)}</div>
      <div class="label">${escapeHtml(metricLabel)}</div>
    </div>
  `).join("");
  return stats;
}

function createFieldMarkup(field) {
  const [label, kind, name, options, type] = field;
  if (kind === "select") {
    return `
      <label>${escapeHtml(label)}
        <select name="${escapeHtml(name)}">
          ${(options || []).map(option => `<option>${escapeHtml(option)}</option>`).join("")}
        </select>
      </label>
    `;
  }
  if (kind === "textarea") {
    return `
      <label class="span-2">${escapeHtml(label)}
        <textarea name="${escapeHtml(name)}"></textarea>
      </label>
    `;
  }
  return `
    <label>${escapeHtml(label)}
      <input name="${escapeHtml(name)}"${type ? ` type="${escapeHtml(type)}"` : ""}>
    </label>
  `;
}

function enhanceDepartmentForms() {
  document.querySelectorAll("[data-department-form]").forEach(form => {
    if (form.dataset.reliabilityEnhanced === "true") return;
    const department = form.dataset.departmentForm;
    const fields = reliabilityFields[department] || [
      ["Priority", "select", "priority", ["Routine", "Urgent", "Emergency"]],
      ["Status", "select", "status", ["Pending", "Completed", "Needs review"]],
      ["Staff Notes", "textarea", "staffNotes"]
    ];

    const existingNames = new Set(Array.from(form.elements).map(element => element.name).filter(Boolean));
    const missingFields = fields.filter(([, , name]) => !existingNames.has(name));
    if (!missingFields.length) return;

    const button = form.querySelector("button[type='submit'], button");
    const wrapper = document.createElement("div");
    wrapper.className = "form-grid reliability-fields";
    wrapper.innerHTML = missingFields.map(createFieldMarkup).join("");

    Array.from(wrapper.children).forEach(child => {
      form.insertBefore(child, button || null);
    });
    form.dataset.reliabilityEnhanced = "true";
  });
}

function ensureHeroImage(title) {
  const hero = document.querySelector(".dashboard-hero");
  if (!hero || hero.querySelector(".hero-image")) return;

  const key = title.toLowerCase();
  const image = departmentVisuals[key];
  if (!image) return;

  const img = document.createElement("img");
  img.className = "hero-image";
  img.src = `../images/${image}`;
  img.alt = title;
  hero.append(img);
}

function enhanceDepartmentWorkScene(title) {
  const hero = document.querySelector(".dashboard-hero");
  const main = document.querySelector("main");
  if (!hero || !main || main.querySelector(".department-work-scene")) return;

  const key = title.toLowerCase();
  const image = departmentVisuals[key] || "doctor.svg";
  const scene = document.createElement("section");
  scene.className = "department-work-scene";
  scene.innerHTML = `
    <div>
      <p class="eyebrow">Team at work</p>
      <h2>${escapeHtml(title)} service desk</h2>
      <p>Staff can record care activity, review recent work, and request ICT help when the system, computers, printers, or network need attention.</p>
    </div>
    <div class="work-scene-images">
      <img src="../images/clinical-team.svg" alt="Clinical staff at work">
      <img src="../images/${escapeHtml(image)}" alt="${escapeHtml(title)} team at work">
    </div>
  `;
  hero.after(scene);
}

function addIctSupportPanel(title) {
  const main = document.querySelector("main");
  if (!main || main.querySelector(".ict-support-panel")) return;
  if (title.toLowerCase() === "ict department") return;

  const panel = document.createElement("section");
  panel.className = "ict-support-panel";
  panel.innerHTML = `
    <div>
      <p class="eyebrow">System or network issue?</p>
      <h2>Call ICT Department</h2>
      <p>Open an ICT ticket for EMR errors, network downtime, slow internet, printer issues, device faults, or account access problems in ${escapeHtml(title)}.</p>
    </div>
    <a class="btn btn-secondary" href="ict.html">Open ICT Support</a>
  `;
  main.append(panel);
}

function addDepartmentIdentityPanel(title) {
  const main = document.querySelector("main");
  const hero = document.querySelector(".dashboard-hero");
  if (!main || !hero || main.querySelector(".department-identity-panel")) return;

  const key = title.toLowerCase();
  const image = departmentVisuals[key] || "departments.svg";
  const capabilities = departmentCapabilities[key] || ["Patient ID", "Department service", "Cost", "Notes", "Recent activity"];
  const targets = capabilityTargets[key] || {};

  const panel = document.createElement("section");
  panel.className = "department-identity-panel";
  panel.innerHTML = `
    <div class="department-logo-lockup">
      <img src="../images/${escapeHtml(image)}" alt="${escapeHtml(title)} logo">
      <div>
        <p class="eyebrow">Department</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
    </div>
    <div class="department-capability-list" aria-label="${escapeHtml(title)} services">
      ${capabilities.map(item => targets[item]
        ? `<button type="button" class="capability-chip" data-capability-target="${escapeHtml(targets[item])}">${escapeHtml(item)}</button>`
        : `<span>${escapeHtml(item)}</span>`
      ).join("")}
    </div>
  `;
  hero.after(panel);
}

function activateCapabilityTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
  target.classList.add("field-highlight");
  setTimeout(() => target.classList.remove("field-highlight"), 1200);
}

function addPatientProfileLookup(title) {
  const main = document.querySelector("main");
  const hero = document.querySelector(".dashboard-hero");
  const key = title.toLowerCase();
  if (!main || !hero || main.querySelector(".department-profile-lookup")) return;
  if (["patient profile", "admin dashboard", "blood donation", "mortuary"].includes(key)) return;

  const panel = document.createElement("section");
  panel.className = "department-profile-lookup";
  panel.innerHTML = `
    <div>
      <p class="eyebrow">Patient record</p>
      <h2>View Patient Profile</h2>
    </div>
    <form data-profile-lookup class="inline-lookup">
      <input name="patientID" placeholder="Patient ID" required>
      <button type="submit">Open Profile</button>
    </form>
  `;
  hero.after(panel);
}

function addGenericDepartmentOverviewPanel() {
  const main = document.querySelector("main");
  const form = document.querySelector("[data-department-form]");
  if (!main || !form || main.querySelector("#genericDepartmentOverview")) return;
  const department = form.dataset.departmentForm;
  if (!shouldUseGenericDepartmentOverview(department)) return;

  const panel = document.createElement("section");
  panel.className = "department-records-overview";
  panel.id = "genericDepartmentOverview";
  panel.innerHTML = `<p>Loading ${escapeHtml(department)} records...</p>`;
  main.append(panel);
}

function enhanceHospitalDashboard() {
  if (
    document.body.classList.contains("home-page") ||
    document.body.classList.contains("auth-page") ||
    document.body.classList.contains("departments-page")
  ) return;

  const header = document.querySelector("header");
  const main = document.querySelector("main");
  if (!header || !main) return;

  document.body.classList.add("department-page");
  header.classList.add("hospital-header");

  const title = departmentLabelFromPage();
  ensureHeroImage(title);
  addDepartmentIdentityPanel(title);
  addPatientProfileLookup(title);
  enhanceDepartmentWorkScene(title);
  addIctSupportPanel(title);
  const h2 = header.querySelector("h2");
  if (h2 && !header.querySelector(".header-kicker")) {
    const kicker = document.createElement("span");
    kicker.className = "header-kicker";
    kicker.textContent = "Referral Hospital EMR";
    h2.before(kicker);
  }

  const hero = main.querySelector(".dashboard-hero");
  if (hero) {
    hero.classList.add("clinical-dashboard-hero");
    if (!hero.querySelector(".ward-strip")) {
      const strip = document.createElement("div");
      strip.className = "ward-strip";
      strip.innerHTML = `
        <span>Live queue</span>
        <span>Clinical notes</span>
        <span>Billing linked</span>
      `;
      hero.append(strip);
    }
    if (!main.querySelector(".quick-stats")) {
      hero.after(createQuickStats(title));
    }
  }

  const firstForm = main.querySelector("form");
  const formPanel = firstForm?.closest(".form-panel");
  if (formPanel && !formPanel.querySelector(".panel-title")) {
    const panelTitle = document.createElement("div");
    panelTitle.className = "panel-title";
    panelTitle.innerHTML = `<span>${escapeHtml(title.slice(0, 3).toUpperCase())}</span><strong>${escapeHtml(title)} Workstation</strong>`;
    formPanel.prepend(panelTitle);
  }
  addGenericDepartmentOverviewPanel();
}

function protectPage() {
  const roles = (document.body.dataset.roles || "").split(",").map(item => item.trim()).filter(Boolean);
  if (!roles.length) return true;
  if (!auth) {
    location.href = "login.html";
    return false;
  }
  if (!hasRole(roles)) {
    document.querySelector("main").innerHTML = `<div class="notice is-visible">You are signed in, but your role is not authorized for this page.</div>`;
    return false;
  }
  const form = document.querySelector("[data-department-form]");
  const page = location.pathname.split("/").pop();
  if (auth.staff?.role !== "admin" && form && !canSeeDepartmentItem(page, form.dataset.departmentForm)) {
    document.querySelector("main").innerHTML = `<div class="notice is-visible">You are assigned to ${escapeHtml(auth.staff.department)} and cannot open this department workspace.</div>`;
    return false;
  }
  return true;
}

function setupForms() {
  document.getElementById("loginForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const data = formData(event.currentTarget);
    loginStaff(data.username, data.password);
  });

  document.getElementById("registerForm")?.addEventListener("submit", event => {
    event.preventDefault();
    registerStaffFromForm(event.currentTarget);
  });

  document.getElementById("createStaffForm")?.addEventListener("submit", event => {
    event.preventDefault();
    createStaffFromForm(event.currentTarget);
  });

  document.getElementById("registrationForm")?.addEventListener("submit", event => {
    event.preventDefault();
    registerPatientFromForm(event.currentTarget);
  });

  document.querySelectorAll("[data-department-form]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      recordDepartmentForm(event.currentTarget, event.currentTarget.dataset.departmentForm);
    });
  });

  document.getElementById("bloodRequestForm")?.addEventListener("submit", event => {
    event.preventDefault();
    requestBloodFromForm(event.currentTarget);
  });

  document.querySelectorAll("[data-profile-lookup]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const patientID = form.querySelector("[name='patientID']")?.value;
      if (clean(patientID)) location.href = profileHref(patientID);
    });
  });

  document.querySelectorAll("[data-capability-target]").forEach(button => {
    button.addEventListener("click", event => {
      activateCapabilityTarget(event.currentTarget.dataset.capabilityTarget);
    });
  });
}

async function initAuthPage() {
  const statusHint = document.getElementById("statusHint");
  if (!statusHint) return;
  statusHint.textContent = "Only an administrator can create staff accounts. Contact admin if you do not have login credentials.";
}

async function initStaffPage() {
  const createForm = document.getElementById("createStaffForm");
  if (!createForm) return;
  await fetchAndDisplayStaff();
}

function renderDepartmentCards(gridId, includeDepartmentsLink = true, linkPrefix = "pages/", assetPrefix = "") {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const departments = (includeDepartmentsLink ? allDepartments : allDepartments.slice(1))
    .filter(dept => document.body.classList.contains("home-page") || canSeeDepartmentItem(dept.file, dept.name));

  grid.innerHTML = departments.map(dept => `
    <a href="${linkPrefix}${dept.file}" class="module-card" title="Go to ${escapeHtml(dept.name)}">
      <div class="module-image">
        <img src="${assetPrefix}${dept.image}" alt="${escapeHtml(dept.name)} icon" loading="lazy">
      </div>
      <div class="module-copy">
        <strong>${escapeHtml(dept.name)}</strong>
        <p>${escapeHtml(dept.label)}</p>
      </div>
    </a>
  `).join("");
}

function populateDepartmentGrid() {
  renderDepartmentCards("departmentGrid", true, "pages/", "");
}

loadState();

document.addEventListener("DOMContentLoaded", () => {
  loadRuntimeConfig().then(() => checkApi()).then(async () => {
    enhanceHospitalDashboard();
    setupNavigation();
    enhanceDepartmentForms();
    setupForms();
    if (document.body.classList.contains("home-page")) {
      populateDepartmentGrid();
    }
    if (document.body.classList.contains("departments-page")) {
      renderDepartmentCards("departmentsPageGrid", false, "", "../");
    }
    if (location.pathname.endsWith("login.html")) {
      await initAuthPage();
    }
    if (location.pathname.endsWith("staff.html")) {
      await initStaffPage();
    }
    if (!protectPage()) return;
    if (location.pathname.endsWith("registration.html")) {
      await refreshRegistrationPatientID();
    }
    if (location.pathname.endsWith("mortuary.html")) {
      refreshMortuaryID();
    }
    if (location.pathname.endsWith("admin.html")) {
      await loadAdminOverview();
    }
    await initDepartmentPage();
    if (document.getElementById("stats")) showStats();
  });
});
