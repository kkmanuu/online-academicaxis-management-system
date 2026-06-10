const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  toggleUserBlock,
  getStatistics,
  getUserDetails,
  getAllResults,
  getStudentResults,
  getExamResults,
  updateResult,
  getAllExams,
  getExamDetails,
  getAllStudents,
  addUser,
} = require("../controllers/adminController");
const { auth, checkRole } = require("../middleware/auth");


// All routes require authentication and admin role
router.post("/users", auth, checkRole(["admin"]), addUser);

// Get all users
router.get("/users", auth, checkRole(["admin"]), getAllUsers);

// Get all students
router.get("/students", auth, checkRole(["admin"]), getAllStudents);

// Block/unblock a user
router.put("/users/:id/block", auth, checkRole(["admin"]), toggleUserBlock);

// Get system statistics
router.get("/statistics", auth, checkRole(["admin"]), getStatistics);

// Get user details
router.get("/users/:id", auth, checkRole(["admin"]), getUserDetails);

// Get all exams
router.get("/exams", auth, checkRole(["admin"]), getAllExams);

// Get exam details
router.get("/exams/:examId", auth, checkRole(["admin"]), getExamDetails);

// Get all exam results
router.get("/results", auth, checkRole(["admin"]), getAllResults);

// Get results for a specific student
router.get("/students/:studentId/results", auth, checkRole(["admin"]), getStudentResults);

// Get results for a specific exam
router.get("/exams/:examId/results", auth, checkRole(["admin"]), getExamResults);

// Update a result
router.put("/results/:resultId", auth, checkRole(["admin"]), updateResult);

module.exports = router;
