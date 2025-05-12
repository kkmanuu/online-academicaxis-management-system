const User = require('../models/User');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Exam = require('../models/Exam');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .populate('courses', 'name')
            .sort({ name: 1 });
        
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

// Get all users (students and teachers)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['student', 'teacher'] } })
            .select('-password')
            .populate('enrolledTeacher', 'name email')
            .populate('courses', 'name');
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Block/unblock a user
exports.toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Toggle the block status
        user.isBlocked = !user.isBlocked;
        await user.save();
        
        // Log the action
        console.log(`User ${user._id} ${user.isBlocked ? 'blocked' : 'unblocked'} by admin ${req.user._id}`);
        
        res.json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        console.error('Error toggling user block status:', error);
        res.status(500).json({ message: 'Error updating user block status', error: error.message });
    }
};

// Get system statistics
exports.getStatistics = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalCourses = await Course.countDocuments();
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        
        res.json({
            totalStudents,
            totalTeachers,
            totalCourses,
            blockedUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

// Get user details with enrollments
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('enrolledTeacher', 'name email')
            .populate('courses', 'name description');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
};

// Get all exam results
exports.getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate('student', 'name email')
            .populate('exam', 'title course')
            .populate('course', 'name')
            .sort({ submittedAt: -1 });
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching all results:', error);
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
};

// Get results for a specific student
exports.getStudentResults = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        console.log('Fetching results for student:', studentId);
        
        const results = await Result.find({ student: studentId })
            .populate('exam', 'title course')
            .populate('course', 'name')
            .sort({ submittedAt: -1 });
        
        console.log(`Found ${results.length} results for student ${studentId}`);
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching student results:', error);
        res.status(500).json({ message: 'Error fetching student results', error: error.message });
    }
};

// Get results for a specific exam
exports.getExamResults = async (req, res) => {
    try {
        const examId = req.params.examId;
        console.log('Fetching results for exam:', examId);
        
        const results = await Result.find({ exam: examId })
            .populate('student', 'name email')
            .populate('course', 'name')
            .sort({ submittedAt: -1 });
        
        console.log(`Found ${results.length} results for exam ${examId}`);
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching exam results:', error);
        res.status(500).json({ message: 'Error fetching exam results', error: error.message });
    }
};

// Update a result (admin review/correction)
exports.updateResult = async (req, res) => {
    try {
        const resultId = req.params.resultId;
        const { marksObtained, totalMarks, status } = req.body;
        
        const result = await Result.findById(resultId);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        
        // Update result fields
        result.marksObtained = marksObtained;
        result.totalMarks = totalMarks;
        result.percentage = (marksObtained / totalMarks) * 100;
        result.status = status;
        
        await result.save();
        
        res.json({
            message: 'Result updated successfully',
            result
        });
    } catch (error) {
        console.error('Error updating result:', error);
        res.status(500).json({ message: 'Error updating result', error: error.message });
    }
};

// Get all exams
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate('course', 'name')
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

// Get exam details
exports.getExamDetails = async (req, res) => {
    try {
        const examId = req.params.examId;
        const exam = await Exam.findById(examId)
            .populate('course', 'name')
            .populate('teacher', 'name email');
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json(exam);
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ message: 'Error fetching exam details', error: error.message });
    }
}; 