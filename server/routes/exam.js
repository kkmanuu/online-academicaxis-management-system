const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/auth");
const examController = require("../controllers/examController");

// Debug middleware to log all requests
const logRequest = (req, res, next) => {
  console.log("Exam route - Request:", {
    path: req.path,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
  });
  next();
};

// Apply auth middleware to all routes
router.use(auth);

// Create a new exam
router.post("/", checkRole(["teacher"]), logRequest, (req, res, next) => {
  if (!examController.createExam) {
    console.error("examController.createExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  examController.createExam(req, res, next);
});

// Add questions to an exam
router.post("/:examId/questions", checkRole(["teacher"]), logRequest, (req, res, next) => {
  if (!examController.addQuestions) {
    console.error("examController.addQuestions is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  examController.addQuestions(req, res, next);
});

// Enroll students in an exam
router.post("/:examId/enroll", checkRole(["teacher"]), logRequest, (req, res, next) => {
  if (!examController.enrollStudents) {
    console.error("examController.enrollStudents is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  examController.enrollStudents(req, res, next);
});

// Get all exams for a teacher
router.get("/teacher", checkRole(["teacher"]), logRequest, (req, res, next) => {
  if (!examController.getTeacherExams) {
    console.error("examController.getTeacherExams is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  examController.getTeacherExams(req, res, next);
});

// Get exam details with questions
router.get("/:examId", checkRole(["teacher", "student"]), logRequest, (req, res, next) => {
  if (!examController.getExamDetails) {
    console.error("examController.getExamDetails is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  examController.getExamDetails(req, res, next);
});

// Update exam details
router.put("/:examId", checkRole(["teacher"]), logRequest, (req, res, next) => {
  if (!examController.updateExam) {
    console.error("examController.updateExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  examController.updateExam(req, res, next);
});

// Delete an exam
router.delete("/:examId", checkRole(["teacher"]), logRequest, (req, res, next) => {
  if (!examController.deleteExam) {
    console.error("examController.deleteExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  examController.deleteExam(req, res, next);
});

module.exports = router;