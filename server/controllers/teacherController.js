const Course = require('../models/Course');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Result = require('../models/Result');
const mongoose = require('mongoose');

// Get teacher's courses
exports.getCourses = async (req, res) => {
    try {
        console.log('getCourses - Start:', { teacherId: req.user?._id });

        if (!req.user || !req.user._id) {
            console.warn('getCourses - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const courses = await Course.find({ teacher: req.user._id })
            .populate('students', 'name email')
            .lean();

        console.log(`getCourses - Found ${courses.length} courses for teacher ${req.user._id}`);
        res.json(courses);
    } catch (error) {
        console.error('getCourses - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
};

// Add question to exam
exports.addQuestion = async (req, res) => {
    try {
      const { examId } = req.params;
      const { question, options, correctAnswer, marks } = req.body;
  
      // Validate inputs
      if (!question || !options || correctAnswer === undefined || marks === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'At least 2 options are required' });
      }
  
      if (correctAnswer < 0 || correctAnswer >= options.length) {
        return res.status(400).json({ message: 'Invalid correct answer index' });
      }
  
      if (marks <= 0) {
        return res.status(400).json({ message: 'Marks must be greater than 0' });
      }
  
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      if (!exam.teacher.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to modify this exam' });
      }
  
      const newQuestion = {
        question,
        options,
        correctAnswer,
        marks
      };
  
      exam.questions.push(newQuestion);
      await exam.save();
  
      res.status(201).json({ message: 'Question added successfully', question: newQuestion });
    } catch (error) {
      console.error('Error adding question:', error);
      res.status(500).json({ message: 'Error adding question', error: error.message });
    }
  };
  
  // Update question
  exports.updateQuestion = async (req, res) => {
    try {
      const { examId, questionId } = req.params;
      const { question, options, correctAnswer, marks } = req.body;
  
      // Validate inputs (same as addQuestion)
      // ...
  
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      if (!exam.teacher.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to modify this exam' });
      }
  
      const questionToUpdate = exam.questions.id(questionId);
      if (!questionToUpdate) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      questionToUpdate.question = question;
      questionToUpdate.options = options;
      questionToUpdate.correctAnswer = correctAnswer;
      questionToUpdate.marks = marks;
  
      await exam.save();
  
      res.json({ message: 'Question updated successfully', question: questionToUpdate });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ message: 'Error updating question', error: error.message });
    }
  };
  
  // Delete question
  exports.deleteQuestion = async (req, res) => {
    try {
      const { examId, questionId } = req.params;
  
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      if (!exam.teacher.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to modify this exam' });
      }
  
      exam.questions.pull(questionId);
      await exam.save();
  
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
  };

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        console.log('createCourse - Start:', { teacherId: req.user?._id, body: req.body });

        if (!req.user || !req.user._id) {
            console.warn('createCourse - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { name, description } = req.body;
        if (!name) {
            console.warn('createCourse - Missing name:', { teacherId: req.user._id });
            return res.status(400).json({ message: 'Course name is required' });
        }

        const course = new Course({
            name,
            description: description || '',
            teacher: req.user._id,
            isActive: true
        });

        await course.save();
        console.log('createCourse - Success:', { courseId: course._id, teacherId: req.user._id });
        res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
        console.error('createCourse - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    try {
        console.log('updateCourse - Start:', { teacherId: req.user?._id, courseId: req.params.courseId });

        if (!req.user || !req.user._id) {
            console.warn('updateCourse - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const courseId = req.params.courseId;
        if (!mongoose.isValidObjectId(courseId)) {
            console.warn('updateCourse - Invalid course ID:', courseId);
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const { name, description, isActive } = req.body;
        if (!name && !description && isActive === undefined) {
            console.warn('updateCourse - No fields provided:', { teacherId: req.user._id, courseId });
            return res.status(400).json({ message: 'At least one field (name, description, isActive) must be provided' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            console.warn('updateCourse - Course not found:', courseId);
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.teacher.equals(req.user._id)) {
            console.warn('updateCourse - Unauthorized:', { teacherId: req.user._id, courseId });
            return res.status(403).json({ message: 'You are not authorized to update this course' });
        }

        if (name) course.name = name;
        if (description) course.description = description;
        if (isActive !== undefined) course.isActive = isActive;

        await course.save();
        console.log('updateCourse - Success:', { courseId, teacherId: req.user._id });
        res.json({ message: 'Course updated successfully', course });
    } catch (error) {
        console.error('updateCourse - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    try {
        console.log('deleteCourse - Start:', { teacherId: req.user?._id, courseId: req.params.courseId });

        if (!req.user || !req.user._id) {
            console.warn('deleteCourse - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const courseId = req.params.courseId;
        if (!mongoose.isValidObjectId(courseId)) {
            console.warn('deleteCourse - Invalid course ID:', courseId);
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            console.warn('deleteCourse - Course not found:', courseId);
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.teacher.equals(req.user._id)) {
            console.warn('deleteCourse - Unauthorized:', { teacherId: req.user._id, courseId });
            return res.status(403).json({ message: 'You are not authorized to delete this course' });
        }

        await Exam.deleteMany({ course: courseId });
        await course.deleteOne();

        console.log('deleteCourse - Success:', { courseId, teacherId: req.user._id });
        res.json({ message: 'Course and related exams deleted successfully' });
    } catch (error) {
        console.error('deleteCourse - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
};

// Get teacher's exams
exports.getExams = async (req, res) => {
    try {
        console.log('getExams - Start:', { teacherId: req.user?._id });

        if (!req.user || !req.user._id) {
            console.warn('getExams - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const exams = await Exam.find({ teacher: req.user._id })
            .populate('course', 'name')
            .populate('enrolledStudents', 'name email')
            .lean();

        console.log(`getExams - Found ${exams.length} exams for teacher ${req.user._id}`);
        res.json(exams);
    } catch (error) {
        console.error('getExams - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

// Create a new exam
exports.createExam = async (req, res) => {
    try {
        console.log('createExam - Start:', { teacherId: req.user?._id, body: req.body });

        if (!req.user || !req.user._id) {
            console.warn('createExam - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { courseId, title, description, duration, startTime, endTime, passingMarks, questions } = req.body;

        // Validate inputs
        if (!courseId || !title || !duration || !startTime || !endTime || !passingMarks) {
            console.warn('createExam - Missing required fields:', { teacherId: req.user._id });
            return res.status(400).json({ message: 'All required fields (courseId, title, duration, startTime, endTime, passingMarks) must be provided' });
        }

        if (!mongoose.isValidObjectId(courseId)) {
            console.warn('createExam - Invalid course ID:', courseId);
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        // Validate startTime and endTime
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn('createExam - Invalid date format:', { startTime, endTime });
            return res.status(400).json({ message: 'Invalid startTime or endTime format. Use ISO format (e.g., 2025-05-03T10:00:00Z)' });
        }

        // Ensure endTime is at least 1 minute after startTime
        const minDuration = 60 * 1000; // 1 minute in milliseconds
        if (end.getTime() <= start.getTime() + minDuration) {
            console.warn('createExam - endTime must be at least 1 minute after startTime:', { startTime, endTime });
            return res.status(400).json({ message: 'endTime must be at least 1 minute after startTime' });
        }

        // Prevent endTime from being in the past
        if (end.getTime() < now.getTime()) {
            console.warn('createExam - endTime is in the past:', { endTime });
            return res.status(400).json({ message: 'endTime cannot be in the past' });
        }

        // Validate course
        const course = await Course.findById(courseId);
        if (!course) {
            console.warn('createExam - Course not found:', courseId);
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.teacher.equals(req.user._id)) {
            console.warn('createExam - Unauthorized: Teacher does not own course:', { teacherId: req.user._id, courseId });
            return res.status(403).json({ message: 'You are not authorized to create exams for this course' });
        }

        if (!course.isActive) {
            console.warn('createExam - Course is not active:', courseId);
            return res.status(400).json({ message: 'Cannot create exam for an inactive course' });
        }

        // Validate questions (if provided)
        if (questions && Array.isArray(questions)) {
            for (const q of questions) {
                if (!q.text || !q.correctAnswer || typeof q.marks !== 'number') {
                    console.warn('createExam - Invalid question format:', q);
                    return res.status(400).json({ message: 'Each question must have text, correctAnswer, and marks' });
                }
            }
        }

        // Create exam
        const exam = new Exam({
            course: courseId,
            teacher: req.user._id,
            title,
            description: description || '',
            duration,
            startTime: start,
            endTime: end,
            passingMarks,
            questions: questions || [],
            isActive: true
        });

        await exam.save();
        console.log('createExam - Success:', { examId: exam._id, teacherId: req.user._id, courseId });
        res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (error) {
        console.error('createExam - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error creating exam', error: error.message });
    }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
    try {
        console.log('deleteExam - Start:', { teacherId: req.user?._id, examId: req.params.examId });

        if (!req.user || !req.user._id) {
            console.warn('deleteExam - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const examId = req.params.examId;
        if (!mongoose.isValidObjectId(examId)) {
            console.warn('deleteExam - Invalid exam ID:', examId);
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.warn('deleteExam - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!exam.teacher.equals(req.user._id)) {
            console.warn('deleteExam - Unauthorized:', { teacherId: req.user._id, examId });
            return res.status(403).json({ message: 'You are not authorized to delete this exam' });
        }

        await Result.deleteMany({ exam: examId });
        await exam.deleteOne();

        console.log('deleteExam - Success:', { examId, teacherId: req.user._id });
        res.json({ message: 'Exam and related results deleted successfully' });
    } catch (error) {
        console.error('deleteExam - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
};

// Get exam results
exports.getExamResults = async (req, res) => {
    try {
        console.log('getExamResults - Start:', { teacherId: req.user?._id, examId: req.params.examId });

        if (!req.user || !req.user._id) {
            console.warn('getExamResults - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const examId = req.params.examId;
        if (!mongoose.isValidObjectId(examId)) {
            console.warn('getExamResults - Invalid exam ID:', examId);
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.warn('getExamResults - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!exam.teacher.equals(req.user._id)) {
            console.warn('getExamResults - Unauthorized:', { teacherId: req.user._id, examId });
            return res.status(403).json({ message: 'You are not authorized to view results for this exam' });
        }

        const results = await Result.find({ exam: examId })
            .populate('student', 'name email')
            .lean();

        console.log(`getExamResults - Found ${results.length} results for exam ${examId}`);
        res.json(results);
    } catch (error) {
        console.error('getExamResults - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching exam results', error: error.message });
    }
};

// Get all student results for teacher's exams
exports.getAllResults = async (req, res) => {
    try {
        console.log('getAllResults - Start:', { teacherId: req.user?._id });

        if (!req.user || !req.user._id) {
            console.warn('getAllResults - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const exams = await Exam.find({ teacher: req.user._id }).select('_id');
        const examIds = exams.map(exam => exam._id);

        const results = await Result.find({ exam: { $in: examIds } })
            .populate('student', 'name email')
            .populate('exam', 'title')
            .populate('course', 'name')
            .lean();

        console.log(`getAllResults - Found ${results.length} results for teacher ${req.user._id}`);
        res.json(results);
    } catch (error) {
        console.error('getAllResults - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching all results', error: error.message });
    }
};

// Get enrolled students
exports.getEnrolledStudents = async (req, res) => {
    try {
        console.log('getEnrolledStudents - Start:', { teacherId: req.user?._id });

        if (!req.user || !req.user._id) {
            console.warn('getEnrolledStudents - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const courses = await Course.find({ teacher: req.user._id }).select('students');
        const studentIds = [...new Set(courses.flatMap(course => course.students))];

        const students = await User.find({
            _id: { $in: studentIds },
            role: 'student',
            isBlocked: false
        }).select('name email profilePicture');

        console.log(`getEnrolledStudents - Found ${students.length} students for teacher ${req.user._id}`);
        res.json(students);
    } catch (error) {
        console.error('getEnrolledStudents - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching enrolled students', error: error.message });
    }
};

// Get teacher statistics
exports.getStatistics = async (req, res) => {
    try {
        console.log('getStatistics - Start:', { teacherId: req.user?._id });

        if (!req.user || !req.user._id) {
            console.warn('getStatistics - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const totalCourses = await Course.countDocuments({ teacher: req.user._id, isActive: true });
        const totalExams = await Exam.countDocuments({ teacher: req.user._id, isActive: true });
        const totalStudents = await Course.aggregate([
            { $match: { teacher: new mongoose.Types.ObjectId(req.user._id) } },
            { $group: { _id: null, students: { $addToSet: '$students' } } },
            { $project: { count: { $reduce: {
                input: '$students',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
            } } } },
            { $project: { count: { $size: '$count' } } }
        ]);

        const results = await Result.find({ exam: { $in: await Exam.find({ teacher: req.user._id }).select('_id') } });
        const totalResults = results.length;
        const passedResults = results.filter(r => r.score >= r.passingMarks).length;

        const statistics = {
            totalCourses,
            totalExams,
            totalStudents: totalStudents[0]?.count || 0,
            totalResults,
            passedResults,
            passRate: totalResults > 0 ? ((passedResults / totalResults) * 100).toFixed(2) : 0
        };

        console.log('getStatistics - Success:', { teacherId: req.user._id, statistics });
        res.json(statistics);
    } catch (error) {
        console.error('getStatistics - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

// Enroll students in an exam
exports.enrollStudentsInExam = async (req, res) => {
    try {
        console.log('enrollStudentsInExam - Start:', { teacherId: req.user?._id, examId: req.params.examId });

        if (!req.user || !req.user._id) {
            console.warn('enrollStudentsInExam - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const examId = req.params.examId;
        const { studentIds } = req.body;

        if (!mongoose.isValidObjectId(examId)) {
            console.warn('enrollStudentsInExam - Invalid exam ID:', examId);
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            console.warn('enrollStudentsInExam - Invalid studentIds:', studentIds);
            return res.status(400).json({ message: 'studentIds must be a non-empty array' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.warn('enrollStudentsInExam - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!exam.teacher.equals(req.user._id)) {
            console.warn('enrollStudentsInExam - Unauthorized:', { teacherId: req.user._id, examId });
            return res.status(403).json({ message: 'You are not authorized to enroll students in this exam' });
        }

        const course = await Course.findById(exam.course);
        if (!course) {
            console.warn('enrollStudentsInExam - Course not found:', exam.course);
            return res.status(404).json({ message: 'Course not found' });
        }

        const validStudentIds = [];
        for (const studentId of studentIds) {
            if (!mongoose.isValidObjectId(studentId)) {
                console.warn('enrollStudentsInExam - Invalid student ID:', studentId);
                continue;
            }

            const student = await User.findById(studentId);
            if (!student || student.role !== 'student' || student.isBlocked) {
                console.warn('enrollStudentsInExam - Invalid or blocked student:', studentId);
                continue;
            }

            if (!course.students.includes(studentId)) {
                console.warn('enrollStudentsInExam - Student not enrolled in course:', { studentId, courseId: course._id });
                continue;
            }

            if (exam.enrolledStudents.includes(studentId)) {
                console.warn('enrollStudentsInExam - Student already enrolled in exam:', { studentId, examId });
                continue;
            }

            validStudentIds.push(studentId);
        }

        if (validStudentIds.length === 0) {
            console.warn('enrollStudentsInExam - No valid students to enroll:', { examId });
            return res.status(400).json({ message: 'No valid students to enroll' });
        }

        exam.enrolledStudents.push(...validStudentIds);
        await exam.save();

        console.log(`enrollStudentsInExam - Enrolled ${validStudentIds.length} students in exam ${examId}`);
        res.json({ message: `Enrolled ${validStudentIds.length} students successfully` });
    } catch (error) {
        console.error('enrollStudentsInExam - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error enrolling students in exam', error: error.message });
    }
};

// Unenroll students from an exam
exports.unenrollStudentsFromExam = async (req, res) => {
    try {
        console.log('unenrollStudentsFromExam - Start:', { teacherId: req.user?._id, examId: req.params.examId });

        if (!req.user || !req.user._id) {
            console.warn('unenrollStudentsFromExam - No user in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const examId = req.params.examId;
        const { studentIds } = req.body;

        if (!mongoose.isValidObjectId(examId)) {
            console.warn('unenrollStudentsFromExam - Invalid exam ID:', examId);
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            console.warn('unenrollStudentsFromExam - Invalid studentIds:', studentIds);
            return res.status(400).json({ message: 'studentIds must be a non-empty array' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.warn('unenrollStudentsFromExam - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!exam.teacher.equals(req.user._id)) {
            console.warn('unenrollStudentsFromExam - Unauthorized:', { teacherId: req.user._id, examId });
            return res.status(403).json({ message: 'You are not authorized to unenroll students from this exam' });
        }

        const validStudentIds = [];
        for (const studentId of studentIds) {
            if (!mongoose.isValidObjectId(studentId)) {
                console.warn('unenrollStudentsFromExam - Invalid student ID:', studentId);
                continue;
            }

            if (!exam.enrolledStudents.includes(studentId)) {
                console.warn('unenrollStudentsFromExam - Student not enrolled in exam:', { studentId, examId });
                continue;
            }

            validStudentIds.push(studentId);
        }

        if (validStudentIds.length === 0) {
            console.warn('unenrollStudentsFromExam - No valid students to unenroll:', { examId });
            return res.status(400).json({ message: 'No valid students to unenroll' });
        }

        exam.enrolledStudents = exam.enrolledStudents.filter(id => !validStudentIds.includes(id.toString()));
        await exam.save();

        await Result.deleteMany({ exam: examId, student: { $in: validStudentIds } });

        console.log(`unenrollStudentsFromExam - Unenrolled ${validStudentIds.length} students from exam ${examId}`);
        res.json({ message: `Unenrolled ${validStudentIds.length} students successfully` });
    } catch (error) {
        console.error('unenrollStudentsFromExam - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error unenrolling students from exam', error: error.message });
    }
};

module.exports = exports;