'use client';

import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Modal,
  Container,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useUser } from '../context/UserContext';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface UploadVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ open, onClose }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false); // For handling submission state
  const [error, setError] = useState<string | null>(null);

  const { userId } = useUser();

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (videoFile) {
        formData.append('file', videoFile);
      }

      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload and analyze the video');
      }

      let result = await res.json();

      if (result.is_complaint !== undefined) {
        result.complaint = result.is_complaint;
        delete result.is_complaint;
      }

      const queryRes = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          complaint: result.complaint,
          summary: result.summary,
          product: result.product,
          subProduct: result.sub_product,
        }),
      });

      if (!queryRes.ok) {
        throw new Error('Failed to submit the query to the database');
      }

      setSubmitted(true); // Set submission state to true
    } catch (err) {
      setError('An error occurred while uploading the video.');
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setVideoFile(null);
    setUploading(false);
    setError(null);
    setSubmitted(false);
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: '#5D675B',
      },
      secondary: {
        main: '#A6AD91',
      },
      background: {
        default: '#F9F8F4',
      },
      text: {
        primary: '#333333',
        secondary: '#555555',
      },
    },
    typography: {
      fontFamily: 'Arial, sans-serif',
      h4: {
        fontWeight: 700,
      },
      body1: {
        color: '#555555',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Modal
        open={open}
        onClose={() => {
          resetState();
          onClose();
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            width: '400px',
            bgcolor: "#f8f8f8",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          {!submitted ? (
            <>
              <Typography variant="h4" gutterBottom align="center">
                Upload a Video for Analysis
              </Typography>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: '#A6AD91',
                  '&:hover': {
                    backgroundColor: '#8E9C7C',
                  },
                  borderRadius: 2,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  padding: "10px 12px",
                  textTransform: 'none',
                }}
              >
                <VideoFileIcon sx={{ marginRight: '8px' }} />
                {videoFile ? videoFile.name : 'Upload Video'}
                <input type="file" hidden accept="video/mp4,video/x-m4v,video/*" onChange={handleVideoChange} />
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading || !videoFile}
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: '#5D675B',
                  '&:hover': {
                    backgroundColor: '#4A5749',
                  },
                  borderRadius: 2,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
                  textTransform: 'none',
                }}
              >
                {uploading ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
              {error && (
                <Box mt={4} p={2} bgcolor="background.default" borderRadius={2} width="100%" display="flex" alignItems="center">
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="body1" color="textSecondary">
                    {error}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center">
              <CheckCircleIcon color="primary" sx={{ fontSize: 60 }} />
              <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                Your inquiry has been sent to the team.
              </Typography>
            </Box>
          )}
        </Paper>
      </Modal>
    </ThemeProvider>
  );
};

export default UploadVideoModal;
