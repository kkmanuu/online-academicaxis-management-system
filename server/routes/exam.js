const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const examController = require('../controllers/examController');

// Apply auth middleware to all routes
router.use(auth);

// Create a new exam
router.post('/', checkRole(['teacher']), examController.createExam);

// Add questions to an exam
router.post('/:examId/questions', checkRole(['teacher']), examController.addQuestions);

// Enroll students in an exam
router.post('/:examId/enroll', checkRole(['teacher']), examController.enrollStudents);

// Get all exams for a teacher
router.get('/teacher', checkRole(['teacher']), examController.getTeacherExams);

// Get exam details with questions
router.get('/:examId', checkRole(['teacher', 'student']), examController.getExamDetails);

// Update exam details
router.put('/:examId', checkRole(['teacher']), examController.updateExam);

// Delete an exam
router.delete('/:examId', checkRole(['teacher']), examController.deleteExam);

module.exports = router; 