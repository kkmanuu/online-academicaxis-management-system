const express = require('express');
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
    addUser
} = require('../controllers/adminController');
const { auth, checkRole } = require('../middleware/auth');

// All routes require authentication and admin role
router.post('/users', auth, checkRole(['admin']), addUser);

// Get all users
router.get('/users', getAllUsers);

// Get all students
router.get('/students', getAllStudents);

// Block/unblock a user
router.put('/users/:id/block', toggleUserBlock);

// Get system statistics
router.get('/statistics', getStatistics);

// Get user details
router.get('/users/:id', getUserDetails);

// Get all exams
router.get('/exams', getAllExams);

// Get exam details
router.get('/exams/:examId', getExamDetails);

// Get all exam results
router.get('/results', getAllResults);

// Get results for a specific student
router.get('/students/:studentId/results', getStudentResults);

// Get results for a specific exam
router.get('/exams/:examId/results', getExamResults);

// Update a result
router.put('/results/:resultId', updateResult);

module.exports = router; 