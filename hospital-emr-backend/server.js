const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const nurseRoutes = require("./routes/nurseRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const billingRoutes = require("./routes/billingRoutes");
const { seedStaff } = require("./utils/seedStaff");
const { seedDepartments } = require("./utils/seedDepartments");

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, "..", "hospital-emr-frontend");

const corsOrigins = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.length
    ? (origin, callback) => callback(null, !origin || corsOrigins.includes(origin))
    : true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function connectMongo(retries = 5, delayMs = 2000) {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set");
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000
  };

  let attempt = 0;
  while (attempt < retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, options);
      return;
    } catch (err) {
      attempt += 1;
      const remaining = retries - attempt;
      console.error(`MongoDB connection attempt ${attempt} failed: ${err.name}: ${err.message}`);
      if (!remaining) {
        throw err;
      }
      console.log(`Retrying MongoDB connection in ${Math.round(delayMs / 1000)} seconds... (${remaining} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

async function startServer() {
  try {
    await connectMongo();
    await seedStaff();
    await seedDepartments();
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed. Check that MongoDB is installed and running on the MONGO_URI address.");
    console.error(`MONGO_URI=${process.env.MONGO_URI}`);
    console.error(`${err.name}: ${err.message}`);
    process.exit(1);
  }
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "mongodb" : "starting",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/nurses", nurseRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/billing", billingRoutes);

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

startServer();
