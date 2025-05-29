const User = require('../models/User');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Exam = require('../models/Exam');

// Add a new user
exports.addUser = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      // Validate input
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Prevent multiple admins
      if (role === 'admin') {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
          return res.status(400).json({ message: 'Admin account already exists' });
        }
      }
  
      // Create new user
      const user = new User({
        name,
        email,
        password,
        role
      });
  
      await user.save();
  
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked
        }
      });
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ message: 'Error adding user', error: error.message });
    }
  };
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can perform this action' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the block status
    user.isBlocked = !user.isBlocked;
    await user.save();

    console.log(`User ${user._id} ${user.isBlocked ? 'blocked' : 'unblocked'} by admin ${req.user._id}`);

    res.json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
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
        console.log('Fetching all exam results');
        const results = await Result.find()
            .populate('student', 'name email')
            .populate({
                path: 'exam',
                select: 'title course',
                populate: {
                    path: 'course',
                    select: 'name'
                }
            })
            .sort({ submittedAt: -1 })
            .lean();

        console.log(`Found ${results.length} results`);
        if (results.length > 0) {
            console.log('First result raw data:', JSON.stringify(results[0], null, 2));
            console.log('First result formatted:', {
                id: results[0]._id,
                studentName: results[0].student?.name || 'Unknown',
                examTitle: results[0].exam?.title || 'Unknown',
                courseName: results[0].exam?.course?.name || 'Unknown',
                courseId: results[0].exam?.course?._id || 'Unknown',
                percentage: results[0].percentage,
                status: results[0].status
            });
        }

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
            .populate('student', 'name email')
            .populate({
                path: 'exam',
                select: 'title course',
                populate: {
                    path: 'course',
                    select: 'name'
                }
            })
            .sort({ submittedAt: -1 })
            .lean();
        
        console.log(`Found ${results.length} results for student ${studentId}`);
        if (results.length > 0) {
            console.log('First result raw data:', JSON.stringify(results[0], null, 2));
            console.log('First result formatted:', {
                id: results[0]._id,
                studentName: results[0].student?.name || 'Unknown',
                examTitle: results[0].exam?.title || 'Unknown',
                courseName: results[0].exam?.course?.name || 'Unknown',
                courseId: results[0].exam?.course?._id || 'Unknown',
                percentage: results[0].percentage,
                status: results[0].status
            });
        }
        
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
            .populate({
                path: 'exam',
                select: 'title course',
                populate: {
                    path: 'course',
                    select: 'name'
                    
                }
            })
            .sort({ submittedAt: -1 })
            .lean();
        
        console.log(`Found ${results.length} results for exam ${examId}`);
        if (results.length > 0) {
            console.log('First result raw data:', JSON.stringify(results[0], null, 2));
            console.log('First result formatted:', {
                id: results[0]._id,
                studentName: results[0].student?.name || 'Unknown',
                examTitle: results[0].exam?.title || 'Unknown',
                courseName: results[0].exam?.course?.name || 'Unknown',
                courseId: results[0].exam?.course?._id || 'Unknown',
                percentage: results[0].percentage,
                status: results[0].status
            });
        }
        
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