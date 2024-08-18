"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useUser } from '../context/UserContext';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const VoiceUpload: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { userId } = useUser();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log("File selected:", file.name);
      setAudioFile(file);
    }
  };

  const startRecording = () => {
    setRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      const { transcript } = event.results[event.results.length - 1][0];
      setTranscript(transcript);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  const handleFileSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

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
        throw new Error("Failed to process the audio file.");
      }

      const result = await res.json();
      console.log("API response data:", result);

      // Send the result along with userId to the database
      const queryRes = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId, // Add the userId from the context
          complaint: result.complaint,
          summary: result.summary,
          product: result.product,
          subProduct: result.subProduct,
        }),
      });

      if (!queryRes.ok) {
        throw new Error('Failed to submit the query to the database');
      }

      const queryResult = await queryRes.json();
      console.log('API /query response data:', queryResult);

      setResponse(JSON.stringify(queryResult, null, 2));
    } catch (err) {
      console.error("Error occurred:", err);
      setError("An error occurred while processing the audio file.");
    } finally {
      setLoading(false);
      console.log("Loading complete");
    }
  };

  const handleTextSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      if (!transcript) {
        throw new Error("No transcript available.");
      }

      const res = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcript,
        }),
      });

      console.log("API response status:", res.status);

      if (!res.ok) {
        throw new Error("Failed to process the text.");
      }

      const result = await res.json();
      console.log("API response data:", result);

      // Send the result along with userId to the database
      const queryRes = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId, // Add the userId from the context
          complaint: result.complaint,
          summary: result.summary,
          product: result.product,
          subProduct: result.subProduct,
        }),
      });

      if (!queryRes.ok) {
        throw new Error('Failed to submit the query to the database');
      }

      const queryResult = await queryRes.json();
      console.log('API /query response data:', queryResult);

      setResponse(JSON.stringify(queryResult, null, 2));
    } catch (err) {
      console.error("Error occurred:", err);
      setError("An error occurred while processing the text.");
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
            Record or Upload Voice File
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
            onClick={handleFileSubmit}
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
            {loading ? <CircularProgress size={24} /> : "Submit Audio"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={recording ? stopRecording : startRecording}
            fullWidth
            sx={{ mt: 2, backgroundColor: recording ? "#E57373" : "#A6AD91" }}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </Button>

          {transcript && (
            <Box mt={4} p={2} bgcolor="background.default" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                Transcript:
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {transcript}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleTextSubmit}
            disabled={loading || !transcript}
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
            {loading ? <CircularProgress size={24} /> : "Submit Text"}
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
