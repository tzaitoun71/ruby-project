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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Define the component
const QueryInput: React.FC = () => {
  // State variables for input text, loading state, response, and error
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useUser(); // Get the userId from the UserContext

  // Handle input change event
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
    console.log("Input changed:", event.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);  // Set loading to true while the API request is in progress
    setSuccess(false); // Clear previous success state
    setError(null);    // Clear previous error

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
          userId: userId,                    // Add the userId
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

      setSuccess(true);  // Set success state to true
    } catch (err) {
      console.error("Error occurred:", err);  // Log the error to the console
      setError("An error occurred while querying the API.");  // Set error message if the request fails
    } finally {
      setLoading(false);  // Set loading to false once the request is complete
      console.log("Loading complete");
    }
  };

  // Create a custom MUI theme to match the provided design
  const theme = createTheme({
    palette: {
      primary: {
        main: "#5D675B", // A muted green color
      },
      secondary: {
        main: "#A6AD91", // A lighter greenish color
      },
      background: {
        default: "#0e312d", // Dark green background color from the image
      },
      text: {
        primary: "#333333", // Dark text color
        secondary: "#555555", // Lighter text color
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
    // Wrap the component with the custom theme
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100vh" // Full viewport height to center the box
          bgcolor="background.default"
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              width: '350px',  // Adjust width to make it a square or compact rectangle
              height: '400px', // Adjust height as needed
              bgcolor: "#f8f8f8" // Use the light background color for the box
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
      </Container>
    </ThemeProvider>
  );
};

export default QueryInput;
