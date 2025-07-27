const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { auth, checkRole } = require("../middleware/auth");

// Debug middleware to log all requests
const logRequest = (req, res, next) => {
  console.log("Teacher route - Request:", {
    path: req.path,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
  });
  next();
};

// Apply authentication middleware to all routes
router.use(auth);

// Apply role check middleware to ensure only teachers can access these routes
router.use(checkRole(["teacher"]));

// Get teacher's courses
router.get("/courses", logRequest, (req, res, next) => {
  if (!teacherController.getCourses) {
    console.error("teacherController.getCourses is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.getCourses(req, res, next);
});

// Create a new course
router.post("/courses", logRequest, (req, res, next) => {
  if (!teacherController.createCourse) {
    console.error("teacherController.createCourse is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.createCourse(req, res, next);
});

// Update a course
router.put("/courses/:courseId", logRequest, (req, res, next) => {
  if (!teacherController.updateCourse) {
    console.error("teacherController.updateCourse is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.updateCourse(req, res, next);
});

// Delete a course
router.delete("/courses/:courseId", logRequest, (req, res, next) => {
  if (!teacherController.deleteCourse) {
    console.error("teacherController.deleteCourse is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.deleteCourse(req, res, next);
});

// Get teacher's exams
router.get("/exams", logRequest, (req, res, next) => {
  if (!teacherController.getExams) {
    console.error("teacherController.getExams is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.getExams(req, res, next);
});

// Create a new exam
router.post("/exams", logRequest, (req, res, next) => {
  if (!teacherController.createExam) {
    console.error("teacherController.createExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.createExam(req, res, next);
});

// Delete an exam
router.delete("/exams/:examId", logRequest, (req, res, next) => {
  if (!teacherController.deleteExam) {
    console.error("teacherController.deleteExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.deleteExam(req, res, next);
});

// Add question to exam
router.post("/exams/:examId/questions", logRequest, (req, res, next) => {
  if (!teacherController.addQuestion) {
    console.error("teacherController.addQuestion is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.addQuestion(req, res, next);
});

// Update question
router.put("/exams/:examId/questions/:questionId", logRequest, (req, res, next) => {
  if (!teacherController.updateQuestion) {
    console.error("teacherController.updateQuestion is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.updateQuestion(req, res, next);
});

// Delete question
router.delete("/exams/:examId/questions/:questionId", logRequest, (req, res, next) => {
  if (!teacherController.deleteQuestion) {
    console.error("teacherController.deleteQuestion is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.deleteQuestion(req, res, next);
});

// Enroll students in an exam
router.post("/exams/:examId/enroll", logRequest, (req, res, next) => {
  if (!teacherController.enrollStudentsInExam) {
    console.error("teacherController.enrollStudentsInExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.enrollStudentsInExam(req, res, next);
});

// Unenroll students from an exam
router.post("/exams/:examId/unenroll", logRequest, (req, res, next) => {
  if (!teacherController.unenrollStudentsFromExam) {
    console.error("teacherController.unenrollStudentsFromExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.unenrollStudentsFromExam(req, res, next);
});

// Get exam results
router.get("/exams/:examId/results", logRequest, (req, res, next) => {
  if (!teacherController.getExamResults) {
    console.error("teacherController.getExamResults is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.getExamResults(req, res, next);
});

// Get all student results for teacher's exams
router.get("/results", logRequest, (req, res, next) => {
  if (!teacherController.getAllResults) {
    console.error("teacherController.getAllResults is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.getAllResults(req, res, next);
});

// Get enrolled students
router.get("/students", logRequest, (req, res, next) => {
  if (!teacherController.getEnrolledStudents) {
    console.error("teacherController.getEnrolledStudents is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.getEnrolledStudents(req, res, next);
});

// Get teacher statistics
router.get("/statistics", logRequest, (req, res, next) => {
  if (!teacherController.getStatistics) {
    console.error("teacherController.getStatistics is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  teacherController.getStatistics(req, res, next);
});

module.exports = router;