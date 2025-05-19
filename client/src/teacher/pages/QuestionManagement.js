import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../shared/context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  });
  const [error, setError] = useState('');

  const { examId } = useParams();
  const { getAuthHeader, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    verifyExamOwnership();
  }, [examId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${examId}`, {
        headers: getAuthHeader()
      });
      console.log('Fetched exam data:', response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please try again.');
    }
  };

  const verifyExamOwnership = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${examId}`, {
        headers: getAuthHeader()
      });
      console.log('Exam data:', response.data);
      console.log('Teacher ID from exam:', response.data.teacher._id);
      console.log('Current user ID:', user._id);

      if (response.data.teacher._id !== user._id) {
        console.error('Exam does not belong to the current teacher');
        alert('You are not authorized to manage questions for this exam');
        navigate('/teacher/exams');
      }
    } catch (error) {
      console.error('Error verifying exam ownership:', error);
      alert('Failed to verify exam ownership. Please try again.');
      navigate('/teacher/exams');
    }
  };

  const handleOpenDialog = (question = null) => {
    if (question) {
      setSelectedQuestion(question);
      setFormData({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        marks: question.marks
      });
    } else {
      setSelectedQuestion(null);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedQuestion(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'marks' ? parseInt(value) : value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = () => {
    if (!formData.question.trim()) {
      setError('Question text is required.');
      return false;
    }
    if (formData.options.some(opt => !opt.trim())) {
      setError('All options must be filled.');
      return false;
    }
    const uniqueOptions = new Set(formData.options.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size < formData.options.length) {
      setError('Options must be unique.');
      return false;
    }
    if (formData.marks < 1) {
      setError('Marks must be at least 1.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log('Submitting question for exam:', examId);
      console.log('Question data:', formData);

      if (selectedQuestion) {
        // Update question
        const response = await axios.put(
          `http://localhost:5000/api/questions/${selectedQuestion._id}`,
          { ...formData, exam: examId },
          { headers: getAuthHeader() }
        );
        console.log('Question updated successfully:', response.data);
      } else {
        // Add new question
        const response = await axios.post(
          `http://localhost:5000/api/exams/${examId}/questions`,
          formData,
          { headers: getAuthHeader() }
        );
        console.log('Question added successfully:', response.data);
      }
      fetchQuestions();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving question:', error);
      console.error('Error details:', error.response?.data);
      setError(`Failed to save question: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`http://localhost:5000/api/questions/${questionId}`, {
          headers: getAuthHeader()
        });
        console.log('Question deleted successfully:', questionId);
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        setError('Failed to delete question. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space:before" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Question Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Question
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <List>
          {questions.map((question, index) => (
            <ListItem key={question._id || index}>
              <ListItemText
                primary={question.question}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Options:
                    </Typography>
                    {' '}
                    {question.options.map((option, i) => (
                      <Typography key={i} component="span" variant="body2">
                        {String.fromCharCode(65 + i)}. {option}{' '}
                      </Typography>
                    ))}
                    <br />
                    <Typography component="span" variant="body2" color="text.primary">
                      Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                    </Typography>
                    {' | '}
                    <Typography component="span" variant="body2" color="text.primary">
                      Marks: {question.marks}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog(question)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(question._id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              {formData.options.map((option, index) => (
                <Grid item xs={12} key={index}>
                  <TextField
                    fullWidth
                    label={`Option ${String.fromCharCode(65 + index)}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                </Grid>
              ))}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    required
                  >
                    {formData.options.map((_, index) => (
                      <MenuItem key={index} value={index}>
                        Option {String.fromCharCode(65 + index)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Marks"
                  name="marks"
                  type="number"
                  value={formData.marks}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedQuestion ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionManagement;