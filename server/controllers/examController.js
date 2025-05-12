const Exam = require('../models/Exam');
const Course = require('../models/Course');
const User = require('../models/User');
const Question = require('../models/Question');
const mongoose = require('mongoose');

// Create a new exam
exports.createExam = async (req, res) => {
  try {
    const { title, description, duration, totalMarks, passingMarks, startTime, endTime, courseId } = req.body;
    
    console.log('Creating exam with data:', { title, description, duration, totalMarks, passingMarks, startTime, endTime, courseId });
    console.log('User ID:', req.user._id);
    
    // Verify course belongs to teacher
    const course = await Course.findOne({
      _id: courseId,
      teacher: req.user._id
    });
    
    if (!course) {
      console.error('Course not found or not authorized:', { courseId, teacherId: req.user._id });
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }
    
    const exam = new Exam({
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      startTime,
      endTime,
      teacher: req.user._id,
      course: courseId
    });

    await exam.save();
    console.log('Exam created successfully:', exam);
    res.status(201).json(exam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Error creating exam', error: error.message });
  }
};

// Add questions to an exam
exports.addQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questions } = req.body;

    console.log('Adding questions to exam:', examId);
    console.log('User ID:', req.user._id);
    console.log('Questions data:', questions);

    const exam = await Exam.findById(examId);
    if (!exam) {
      console.error('Exam not found:', examId);
      return res.status(404).json({ message: 'Exam not found' });
    }

    console.log('Exam teacher ID:', exam.teacher.toString());
    console.log('User ID:', req.user._id.toString());

    if (exam.teacher.toString() !== req.user._id.toString()) {
      console.error('Not authorized: Exam teacher does not match user');
      return res.status(403).json({ message: 'Not authorized to add questions to this exam' });
    }

    const savedQuestions = await Question.insertMany(
      questions.map(q => ({
        ...q,
        exam: examId
      }))
    );

    exam.questions.push(...savedQuestions.map(q => q._id));
    await exam.save();

    console.log('Questions added successfully:', savedQuestions.length);
    res.json(savedQuestions);
  } catch (error) {
    console.error('Error adding questions:', error);
    res.status(500).json({ message: 'Error adding questions', error: error.message });
  }
};
// Update a specific question
exports.updateQuestion = async (req, res) => {
    try {
        console.log('updateQuestion - Start:', { 
            examId: req.params.examId, 
            questionId: req.params.questionId,
            teacherId: req.user?._id, 
            body: req.body 
        });

        const { examId, questionId } = req.params;
        if (!mongoose.isValidObjectId(examId) || !mongoose.isValidObjectId(questionId)) {
            console.warn('updateQuestion - Invalid IDs:', { examId, questionId });
            return res.status(400).json({ message: 'Invalid exam or question ID' });
        }

        const { text, options, correctAnswer, marks } = req.body;
        const questionText = text || req.body.question;
        if (!questionText || typeof questionText !== 'string' || questionText.trim() === '') {
            console.warn('updateQuestion - Invalid question text:', questionText);
            return res.status(400).json({ message: 'Question text must be provided' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.warn('updateQuestion - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check teacher authorization
        if (exam.teacher.toString() !== req.user._id.toString()) {
            console.warn('updateQuestion - Unauthorized teacher:', { 
                teacherId: req.user._id, 
                examTeacher: exam.teacher.toString() 
            });
            return res.status(403).json({ message: 'You are not authorized to update questions in this exam' });
        }

        // Check if question exists in exam
        if (!exam.questions.includes(mongoose.Types.ObjectId(questionId))) {
            console.warn('updateQuestion - Question not in exam:', { questionId, examQuestions: exam.questions });
            return res.status(404).json({ message: 'Question not found in this exam' });
        }

        // Update the question
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            {
                text: questionText.trim(),
                options: options.map(opt => opt.trim()),
                correctAnswer,
                marks
            },
            { new: true }
        );

        if (!updatedQuestion) {
            console.warn('updateQuestion - Question not found:', questionId);
            return res.status(404).json({ message: 'Question not found' });
        }

        console.log('updateQuestion - Success:', { questionId, updatedQuestion });
        res.json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (error) {
        console.error('updateQuestion - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error updating question', error: error.message });
    }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
    try {
        console.log('deleteQuestion - Start:', { 
            examId: req.params.examId, 
            questionId: req.params.questionId,
            teacherId: req.user?._id
        });

        const { examId, questionId } = req.params;
        if (!mongoose.isValidObjectId(examId) || !mongoose.isValidObjectId(questionId)) {
            console.warn('deleteQuestion - Invalid IDs:', { examId, questionId });
            return res.status(400).json({ message: 'Invalid exam or question ID' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.warn('deleteQuestion - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check teacher authorization
        if (exam.teacher.toString() !== req.user._id.toString()) {
            console.warn('deleteQuestion - Unauthorized teacher:', { 
                teacherId: req.user._id, 
                examTeacher: exam.teacher.toString() 
            });
            return res.status(403).json({ message: 'You are not authorized to delete questions from this exam' });
        }

        // Remove question from exam's questions array
        exam.questions = exam.questions.filter(q => q.toString() !== questionId);
        await exam.save();

        // Delete the question document
        await Question.findByIdAndDelete(questionId);

        console.log('deleteQuestion - Success:', { questionId });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('deleteQuestion - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
};

// Enroll students in an exam
exports.enrollStudents = async (req, res) => {
    try {
        console.log('enrollStudents - Start:', { examId: req.params.examId, teacherId: req.user?._id, body: req.body });

        const examId = req.params.examId;
        if (!mongoose.isValidObjectId(examId)) {
            console.warn('enrollStudents - Invalid exam ID:', examId);
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        const { studentIds } = req.body;
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            console.warn('enrollStudents - Invalid studentIds:', studentIds);
            return res.status(400).json({ message: 'Student IDs must be a non-empty array' });
        }

        const invalidIds = studentIds.filter(id => !mongoose.isValidObjectId(id));
        if (invalidIds.length > 0) {
            console.warn('enrollStudents - Invalid student IDs:', invalidIds);
            return res.status(400).json({ message: `Invalid student IDs: ${invalidIds.join(', ')}` });
        }

        const exam = await Exam.findById(examId).populate('course');
        if (!exam) {
            console.warn('enrollStudents - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        const teacherId = exam.teacher.toString();
        if (teacherId !== req.user._id.toString()) {
            console.warn('enrollStudents - Unauthorized teacher:', { teacherId: req.user._id, examTeacher: teacherId });
            return res.status(403).json({ message: 'You are not authorized to enroll students in this exam' });
        }

        const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
        if (students.length !== studentIds.length) {
            const foundIds = students.map(s => s._id.toString());
            const missingIds = studentIds.filter(id => !foundIds.includes(id));
            console.warn('enrollStudents - Some students not found or not students:', missingIds);
            return res.status(404).json({ message: `Some student IDs not found or not students: ${missingIds.join(', ')}` });
        }

        const courseStudents = exam.course.students.map(id => id.toString());
        const nonCourseStudents = studentIds.filter(id => !courseStudents.includes(id));
        if (nonCourseStudents.length > 0) {
            console.warn('enrollStudents - Students not enrolled in course:', nonCourseStudents);
            return res.status(400).json({ message: `Students not enrolled in course: ${nonCourseStudents.join(', ')}` });
        }

        const newStudents = studentIds.filter(id => !exam.enrolledStudents.map(sid => sid.toString()).includes(id));
        if (newStudents.length === 0) {
            console.log('enrollStudents - All students already enrolled:', studentIds);
            return res.status(400).json({ message: 'All provided students are already enrolled in the exam' });
        }

        exam.enrolledStudents.push(...newStudents.map(id => mongoose.Types.ObjectId(id)));
        await exam.save();

        console.log('enrollStudents - Success:', { examId, enrolledStudentIds: newStudents });
        res.json({ message: 'Students enrolled successfully', exam });
    } catch (error) {
        console.error('enrollStudents - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error enrolling students', error: error.message });
    }
};

// Get all exams for a teacher
exports.getTeacherExams = async (req, res) => {
    try {
        console.log('getTeacherExams - Start:', { teacherId: req.user?._id });

        const exams = await Exam.find({ teacher: req.user._id })
            .populate('course', 'name')
            .lean();

        console.log('getTeacherExams - Success:', { teacherId: req.user._id, examCount: exams.length });
        res.json(exams);
    } catch (error) {
        console.error('getTeacherExams - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching teacher exams', error: error.message });
    }
};

// Get exam details with questions
exports.getExamDetails = async (req, res) => {
    try {
        console.log('getExamDetails - Start:', { examId: req.params.examId, userId: req.user?._id });

        const examId = req.params.examId;
        if (!mongoose.isValidObjectId(examId)) {
            console.warn('getExamDetails - Invalid exam ID:', examId);
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        const exam = await Exam.findById(examId)
            .populate('course', 'name')
            .populate('teacher', 'name')
            .populate('questions')
            .lean();

        if (!exam) {
            console.warn('getExamDetails - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Convert teacher ID to string for comparison
        const teacherId = exam.teacher._id ? exam.teacher._id.toString() : exam.teacher.toString();
        const userId = req.user._id.toString();
        const enrolledStudents = exam.enrolledStudents.map(id => id.toString());

        if (teacherId !== userId && !enrolledStudents.includes(userId)) {
            console.warn('getExamDetails - Unauthorized access:', { userId, examId });
            return res.status(403).json({ message: 'You are not authorized to view this exam' });
        }

        console.log('getExamDetails - Success:', { examId, userId });
        res.json(exam);
    } catch (error) {
        console.error('getExamDetails - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error fetching exam details', error: error.message });
    }
};

// Update exam details
exports.updateExam = async (req, res) => {
    try {
        console.log('updateExam - Start:', { examId: req.params.examId, teacherId: req.user?._id, body: req.body });

        const examId = req.params.examId;
        if (!mongoose.isValidObjectId(examId)) {
            console.warn('updateExam - Invalid exam ID:', examId);
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        const { title, description, duration, passingMarks, startTime, endTime } = req.body;
        if (!title && !description && !duration && !passingMarks && !startTime && !endTime) {
            console.warn('updateExam - No fields provided:', { body: req.body });
            return res.status(400).json({ message: 'At least one field must be provided' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            console.warn('updateExam - Exam not found:', examId);
            return res.status(404).json({ message: 'Exam not found' });
        }

        const teacherId = exam.teacher.toString();
        if (teacherId !== req.user._id.toString()) {
            console.warn('updateExam - Unauthorized teacher:', { teacherId: req.user._id, examTeacher: teacherId });
            return res.status(403).json({ message: 'You are not authorized to update this exam' });
        }

        if (title) exam.title = title;
        if (description) exam.description = description;
        if (duration) exam.duration = duration;
        if (passingMarks) exam.passingMarks = passingMarks;
        if (startTime) exam.startTime = startTime;
        if (endTime) exam.endTime = endTime;

        await exam.save();
        console.log('updateExam - Success:', { examId, updatedFields: req.body });
        res.json({ message: 'Exam updated successfully', exam });
    } catch (error) {
        console.error('updateExam - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error updating exam', error: error.message });
    }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
    try {
        console.log('deleteExam - Start:', { examId: req.params.examId, teacherId: req.user?._id });

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

        const teacherId = exam.teacher.toString();
        if (teacherId !== req.user._id.toString()) {
            console.warn('deleteExam - Unauthorized teacher:', { teacherId: req.user._id, examTeacher: teacherId });
            return res.status(403).json({ message: 'You are not authorized to delete this exam' });
        }

        await Exam.deleteOne({ _id: examId });
        console.log('deleteExam - Success:', { examId });
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('deleteExam - Error:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
};

module.exports = exports;