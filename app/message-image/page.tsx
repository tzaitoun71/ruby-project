'use client';

import React, { useState } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const MessageImage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // First, classify the image content
      const formData = new FormData();
      if (imageFile) {
        formData.append('file', imageFile);
      }

      const imageResponse = await fetch('/api/classify-image', {
        method: 'POST',
        body: formData,
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to classify the image');
      }

      const imageResult = await imageResponse.json();
      const imageDescription = imageResult.description;

      // Now submit the text along with the image description for further analysis
      const messageFormData = new FormData();
      messageFormData.append('text', `${inputText} Image Description: ${imageDescription}`);
      if (imageFile) {
        messageFormData.append('file', imageFile);  // Include the file in case it's needed for further analysis
      }

      const messageResponse = await fetch('/api/message-image', {
        method: 'POST',
        body: messageFormData,
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to query the API');
      }

      const result = await messageResponse.json();
      console.log('API response data:', result);
      setResponse(JSON.stringify(result, null, 2));
    } catch (err) {
      setError('An error occurred while processing the request.');
    } finally {
      setLoading(false);
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
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
          <Typography variant="h4" gutterBottom>
            Analyze Text and Image
          </Typography>
          <TextField
            label="Enter your query"
            variant="outlined"
            fullWidth
            value={inputText}
            onChange={handleInputChange}
            multiline
            rows={4}
            margin="normal"
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 1,
            }}
          />
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
            {imageFile ? 'Change Image' : 'Upload Image'}
            <input type="file" hidden onChange={handleImageChange} />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || inputText.trim() === '' || !imageFile}
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
            {loading ? <CircularProgress size={24} /> : 'Submit'}
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

export default MessageImage;