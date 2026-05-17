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
  ["X-Ray", "xray.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["MRI", "mri.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["Eye", "eye.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["ICU", "icu.html", null, ["admin", "doctor", "nurse"]],
  ["Maternity", "maternity.html", null, ["admin", "doctor", "nurse"]],
  ["MCH", "mch.html", null, ["admin", "doctor", "nurse"]],
  ["Theatre", "theatre.html", null, ["admin", "doctor", "nurse"]],
  ["Wards", "wards.html", null, ["admin", "doctor", "nurse"]],
  ["Pharmacy", "pharmacy.html", null, ["admin", "nurse", "technician"]],
  ["Chronic", "chronic.html", null, ["admin", "doctor", "nurse", "technician"]],
  ["ICT", "ict.html", null, ["admin", "technician"]],
  ["Blood", "blood donation.html", null, ["admin", "nurse", "technician"]],
  ["Mortuary", "mortuary.html", null, ["admin", "doctor"]],
  ["Rental", "rental.html", null, ["admin"]],
  ["Billing", "billing.html", null, ["admin", "nurse"]],
  ["Profile", "patientprofile.html", null, ["admin", "doctor", "nurse"]],
  ["Staff", "staff.html", null, ["admin"]],
  ["Admin", "admin.html", null, ["admin"]]
];

const allDepartments = [
  { name: "Departments", file: "departments.html", image: "images/departments.svg", label: "Browse every workspace" },
  { name: "Registration", file: "registration.html", image: "images/registration.svg", label: "Patient intake and admissions" },
  { name: "Doctor", file: "doctor.html", image: "images/doctor.svg", label: "Clinical review and consultations" },
  { name: "Nurse", file: "nurse.html", image: "images/nurse.svg", label: "Nursing workflow and care plans" },
  { name: "Laboratory", file: "laboratory.html", image: "images/laboratory.svg", label: "Diagnostics and lab results" },
  { name: "X-Ray", file: "xray.html", image: "images/xray.svg", label: "Radiology imaging unit" },
  { name: "MRI", file: "mri.html", image: "images/mri.svg", label: "Advanced diagnostic scans" },
  { name: "Eye Care", file: "eye.html", image: "images/eye.svg", label: "Ophthalmology services" },
  { name: "ICU", file: "icu.html", image: "images/icu.svg", label: "Critical care monitoring" },
  { name: "Maternity", file: "maternity.html", image: "images/maternity.svg", label: "Maternal health support" },
  { name: "MCH", file: "mch.html", image: "images/mch.svg", label: "Mother-child health services" },
  { name: "Theatre", file: "theatre.html", image: "images/theatre.svg", label: "Surgical theatre coordination" },
  { name: "Wards", file: "wards.html", image: "images/wards.svg", label: "Inpatient room assignments" },
  { name: "Pharmacy", file: "pharmacy.html", image: "images/pharmacy.svg", label: "Medication dispensing unit" },
  { name: "Chronic Centre", file: "chronic.html", image: "images/chronic.svg", label: "HIV/AIDS and TB care follow-up" },
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
  "chronic centre": "chronic.svg",
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
  "patient registration": ["Auto patient ID", "Patient identity", "Next of kin", "Insurance/SHA ID", "Allergies", "Medical history"],
  "rental department": ["Asset issue", "Room/facility rental", "Return status", "Approval", "Rental notes"],
  "staff management": ["Create staff account", "Assign role", "Assign department", "Manage access"],
  "theatre department": ["Surgery type", "Anesthesia", "Consent", "Surgeon", "Operative notes", "Outcome"],
  "wards department": ["Ward admission", "Bed assignment", "Daily care", "Discharge plan", "Progress notes"],
  "x-ray department": ["X-Ray imaging", "Image number", "Report status", "Radiographer", "Radiology findings"]
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
  ICT: [
    ["Department Affected", "input", "departmentAffected"],
    ["Priority", "select", "priority", ["Routine", "Urgent", "Critical"]],
    ["Resolution Status", "select", "status", ["Open", "In progress", "Resolved", "Escalated"]]
  ],
  "Blood Donation": [
    ["Blood Group", "select", "bloodGroup", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
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
  } catch {
    patients = [];
    services = {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ patients, services }));
}

function clean(value) {
  return String(value ?? "").trim();
}

function money(value) {
  return `${Number(value || 0).toLocaleString()} KES`;
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
      await refreshRegistrationPatientID();
      setTimeout(() => {
        location.href = `patientprofile.html?id=${encodeURIComponent(apiPatient.id)}`;
      }, 600);
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
  await refreshRegistrationPatientID();
  setTimeout(() => {
    location.href = `patientprofile.html?id=${encodeURIComponent(payload.patientID)}`;
  }, 600);
  return true;
}

async function addDepartmentActivity(payload) {
  const patientId = clean(payload.patientID);
  const department = clean(payload.department);
  const description = clean(payload.description);
  const amount = Number(payload.cost);

  if (!patientId || !department || !description) {
    notify("Patient ID, department, and activity summary are required.", "error");
    return false;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    notify("Enter a valid cost.", "error");
    return false;
  }

  const patient = await findPatient(patientId).catch(() => null);
  if (!patient) {
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
        body: JSON.stringify({ patientID: patient.id, ...service })
      });
    } catch (err) {
      notify(err.message, "error");
      return false;
    }
  }

  services[patient.id] = services[patient.id] || [];
  services[patient.id].push(service);
  saveState();
  notify(`${department} activity recorded for ${patient.name}.`, "success");
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
  }
}

function renderDepartmentActivityPanel(department, activities) {
  const rows = !Array.isArray(activities) || !activities.length
    ? `<tr><td colspan="5">No recent activity recorded for ${escapeHtml(department)}.</td></tr>`
    : activities.map(service => `
      <tr>
        <td>${escapeHtml(service.patientID || "")}</td>
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
        <thead><tr><th>Patient ID</th><th>Service</th><th>Recorded By</th><th>Date</th><th>Cost</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
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
      activities = await apiRequest(`/billing/recent/${encodeURIComponent(department)}`);
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
      <p><strong>Insurance:</strong> ${escapeHtml(patient.insuranceID)}</p>
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

function renderAdminDepartment(department) {
  const services = department.services && department.services.length
    ? department.services.slice(0, 6).map(service => `
      <tr>
        <td>${escapeHtml(service.patientID)}</td>
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
  if (document.body.classList.contains("home-page") || document.body.classList.contains("departments-page")) return;

  const header = document.querySelector("header");
  if (!header) return;
  header.querySelector(".app-nav")?.remove();
  header.querySelector(".staff-chip")?.remove();

  const current = location.pathname.split("/").pop();
  const nav = document.createElement("nav");
  nav.className = "app-nav";
  nav.setAttribute("aria-label", "EMR modules");

  const visibleItems = navItems.filter(([, , , roles]) => hasRole(roles));
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
      ${capabilities.map(item => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
  hero.after(panel);
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

  const departments = includeDepartmentsLink ? allDepartments : allDepartments.slice(1);

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
