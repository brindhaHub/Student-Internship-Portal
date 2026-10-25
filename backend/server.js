
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Application = require("./models/Application");

const app = express();

app.use(cors({
  origin: (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map(url => url.trim())
}));

app.use(express.json());

// Available internships
const internships = [
  {
    id: "web-dev",
    title: "Web Development Intern",
    company: "Tech Solutions",
    duration: "3 months",
    description: "Build responsive websites using HTML, CSS and React."
  },
  {
    id: "python",
    title: "Python Developer Intern",
    company: "CodeWorks",
    duration: "2 months",
    description: "Develop Python programs and work with APIs."
  },
  {
    id: "data-analytics",
    title: "Data Analytics Intern",
    company: "Data Insights",
    duration: "3 months",
    description: "Analyze datasets and create reports using Python."
  }
];

// Test whether the API is running
app.get("/", (req, res) => {
  res.json({
    message: "Student Internship Portal API is running"
  });
});

// GET: Retrieve all available internships
app.get("/api/internships", (req, res) => {
  res.json(internships);
});

// GET: Retrieve one internship by ID
app.get("/api/internships/:id", (req, res) => {
  const internship = internships.find(
    item => item.id === req.params.id
  );

  if (!internship) {
    return res.status(404).json({
      message: "Internship not found"
    });
  }

  res.json(internship);
});

// POST: Submit a student application
app.post("/api/applications", async (req, res) => {
  try {
    const { studentName, email, rollNumber, internship } = req.body;

    if (
      typeof studentName !== "string" || !studentName.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof rollNumber !== "string" || !rollNumber.trim() ||
      typeof internship !== "string" || !internship.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    const selectedInternship = internships.find(
      item => item.title === internship.trim()
    );

    if (!selectedInternship) {
      return res.status(400).json({
        message: "Please select a valid internship"
      });
    }

    const application = await Application.create({
      studentName: studentName.trim(),
      email: cleanEmail,
      rollNumber: rollNumber.trim(),
      internship: selectedInternship.title
    });

    return res.status(201).json({
      message: "Application submitted successfully!",
      application
    });
  } catch (error) {
    console.error("Application submission error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Application validation failed"
      });
    }

    return res.status(500).json({
      message: "Unable to submit application"
    });
  }
});

// GET: Retrieve all submitted applications from MongoDB
app.get("/api/applications", async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    console.error("Application retrieval error:", error);

    return res.status(500).json({
      message: "Unable to retrieve applications"
    });
  }
});

// Connect to the existing ByteXL MongoDB database
// before starting the server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
