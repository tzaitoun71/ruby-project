'use client';

import React, { useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
} from "@mui/material";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useUser } from '../context/UserContext'; 

const ffmpeg = new FFmpeg();

const VoiceUpload: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { userId } = useUser(); 

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log("File selected:", file.name);

      if (file.type === 'audio/wav') {
        const mp3File = await convertToMp3(file);
        setAudioFile(mp3File);
      } else {
        setAudioFile(file);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = async (event) => {
        const recordedBlob = new Blob([event.data], { type: "audio/wav" });
        const mp3File = await convertToMp3(new File([recordedBlob], "recording.wav", { type: "audio/wav" }));
        setAudioFile(mp3File);

        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(mp3File);
          audioRef.current.play();
        }
      };

      recorder.onstop = () => {
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecording(false);
    }
  };

  const convertToMp3 = async (wavFile: File): Promise<File> => {
    if (!ffmpeg.loaded) {
        await ffmpeg.load();
    }

    await ffmpeg.writeFile('input.wav', await fetchFile(wavFile));
    await ffmpeg.exec(['-i', 'input.wav', 'output.mp3']);
    const data = await ffmpeg.readFile('output.mp3');

    const mp3Blob = new Blob([data], { type: 'audio/mp3' });
    return new File([mp3Blob], "recording.mp3", { type: "audio/mp3" });
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

      // Now, send the transcription result to the database with userId
      const queryRes = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // Add the userId from the context
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

      const formattedResponse = JSON.stringify(queryResult, null, 2)
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
            Record or Upload Voice File
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            onClick={recording ? stopRecording : startRecording}
            fullWidth
            sx={{ mt: 2, backgroundColor: recording ? "#E57373" : "#A6AD91" }}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </Button>

          <audio ref={audioRef} controls style={{ marginTop: "20px", display: audioFile ? "block" : "none" }} />

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
