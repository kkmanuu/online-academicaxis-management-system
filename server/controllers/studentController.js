const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const Result = require('../models/Result');

exports.getDashboardData = async (req, res) => {
  try {
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getDashboardData - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }
    const studentId = req.user._id;

    const enrolledCourses = await Course.countDocuments({ students: studentId })
      .catch(err => {
        console.error('getDashboardData - Error counting enrolled courses:', err);
        throw new Error('Failed to count enrolled courses');
      });

    const completedExams = await Result.countDocuments({ student: studentId })
      .catch(err => {
        console.error('getDashboardData - Error counting completed exams:', err);
        throw new Error('Failed to count completed exams');
      });

    const exams = await Exam.find({
      isActive: true,
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() }
    })
      .populate('course', 'name students')
      .lean()
      .catch(err => {
        console.error('getDashboardData - Error fetching exams:', err);
        throw new Error('Failed to fetch exams');
      });

    const availableExams = exams.filter(exam => {
      if (!exam.course || !Array.isArray(exam.course.students)) {
        console.warn('getDashboardData - Invalid course or students array:', exam);
        return false;
      }
      return exam.course.students.some(s => s.toString() === studentId.toString());
    }).length;

    const results = await Result.find({ student: studentId })
      .select('percentage')
      .lean()
      .catch(err => {
        console.error('getDashboardData - Error fetching results for average score:', err);
        throw new Error('Failed to fetch results');
      });
    const averageScore = results.length > 0
      ? results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length
      : 0;

    const recentResults = await Result.find({ student: studentId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate({
        path: 'exam',
        select: 'title course totalMarks',
        populate: { path: 'course', select: 'name' }
      })
      .lean()
      .catch(err => {
        console.error('getDashboardData - Error fetching recent results:', err);
        throw new Error('Failed to fetch recent results');
      });

    const courses = await Course.find({ students: studentId })
      .populate('teacher', 'name')
      .lean()
      .catch(err => {
        console.error('getDashboardData - Error fetching courses:', err);
        throw new Error('Failed to fetch courses');
      });

    const courseStatuses = await Promise.all(courses.map(async course => {
      try {
        if (!mongoose.Types.ObjectId.isValid(course._id)) {
          console.warn('getDashboardData - Invalid course ID:', course._id);
          return null;
        }

        const exams = await Exam.find({ course: course._id })
          .select('_id')
          .lean()
          .catch(err => {
            console.error('getDashboardData - Error fetching exams for course:', { courseId: course._id, err });
            throw new Error(`Failed to fetch exams for course ${course._id}`);
          });

        const examIds = exams.map(exam => exam._id);
        const results = await Result.find({
          student: studentId,
          exam: { $in: examIds }
        })
          .lean()
          .catch(err => {
            console.error('getDashboardData - Error fetching results for course:', { courseId: course._id, err });
            throw new Error(`Failed to fetch results for course ${course._id}`);
          });

        const allPassed = examIds.length > 0 && results.length === examIds.length && results.every(r => r.status === 'pass');
        const status = allPassed ? 'completed' : results.length > 0 ? 'in_progress' : 'not_started';

        return {
          _id: course._id,
          name: course.name || 'Unknown',
          teacher: course.teacher?.name || 'Unknown',
          status
        };
      } catch (err) {
        console.error('getDashboardData - Error processing course:', { courseId: course._id, err });
        return null;
      }
    }));

    const validCourseStatuses = courseStatuses.filter(course => course !== null);

    const dashboardData = {
      stats: {
        enrolledCourses,
        completedExams,
        pendingExams: availableExams,
        averageScore: parseFloat(averageScore.toFixed(2))
      },
      results: recentResults,
      courses: validCourseStatuses
    };

    console.log('getDashboardData - Success:', {
      studentId,
      stats: dashboardData.stats,
      resultCount: dashboardData.results.length,
      courseCount: dashboardData.courses.length
    });
    res.json(dashboardData);
  } catch (error) {
    console.error('getDashboardData - Error:', {
      message: error.message,
      stack: error.stack,
      studentId: req.user?._id
    });
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    console.log('getStatistics - Start:', { studentId: req.user?._id });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getStatistics - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const results = await Result.find({ student: req.user._id }).lean();
    const totalExams = results.length;
    const passedExams = results.filter(r => r.status === 'pass').length;
    const averageScore = totalExams > 0 
      ? (results.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalExams).toFixed(2)
      : 0;

    const statistics = {
      totalExams,
      passedExams,
      failedExams: totalExams - passedExams,
      averageScore: parseFloat(averageScore),
      completionRate: totalExams > 0 ? ((passedExams / totalExams) * 100).toFixed(2) : 0
    };

    console.log('getStatistics - Success:', { studentId: req.user._id, statistics });
    res.json(statistics);
  } catch (error) {
    console.error('getStatistics - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

exports.getAvailableExams = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student with enrolled courses
    const student = await User.findById(studentId).populate('courses');
    
    if (!student || !student.courses || student.courses.length === 0) {
      return res.json([]);
    }
    
    const courseIds = student.courses.map(course => course._id);
    
    // Get exams for enrolled courses that haven't been taken
    const takenExamIds = (await Result.find({ student: studentId }))
      .map(result => result.exam);
    
    // Find exams for courses the student is enrolled in
    const availableExams = await Exam.find({
      course: { $in: courseIds },
      _id: { $nin: takenExamIds },
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() }
    }).populate('course', 'name');

    console.log(`Found ${availableExams.length} available exams for student ${studentId}`);
    console.log('Course IDs:', courseIds);
    console.log('Taken exam IDs:', takenExamIds);

    res.json(availableExams);
  } catch (error) {
    console.error('Error getting available exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTeacherExams = async (req, res) => {
  try {
    console.log('getTeacherExams - Start:', { studentId: req.user?._id });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getTeacherExams - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const student = await User.findById(req.user._id).populate('enrolledTeacher');
    if (!student) {
      console.warn('getTeacherExams - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.enrolledTeacher) {
      console.log('getTeacherExams - No teacher selected for student:', req.user._id);
      return res.status(200).json([]);
    }

    const exams = await Exam.find({
      teacher: student.enrolledTeacher._id,
      enrolledStudents: req.user._id,
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() }
    })
      .populate('course', 'name')
      .lean();

    console.log('getTeacherExams - Success:', { studentId: req.user._id, teacherId: student.enrolledTeacher._id, examCount: exams.length });
    res.json(exams);
  } catch (error) {
    console.error('getTeacherExams - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching teacher exams', error: error.message });
  }
};

exports.getExamDetails = async (req, res) => {
    try {
      const { examId } = req.params;
      const studentId = req.user.id;
  
      // Check if student is enrolled in the course for this exam
      const exam = await Exam.findById(examId)
        .populate('course', 'name students')
        .populate('questions');
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Check if student is enrolled in the course
      if (!exam.course.students.includes(studentId)) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
  
      // Check if exam is currently active
      const now = new Date();
      if (now < exam.startTime || now > exam.endTime) {
        return res.status(400).json({ message: 'Exam is not currently active' });
      }
  
      // Check if student has already taken this exam
      const existingResult = await Result.findOne({
        student: studentId,
        exam: examId
      });
  
      if (existingResult) {
        return res.status(400).json({ message: 'You have already taken this exam' });
      }
  
      // Return exam details without answers
      const examDetails = {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        course: exam.course.name,
        questions: exam.questions ? exam.questions.map(q => ({
          _id: q._id,
          text: q.question,
          options: q.options,
          marks: q.marks
        })) : []
      };
  
      console.log('Sending exam details:', examDetails);
      res.json(examDetails);
    } catch (error) {
      console.error('Error getting exam details:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  exports.submitExam = async (req, res) => {
    try {
      const { examId } = req.params;
      const { answers } = req.body;
      const studentId = req.user.id;
  
      console.log('Submitting exam:', { examId, studentId, answers });
  
      // Get exam details with populated fields
      const exam = await Exam.findById(examId)
        .populate('questions')
        .populate('teacher')
        .populate('course');
      
      if (!exam) {
        console.error('Exam not found:', examId);
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      console.log('Exam found:', { 
        id: exam._id, 
        title: exam.title, 
        teacher: exam.teacher ? exam.teacher._id : 'Not populated',
        course: exam.course ? exam.course._id : 'Not populated',
        questionsCount: exam.questions ? exam.questions.length : 0
      });
  
      // Check if exam is still active
      const now = new Date();
      if (now > exam.endTime) {
        console.error('Exam submission time has expired:', { 
          examId, 
          endTime: exam.endTime, 
          currentTime: now 
        });
        return res.status(400).json({ message: 'Exam submission time has expired' });
      }
  
      // Check if student has already submitted
      const existingResult = await Result.findOne({
        student: studentId,
        exam: examId
      });
  
      if (existingResult) {
        console.error('Student has already submitted this exam:', { 
          studentId, 
          examId, 
          resultId: existingResult._id 
        });
        return res.status(400).json({ message: 'You have already submitted this exam' });
      }
  
      // Format answers for the Result model
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => {
        const question = exam.questions.find(q => q._id.toString() === questionId);
        if (!question) {
          console.warn(`Question with ID ${questionId} not found in exam`);
          return null;
        }
        
        // Convert string answer to number (0-based index)
        let numericAnswer;
        if (typeof selectedOption === 'string') {
          // Convert 'a', 'b', 'c', 'd' to 0, 1, 2, 3
          numericAnswer = selectedOption.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
        } else {
          numericAnswer = selectedOption;
        }
        
        const isCorrect = numericAnswer === question.correctAnswer;
        return {
          questionIndex: exam.questions.findIndex(q => q._id.toString() === questionId),
          selectedAnswer: numericAnswer, // Use the numeric answer
          isCorrect,
          marksObtained: isCorrect ? question.marks : 0
        };
      }).filter(Boolean); // Remove null entries
  
      console.log('Formatted answers:', formattedAnswers);
  
      // Calculate score
      const totalMarks = exam.totalMarks;
      const marksObtained = formattedAnswers.reduce((sum, answer) => sum + answer.marksObtained, 0);
      const percentage = (marksObtained / totalMarks) * 100;
      const status = percentage >= exam.passingMarks ? 'pass' : 'fail';
  
      console.log('Score calculation:', { 
        totalMarks, 
        marksObtained, 
        percentage, 
        status, 
        passingMarks: exam.passingMarks 
      });
  
      // Ensure all required fields are present
      if (!exam.teacher || !exam.course) {
        console.error('Missing required fields:', { 
          teacher: exam.teacher ? 'Present' : 'Missing', 
          course: exam.course ? 'Present' : 'Missing' 
        });
        return res.status(500).json({ message: 'Exam data is incomplete' });
      }
  
      // Create result with explicit teacher ID
      const result = new Result({
        student: studentId,
        exam: examId,
        teacher: exam.teacher._id, // Use the teacher ID from the populated exam
        course: exam.course._id, // Use the course ID from the populated exam
        answers: formattedAnswers,
        totalMarks,
        marksObtained,
        percentage,
        status,
        submittedAt: new Date()
      });
  
      console.log('Saving result:', result);
      await result.save();
  
      res.json({
        message: 'Exam submitted successfully',
        score: percentage
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.getResults = async (req, res) => {
    try {
      const studentId = req.user.id;
      console.log('Fetching results for student:', studentId);
  
      const results = await Result.find({ student: studentId })
        .populate('exam', 'title course')
        .populate('exam.course', 'name')
        .sort({ submittedAt: -1 });
  
      console.log(`Found ${results.length} results for student ${studentId}`);
      
      if (results.length > 0) {
        console.log('First result:', {
          id: results[0]._id,
          examTitle: results[0].exam ? results[0].exam.title : 'No exam title',
          courseName: results[0].exam && results[0].exam.course ? results[0].exam.course.name : 'No course name',
          percentage: results[0].percentage,
          status: results[0].status
        });
      }
  
      res.json(results);
    } catch (error) {
      console.error('Error getting results:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Server error' });
    }
  };

exports.getEnrolledCourses = async (req, res) => {
  try {
    console.log('getEnrolledCourses - Start:', { studentId: req.user?._id });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getEnrolledCourses - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const student = await User.findById(req.user._id).populate({
      path: 'courses',
      populate: { path: 'teacher', select: 'name email profilePicture' }
    });

    if (!student) {
      console.warn('getEnrolledCourses - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    const courses = student.courses || [];
    console.log('getEnrolledCourses - Success:', { studentId: req.user._id, courseCount: courses.length });
    res.json(courses);
  } catch (error) {
    console.error('getEnrolledCourses - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    console.log('getAvailableCourses - Start:', { studentId: req.user?._id });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getAvailableCourses - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const student = await User.findById(req.user._id).populate('enrolledTeacher', 'name email profilePicture');
    if (!student) {
      console.warn('getAvailableCourses - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.enrolledTeacher || !mongoose.isValidObjectId(student.enrolledTeacher._id)) {
      console.log('getAvailableCourses - No valid teacher selected for student:', req.user._id);
      return res.status(200).json({
        message: 'Please select a teacher first before viewing available courses',
        courses: []
      });
    }

    const courses = await Course.find({
      teacher: student.enrolledTeacher._id,
      isActive: true,
      students: { $ne: req.user._id }
    })
      .populate('teacher', 'name email profilePicture')
      .lean();

    console.log('getAvailableCourses - Success:', { studentId: req.user._id, teacherId: student.enrolledTeacher._id, courseCount: courses.length });
    res.json(courses);
  } catch (error) {
    console.error('getAvailableCourses - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching available courses', error: error.message });
  }
};

exports.enrollInCourse = async (req, res) => {
  try {
    console.log('enrollInCourse - Start:', { studentId: req.user?._id, courseId: req.params.courseId });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('enrollInCourse - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const courseId = req.params.courseId;
    if (!mongoose.isValidObjectId(courseId)) {
      console.warn('enrollInCourse - Invalid course ID:', courseId);
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const student = await User.findById(req.user._id);
    if (!student) {
      console.warn('enrollInCourse - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.warn('enrollInCourse - Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isActive) {
      console.warn('enrollInCourse - Course is not active:', courseId);
      return res.status(400).json({ message: 'Cannot enroll in an inactive course' });
    }

    if (course.students.includes(req.user._id)) {
      console.log('enrollInCourse - Student already enrolled:', { studentId: req.user._id, courseId });
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    if (!student.enrolledTeacher || !course.teacher.equals(student.enrolledTeacher)) {
      console.warn('enrollInCourse - Teacher mismatch:', {
        studentId: req.user._id,
        courseTeacher: course.teacher,
        enrolledTeacher: student.enrolledTeacher
      });
      return res.status(400).json({ message: 'You must select the course teacher first' });
    }

    course.students.push(req.user._id);
    await course.save();

    student.courses = student.courses || [];
    student.courses.push(courseId);
    await student.save();

    console.log('enrollInCourse - Success:', { studentId: req.user._id, courseId });
    res.json({ message: 'Enrolled in course successfully', course });
  } catch (error) {
    console.error('enrollInCourse - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error enrolling in course', error: error.message });
  }
};

exports.getAvailableTeachers = async (req, res) => {
  try {
    console.log('getAvailableTeachers - Start:', { studentId: req.user?._id });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getAvailableTeachers - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const teachers = await User.find({ role: 'teacher', isBlocked: false })
      .select('name email profilePicture')
      .lean();

    console.log('getAvailableTeachers - Success:', { studentId: req.user._id, teacherCount: teachers.length });
    res.json(teachers);
  } catch (error) {
    console.error('getAvailableTeachers - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching available teachers', error: error.message });
  }
};

exports.selectTeacher = async (req, res) => {
  try {
    console.log('selectTeacher - Start:', { studentId: req.user?._id, teacherId: req.params.teacherId });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('selectTeacher - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const teacherId = req.params.teacherId;
    if (!mongoose.isValidObjectId(teacherId)) {
      console.warn('selectTeacher - Invalid teacher ID:', teacherId);
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const student = await User.findById(req.user._id);
    if (!student) {
      console.warn('selectTeacher - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      console.warn('selectTeacher - Teacher not found or not a teacher:', teacherId);
      return res.status(404).json({ message: 'Teacher not found or not a teacher' });
    }

    if (teacher.isBlocked) {
      console.warn('selectTeacher - Teacher is blocked:', teacherId);
      return res.status(400).json({ message: 'Cannot select a blocked teacher' });
    }

    if (student.enrolledTeacher && student.enrolledTeacher.equals(teacherId)) {
      console.log('selectTeacher - Teacher already selected:', { studentId: req.user._id, teacherId });
      return res.status(400).json({ message: 'This teacher is already selected' });
    }

    student.enrolledTeacher = teacherId;
    await student.save();

    console.log('selectTeacher - Success:', { studentId: req.user._id, teacherId });
    res.json({ message: 'Teacher selected successfully', teacher: { _id: teacher._id, name: teacher.name } });
  } catch (error) {
    console.error('selectTeacher - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error selecting teacher', error: error.message });
  }
};

exports.getMyTeacher = async (req, res) => {
  try {
    console.log('getMyTeacher - Start:', { studentId: req.user?._id });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getMyTeacher - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const student = await User.findById(req.user._id).populate('enrolledTeacher', 'name email profilePicture');
    if (!student) {
      console.warn('getMyTeacher - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    const teacher = student.enrolledTeacher ? {
      _id: student.enrolledTeacher._id,
      name: student.enrolledTeacher.name,
      email: student.enrolledTeacher.email,
      profilePicture: student.enrolledTeacher.profilePicture
    } : null;

    console.log('getMyTeacher - Success:', { studentId: req.user._id, teacherId: teacher?._id });
    res.json(teacher);
  } catch (error) {
    console.error('getMyTeacher - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching enrolled teacher', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log('getProfile - Start:', { studentId: req.user?._id });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('getProfile - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const student = await User.findById(req.user._id).select('-password');
    if (!student) {
      console.warn('getProfile - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('getProfile - Success:', { studentId: req.user._id, email: student.email });
    res.json(student);
  } catch (error) {
    console.error('getProfile - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('updateProfile - Start:', { studentId: req.user?._id, body: req.body });

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.warn('updateProfile - Invalid or missing user ID:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, email, profilePicture } = req.body;
    if (!name && !email && !profilePicture) {
      console.warn('updateProfile - No fields provided:', { studentId: req.user._id });
      return res.status(400).json({ message: 'At least one field (name, email, profilePicture) must be provided' });
    }

    const student = await User.findById(req.user._id);
    if (!student) {
      console.warn('updateProfile - Student not found:', req.user._id);
      return res.status(404).json({ message: 'Student not found' });
    }

    if (name) student.name = name;
    if (profilePicture) student.profilePicture = profilePicture;

    if (email && email !== student.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.warn('updateProfile - Invalid email format:', { studentId: req.user._id, email });
        return res.status(400).json({ message: 'Invalid email format' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.warn('updateProfile - Email already in use:', { studentId: req.user._id, email });
        return res.status(400).json({ message: 'Email already in use' });
      }
      student.email = email;
    }

    await student.save();
    const updatedStudent = await User.findById(req.user._id).select('-password');

    console.log('updateProfile - Success:', { studentId: req.user._id, email: updatedStudent.email });
    res.json({ message: 'Profile updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('updateProfile - Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

module.exports = exports;