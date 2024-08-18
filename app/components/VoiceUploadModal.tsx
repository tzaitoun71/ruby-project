"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
  Modal,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useUser } from '../context/UserContext';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface VoiceUploadModalProps {
  open: boolean;
  onClose: () => void;
}

const VoiceUploadModal: React.FC<VoiceUploadModalProps> = ({ open, onClose }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false); // For handling submission state
  const recognitionRef = useRef<any>(null);

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

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      let result;

      // If an audio file is uploaded, process it
      if (audioFile) {
        const formData = new FormData();
        formData.append("file", audioFile);

        const res = await fetch("/api/transcribeAudio", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to process the audio file.");
        }

        result = await res.json();
      } 
      // If transcript is available from recording, process it
      else if (transcript) {
        const res = await fetch("/api/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: transcript,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to process the text.");
        }

        result = await res.json();
      } 
      // If neither is available, show an error
      else {
        throw new Error("No audio file or transcript available.");
      }

      // Send the result along with userId to the database
      const queryRes = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          complaint: result.complaint,
          summary: result.summary,
          product: result.product,
          subProduct: result.subProduct,
        }),
      });

      if (!queryRes.ok) {
        throw new Error('Failed to submit the query to the database');
      }

      setResponse("Your inquiry has been sent to the team.");
      setSubmitted(true); // Set submission state to true
    } catch (err) {
      console.error("Error occurred:", err);
      setError("An error occurred while processing the request.");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setAudioFile(null);
    setTranscript("");
    setRecording(false);
    setLoading(false);
    setResponse(null);
    setError(null);
    setSubmitted(false);
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
          sx={{ p: 4, borderRadius: 2, width: '350px', bgcolor: "#f8f8f8" }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          {!submitted ? (
            <>
              <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
                Record or Upload Voice File
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
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1, // Spacing between icon and text
                  padding: '10px 12px',
                }}
              >
                <AudiotrackIcon />
                {audioFile ? audioFile.name : 'Upload Audio'}
                <input type="file" hidden accept="audio/*" onChange={handleFileChange} />
              </Button>

              <Button
                variant="contained"
                color="secondary"
                onClick={recording ? stopRecording : startRecording}
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: recording ? "#E57373" : "#A6AD91",
                  '&:hover': {
                    backgroundColor: recording ? "#d32f2f" : "#8E9C7C",
                  },
                  borderRadius: 2,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                {recording ? <StopIcon /> : <MicIcon />}
                {recording ? "Stop Recording" : "Start Recording"}
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading || (!audioFile && !transcript)}
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

              {error && (
                <Box mt={4} p={2} bgcolor="background.default" borderRadius={1} display="flex" alignItems="center">
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

export default VoiceUploadModal;
