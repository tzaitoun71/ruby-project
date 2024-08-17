'use client';

import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const VoiceUpload: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAudioFile(event.target.files[0]);
      console.log("File selected:", event.target.files[0].name);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);  
    setResponse(null); 
    setError(null);   

    console.log("Submitting audio file:", audioFile?.name);

    try {
      if (!audioFile) {
        throw new Error("No file selected.");
      }

      const formData = new FormData();
      formData.append("file", audioFile);

      const res = await fetch("/api/transcribeAudio", {
        method: "POST",
        body: formData,
      });

      console.log("API response status:", res.status);

      if (!res.ok) {
        throw new Error("Failed to query the API");
      }

      const result = await res.json();
      console.log("API response data:", result);

      const formattedResponse = JSON.stringify(result, null, 2)
        .replace(/\n/g, '<br/>')
        .replace(/  /g, '&nbsp;&nbsp;');
      
      setResponse(formattedResponse);  
    } catch (err) {
      console.error("Error occurred:", err);  
      setError("An error occurred while querying the API.");  
    } finally {
      setLoading(false);  
      console.log("Loading complete");
    }
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#5D675B",
      },
      secondary: {
        main: "#A6AD91",
      },
      background: {
        default: "#F9F8F4",
      },
      text: {
        primary: "#333333", 
        secondary: "#555555", 
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
      h4: {
        fontWeight: 700,
      },
      body1: {
        color: "#555555",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
          <Typography variant="h4" gutterBottom>
            Upload Voice File
          </Typography>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ margin: "20px 0" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !audioFile}
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: "#A6AD91",
              "&:hover": {
                backgroundColor: "#8E9C7C",
              },
              borderRadius: 1,
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
          {response && (
            <Box mt={4} p={2} bgcolor="background.default" borderRadius={1}>
              <Typography
                variant="h6"
                gutterBottom
                dangerouslySetInnerHTML={{ __html: response }} 
              />
            </Box>
          )}
          {error && (
            <Box mt={4} p={2} bgcolor="background.default" borderRadius={1}>
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

export default VoiceUpload;
