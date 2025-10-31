const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { auth, checkRole } = require("../middleware/auth");

// Debug middleware to log all requests
const logRequest = (req, res, next) => {
  console.log("Student route - Request:", {
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

// Apply role check middleware to ensure only students can access these routes
router.use(checkRole(["student"]));

// Get student dashboard data
router.get("/dashboard", logRequest, (req, res, next) => {
  if (!studentController.getDashboardData) {
    console.error("studentController.getDashboardData is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getDashboardData(req, res, next);
});

// Get student statistics
router.get("/statistics", logRequest, (req, res, next) => {
  if (!studentController.getStatistics) {
    console.error("studentController.getStatistics is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getStatistics(req, res, next);
});

// Get available exams
router.get("/exams/available", logRequest, (req, res, next) => {
  if (!studentController.getAvailableExams) {
    console.error("studentController.getAvailableExams is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getAvailableExams(req, res, next);
});

// Debug endpoint for available exams
router.get("/exams/debug", logRequest, (req, res, next) => {
  if (!studentController.getAvailableExams) {
    console.error("studentController.getAvailableExams is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getAvailableExams(req, res, next);
});

// Get teacher's exams for the student
router.get("/teacher-exams", logRequest, (req, res, next) => {
  if (!studentController.getTeacherExams) {
    console.error("studentController.getTeacherExams is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getTeacherExams(req, res, next);
});

// Get exam details
router.get("/exams/:examId", logRequest, (req, res, next) => {
  if (!studentController.getExamDetails) {
    console.error("studentController.getExamDetails is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getExamDetails(req, res, next);
});

// Submit exam
router.post("/exams/:examId/submit", logRequest, (req, res, next) => {
  if (!studentController.submitExam) {
    console.error("studentController.submitExam is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.submitExam(req, res, next);
});

// Get student results
router.get("/results", logRequest, (req, res, next) => {
  if (!studentController.getResults) {
    console.error("studentController.getResults is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getResults(req, res, next);
});

// Get enrolled courses
router.get("/enrolled-courses", logRequest, (req, res, next) => {
  if (!studentController.getEnrolledCourses) {
    console.error("studentController.getEnrolledCourses is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getEnrolledCourses(req, res, next);
});

// Get available courses
router.get("/available-courses", logRequest, (req, res, next) => {
  if (!studentController.getAvailableCourses) {
    console.error("studentController.getAvailableCourses is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getAvailableCourses(req, res, next);
});

// Enroll in a course
router.post("/enroll/:courseId", logRequest, (req, res, next) => {
  if (!studentController.enrollInCourse) {
    console.error("studentController.enrollInCourse is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.enrollInCourse(req, res, next);
});

// Get available teachers
router.get("/available-teachers", logRequest, (req, res, next) => {
  if (!studentController.getAvailableTeachers) {
    console.error("studentController.getAvailableTeachers is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getAvailableTeachers(req, res, next);
});

// Select a teacher
router.post("/select-teacher/:teacherId", logRequest, (req, res, next) => {
  if (!studentController.selectTeacher) {
    console.error("studentController.selectTeacher is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.selectTeacher(req, res, next);
});

// Get student's enrolled teacher
router.get("/my-teacher", logRequest, (req, res, next) => {
  if (!studentController.getMyTeacher) {
    console.error("studentController.getMyTeacher is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getMyTeacher(req, res, next);
});

// Get student profile
router.get("/profile", logRequest, (req, res, next) => {
  if (!studentController.getProfile) {
    console.error("studentController.getProfile is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.getProfile(req, res, next);
});

// Update student profile
router.put("/profile", logRequest, (req, res, next) => {
  if (!studentController.updateProfile) {
    console.error("studentController.updateProfile is undefined");
    return res.status(500).json({ message: "Server configuration error" });
  }
  studentController.updateProfile(req, res, next);
});

module.exports = router;