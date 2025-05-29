import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, IconButton, Alert, Button } from '@mui/material';
import { Videocam, VideocamOff } from '@mui/icons-material';

const CameraMonitor = ({ role, examId, studentId, onCameraStatusChange }) => {
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);

  useEffect(() => {
    if (role === 'student') {
      initializeStudentCamera();
    } else if (role === 'teacher') {
      initializeTeacherMonitor();
    }

    return () => {
      stopCamera();
    };
  }, [role, examId, studentId]);

  useEffect(() => {
    // Notify parent component about camera status (for student role)
    if (role === 'student' && onCameraStatusChange) {
      onCameraStatusChange(isCameraOn);
    }
  }, [isCameraOn, role, onCameraStatusChange]);

  const initializeStudentCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setIsCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure you have granted camera permissions and turn on your camera to proceed with the exam.');
      setIsCameraOn(false);
      console.error('Camera access error:', err);
    }
  };

  const initializeTeacherMonitor = () => {
    // Initialize WebRTC connection for teacher monitoring
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Handle incoming video stream
    peerConnection.current.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // Create data channel for signaling
    dataChannel.current = peerConnection.current.createDataChannel('signaling');
    dataChannel.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'offer') {
        handleOffer(message);
      }
    };
  };

  const handleOffer = async (offer) => {
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      dataChannel.current.send(
        JSON.stringify({
          type: 'answer',
          answer: answer,
        })
      );
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to establish connection with student.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraOn(false);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      initializeStudentCamera();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {role === 'student' ? 'Your Camera Feed' : 'Student Camera Feed'}
        </Typography>
        {role === 'student' && (
          <IconButton onClick={toggleCamera} color={isCameraOn ? 'primary' : 'error'}>
            {isCameraOn ? <Videocam /> : <VideocamOff />}
          </IconButton>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {role === 'student' && !isCameraOn && !error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          The camera must be turned on to proceed with the exam. Please enable your camera.
        </Alert>
      )}

      <Box
        sx={{
          width: '100%',
          height: '300px',
          backgroundColor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={role === 'student'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>
    </Paper>
  );
};

export default CameraMonitor;