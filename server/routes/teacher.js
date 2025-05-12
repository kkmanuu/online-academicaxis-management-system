const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { auth, checkRole } = require('../middleware/auth');

// Debug middleware to log all requests
const logRequest = (req, res, next) => {
  console.log('Teacher route - Request:', {
    path: req.path,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
};

// Log teacherController exports for debugging
console.log('teacherController exports:', Object.keys(teacherController));

// Apply authentication middleware to all routes
router.use(auth);

// Apply role check middleware to ensure only teachers can access these routes
router.use(checkRole(['teacher']));

// Get teacher's courses
if (!teacherController.getCourses) throw new Error('teacherController.getCourses is undefined');
router.get('/courses', logRequest, teacherController.getCourses);

// Create a new course
if (!teacherController.createCourse) throw new Error('teacherController.createCourse is undefined');
router.post('/courses', logRequest, teacherController.createCourse);

// Update a course
if (!teacherController.updateCourse) throw new Error('teacherController.updateCourse is undefined');
router.put('/courses/:courseId', logRequest, teacherController.updateCourse);

// Delete a course
if (!teacherController.deleteCourse) throw new Error('teacherController.deleteCourse is undefined');
router.delete('/courses/:courseId', logRequest, teacherController.deleteCourse);

// Get teacher's exams
if (!teacherController.getExams) throw new Error('teacherController.getExams is undefined');
router.get('/exams', logRequest, teacherController.getExams);

// Create a new exam
if (!teacherController.createExam) throw new Error('teacherController.createExam is undefined');
router.post('/exams', logRequest, teacherController.createExam);

// Delete an exam
if (!teacherController.deleteExam) throw new Error('teacherController.deleteExam is undefined');
router.delete('/exams/:examId', logRequest, teacherController.deleteExam);

// Update a question (only include if updateQuestion is defined)
if (teacherController.updateQuestion) {
  router.put('/exams/:examId/questions/:questionId', logRequest, auth, checkRole(['teacher']), teacherController.updateQuestion);
} else {
  console.warn('updateQuestion route skipped: teacherController.updateQuestion is undefined');
}

// Get exam results
if (!teacherController.getExamResults) throw new Error('teacherController.getExamResults is undefined');
router.get('/exams/:examId/results', logRequest, teacherController.getExamResults);

// Get all student results for teacher's exams
if (!teacherController.getAllResults) throw new Error('teacherController.getAllResults is undefined');
router.get('/results', logRequest, teacherController.getAllResults);

// Get enrolled students
if (!teacherController.getEnrolledStudents) throw new Error('teacherController.getEnrolledStudents is undefined');
router.get('/students', logRequest, teacherController.getEnrolledStudents);

// Get teacher statistics
if (!teacherController.getStatistics) throw new Error('teacherController.getStatistics is undefined');
router.get('/statistics', logRequest, teacherController.getStatistics);

// Add question to exam
router.post('/exams/:examId/questions', teacherController.addQuestion);

// Update question
router.put('/exams/:examId/questions/:questionId', teacherController.updateQuestion);

// Delete question
router.delete('/exams/:examId/questions/:questionId', teacherController.deleteQuestion);

// Enroll students in an exam
if (!teacherController.enrollStudentsInExam) throw new Error('teacherController.enrollStudentsInExam is undefined');
router.post('/exams/:examId/enroll', logRequest, teacherController.enrollStudentsInExam);

// Unenroll students from an exam
if (!teacherController.unenrollStudentsFromExam) throw new Error('teacherController.unenrollStudentsFromExam is undefined');
router.post('/exams/:examId/unenroll', logRequest, teacherController.unenrollStudentsFromExam);

module.exports = router;