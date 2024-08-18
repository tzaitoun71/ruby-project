'use client';

import React, { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Modal,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useUser } from '../context/UserContext'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface QueryInputModalProps {
  open: boolean;
  onClose: () => void;
}

const QueryInputModal: React.FC<QueryInputModalProps> = ({ open, onClose }) => {
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useUser(); // Get the userId from the UserContext

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const messageRes = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!messageRes.ok) {
        throw new Error("Failed to query the /api/message endpoint");
      }

      const messageResult = await messageRes.json();

      const queryRes = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          complaint: messageResult.complaint,
          summary: messageResult.summary,
          product: messageResult.product,
          subProduct: messageResult.subProduct,
        }),
      });

      if (!queryRes.ok) {
        throw new Error("Failed to submit the query to the database");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error occurred:", err);
      setError("An error occurred while querying the API.");
    } finally {
      setLoading(false);
    }
  };

  const theme = createTheme({
    palette: {
      primary: { main: "#5D675B" },
      secondary: { main: "#A6AD91" },
      background: { default: "#0e312d" },
      text: { primary: "#333333", secondary: "#555555" },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
      h4: { fontWeight: 700 },
      body1: { color: "#555555" },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Modal open={open} onClose={onClose}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100vh"
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              width: '350px',
              bgcolor: "#f8f8f8",
            }}
          >
            {!success ? (
              <>
                <Typography variant="h4" gutterBottom align="center">
                  Query API
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
                    backgroundColor: "#ffffff",
                    borderRadius: 1,
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading || inputText.trim() === ""}
                  fullWidth
                  sx={{
                    mt: 2,
                    backgroundColor: "#A6AD91",
                    "&:hover": { backgroundColor: "#8E9C7C" },
                    borderRadius: 1,
                    fontWeight: "bold",
                    color: "#ffffff",
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Submit"}
                </Button>
              </>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center">
                <CheckCircleIcon color="primary" sx={{ fontSize: 60 }} />
                <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                  Your inquiry has been sent to the team.
                </Typography>
              </Box>
            )}
            {error && (
              <Box mt={4} p={2} bgcolor="background.paper" borderRadius={1}>
                <Typography variant="h6" gutterBottom color="error">
                  Error:
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {error}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default QueryInputModal;
