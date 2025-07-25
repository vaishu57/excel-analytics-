const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const mongoose = require("mongoose");
const path = require("path");
const ExcelData = require("./models/ExcelData");

const app = express();
const PORT = 3000;

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/excelAnalytics", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("excelFile"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    await ExcelData.insertMany(jsonData); // Save to MongoDB

    res.render("result", { data: jsonData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing Excel file.");
  }
});

app.get("/data", async (req, res) => {
  const data = await ExcelData.find({});
  res.render("result", { data });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

