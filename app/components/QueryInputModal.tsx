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

  const resetState = () => {
    setInputText("");
    setLoading(false);
    setSuccess(false);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
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
      <Modal
        open={open}
        onClose={handleClose} // Use handleClose to reset the state when closing
        BackdropProps={{
          onClick: handleClose, // Close modal when clicking outside
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            width: '350px',
            bgcolor: "#f8f8f8",
            outline: 'none',
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
        >
          {!success ? (
            <>
              <Typography variant="h4" gutterBottom align="center">
                Submit Text
              </Typography>
              <TextField
                label="Enter your text"
                variant="outlined"
                fullWidth
                value={inputText}
                onChange={handleInputChange}
                multiline
                rows={4}
                margin="normal"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  mb: 3,
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading || inputText.trim() === ""}
                fullWidth
                sx={{
                  backgroundColor: "#A6AD91", // Lighter color consistent with other modals
                  "&:hover": { backgroundColor: "#8E9C7C" },
                  borderRadius: 2,
                  fontWeight: "bold",
                  color: "#ffffff",
                  textTransform: "none",
                  padding: "10px 12px",
                  boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
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
            <Box mt={4} p={2} bgcolor="background.paper" borderRadius={2}>
              <Typography variant="h6" gutterBottom color="error">
                Error:
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {error}
              </Typography>
            </Box>
          )}
        </Paper>
      </Modal>
    </ThemeProvider>
  );
};

export default QueryInputModal;
