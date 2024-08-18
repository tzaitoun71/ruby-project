'use client';

import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useUser } from '../context/UserContext';

const UploadVideo: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useUser(); // Get the userId from the UserContext

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setResponse(null);
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

      const result = await res.json();
      setResponse(JSON.stringify(result, null, 2)); // Display the JSON result

      // Send the result along with userId to the database
      const queryRes = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId, // Add the userId from the context
          videoAnalysisResult: result, // Send the result from the video analysis
        }),
      });

      if (!queryRes.ok) {
        throw new Error('Failed to submit the query to the database');
      }

      const queryResult = await queryRes.json();
      console.log('API /query response data:', queryResult);

    } catch (err) {
      setError('An error occurred while uploading the video.');
    } finally {
      setUploading(false);
    }
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
      <Container maxWidth="sm" sx={{ height: '100vh', overflowY: 'auto', paddingTop: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
          <Typography variant="h4" gutterBottom>
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
              borderRadius: 1,
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            {videoFile ? 'Change Video' : 'Upload Video'}
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
              backgroundColor: '#A6AD91',
              '&:hover': {
                backgroundColor: '#8E9C7C',
              },
              borderRadius: 1,
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
          {response && (
            <Box mt={4} p={2} bgcolor="background.default" borderRadius={1} width="100%">
              <Typography variant="h6" gutterBottom>
                Response:
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: theme.palette.text.primary }}>
                {response}
              </pre>
            </Box>
          )}
          {error && (
            <Box mt={4} p={2} bgcolor="background.default" borderRadius={1} width="100%">
              <Typography variant="h6" gutterBottom color="error">
                Error:
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {error}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default UploadVideo;
