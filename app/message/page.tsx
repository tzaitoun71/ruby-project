'use client';

import React, { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useUser } from '../context/UserContext'; // Import the useUser hook

const QueryInput: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useUser(); // Get the userId from the UserContext

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
    console.log("Input changed:", event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    console.log("Submitting query:", inputText);

    try {
      // Step 1: Call the /api/message endpoint
      const messageRes = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      console.log("API /message response status:", messageRes.status);

      if (!messageRes.ok) {
        throw new Error("Failed to query the /api/message endpoint");
      }

      const messageResult = await messageRes.json();
      console.log("API /message response data:", messageResult);

      // Step 2: Use the output from /api/message and include the userId for /api/query
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

      console.log("API /query response status:", queryRes.status);

      if (!queryRes.ok) {
        throw new Error("Failed to submit the query to the database");
      }

      // Clear the input field after successful submission
      setInputText("");
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
        default: "#0e312d",
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
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100vh"
          bgcolor="background.default"
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              width: '350px',
              height: '400px',
              bgcolor: "#f8f8f8"
            }}
          >
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
      </Container>
    </ThemeProvider>
  );
};

export default QueryInput;
