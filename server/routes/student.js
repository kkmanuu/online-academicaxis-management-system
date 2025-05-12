const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, checkRole } = require('../middleware/auth');

// Debug middleware to log all requests
const logRequest = (req, res, next) => {
  console.log('Student route - Request:', {
    path: req.path,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
};

// Log studentController exports for debugging
console.log('studentController exports:', Object.keys(studentController));

// Apply authentication middleware to all routes
router.use(auth);

// Apply role check middleware to ensure only students can access these routes
router.use(checkRole(['student']));

// Get student dashboard data
if (!studentController.getDashboardData) throw new Error('studentController.getDashboardData is undefined');
router.get('/dashboard', logRequest, studentController.getDashboardData);

// Get student statistics
if (!studentController.getStatistics) throw new Error('studentController.getStatistics is undefined');
router.get('/statistics', logRequest, studentController.getStatistics);

// Get available exams
if (!studentController.getAvailableExams) throw new Error('studentController.getAvailableExams is undefined');
router.get('/exams/available', logRequest, studentController.getAvailableExams);


// Debug endpoint for available exams
router.get('/exams/debug', logRequest, studentController.getAvailableExams);



// Get teacher's exams for the student
if (!studentController.getTeacherExams) throw new Error('studentController.getTeacherExams is undefined');
router.get('/teacher-exams', logRequest, studentController.getTeacherExams);

// Get exam details
if (!studentController.getExamDetails) throw new Error('studentController.getExamDetails is undefined');
router.get('/exams/:examId', logRequest, studentController.getExamDetails);

// Submit exam
if (!studentController.submitExam) throw new Error('studentController.submitExam is undefined');
router.post('/exams/:examId/submit', logRequest, studentController.submitExam);

// Get student results
if (!studentController.getResults) throw new Error('studentController.getResults is undefined');
router.get('/results', logRequest, studentController.getResults);

// Get enrolled courses
if (!studentController.getEnrolledCourses) throw new Error('studentController.getEnrolledCourses is undefined');
router.get('/enrolled-courses', logRequest, studentController.getEnrolledCourses);

// Get available courses
if (!studentController.getAvailableCourses) throw new Error('studentController.getAvailableCourses is undefined');
router.get('/available-courses', logRequest, studentController.getAvailableCourses);

// Enroll in a course
if (!studentController.enrollInCourse) throw new Error('studentController.enrollInCourse is undefined');
router.post('/enroll/:courseId', logRequest, studentController.enrollInCourse);

// Get available teachers
if (!studentController.getAvailableTeachers) throw new Error('studentController.getAvailableTeachers is undefined');
router.get('/available-teachers', logRequest, studentController.getAvailableTeachers);

// Select a teacher
if (!studentController.selectTeacher) throw new Error('studentController.selectTeacher is undefined');
router.post('/select-teacher/:teacherId', logRequest, studentController.selectTeacher);

// Get student's enrolled teacher
if (!studentController.getMyTeacher) throw new Error('studentController.getMyTeacher is undefined');
router.get('/my-teacher', logRequest, studentController.getMyTeacher);

// Get student profile
if (!studentController.getProfile) throw new Error('studentController.getProfile is undefined');
router.get('/profile', logRequest, studentController.getProfile);

// Update student profile
if (!studentController.updateProfile) throw new Error('studentController.updateProfile is undefined');
router.put('/profile', logRequest, studentController.updateProfile);

module.exports = router;