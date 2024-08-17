'use client';

import React, { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Define the component
const QueryInput: React.FC = () => {
  // State variables for input text, loading state, response, and error
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle input change event
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
    console.log("Input changed:", event.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);  // Set loading to true while the API request is in progress
    setResponse(null); // Clear previous response
    setError(null);    // Clear previous error

    console.log("Submitting query:", inputText);

    try {
      // Make API request
      const res = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      console.log("API response status:", res.status);

      // Check if the response is OK
      if (!res.ok) {
        throw new Error("Failed to query the API");
      }

      // Parse the JSON response
      const result = await res.json();
      console.log("API response data:", result);

      // Stringify the JSON object for display
      const formattedResponse = JSON.stringify(result, null, 2)
        .replace(/\n/g, '<br/>')
        .replace(/  /g, '&nbsp;&nbsp;');
      
      setResponse(formattedResponse);  // Set the formatted response to the state
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
        default: "#F9F8F4", // Light background color
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
        <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
          <Typography variant="h4" gutterBottom>
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
          {response && (
            <Box mt={4} p={2} bgcolor="background.default" borderRadius={1}>
              <Typography
                variant="h6"
                gutterBottom
                dangerouslySetInnerHTML={{ __html: response }} // Render the response as HTML
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

export default QueryInput;
