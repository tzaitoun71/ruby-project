"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Modal,
  Container,
  Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useUser } from "../context/UserContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageIcon from "@mui/icons-material/Image";
import ErrorIcon from "@mui/icons-material/Error";

interface MessageImageModalProps {
  open: boolean;
  onClose: () => void;
}

const MessageImageModal: React.FC<MessageImageModalProps> = ({
  open,
  onClose,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useUser();

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
    setError(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("file", imageFile);
      }

      const imageResponse = await fetch("/api/classify-image", {
        method: "POST",
        body: formData,
      });

      if (!imageResponse.ok) {
        throw new Error("Failed to classify the image");
      }

      const imageResult = await imageResponse.json();
      const imageDescription = imageResult.description;

      const messageFormData = new FormData();
      messageFormData.append(
        "text",
        `${inputText} Image Description: ${imageDescription}`
      );
      if (imageFile) {
        messageFormData.append("file", imageFile);
      }

      const messageResponse = await fetch("/api/message-image", {
        method: "POST",
        body: messageFormData,
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to query the API");
      }

      const messageResult = await messageResponse.json();

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

      setSubmitted(true);
    } catch (err) {
      setError("An error occurred while processing the request.");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setInputText("");
    setImageFile(null);
    setLoading(false);
    setSubmitted(false);
    setError(null);
  };

  const theme = createTheme({
    palette: {
      primary: { main: "#5D675B" },
      secondary: { main: "#A6AD91" },
      background: { default: "#F9F8F4" },
      text: {
        primary: "#333333",
        secondary: "#555555",
      },
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
        onClose={() => {
          resetState();
          onClose();
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            width: "400px",
            bgcolor: "#f8f8f8",
            outline: 'none',
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          {!submitted ? (
            <>
              <Typography variant="h4" gutterBottom align="center">
                Analyze Text and Image
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
              <Box display="flex" justifyContent="center" width="100%">
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    backgroundColor: "#A6AD91",
                    "&:hover": {
                      backgroundColor: "#8E9C7C",
                    },
                    borderRadius: 2,
                    fontWeight: "bold",
                    color: "#ffffff",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1, // Adjust the gap between the text and the icon
                    padding: "10px 12px",
                    width: "100%",
                  }}
                >
                  <ImageIcon />
                  {imageFile ? imageFile.name : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>

              {imageFile && (
                <Box display="flex" alignItems="center" mt={2}>
                  <Avatar
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    variant="rounded"
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {imageFile.name}
                  </Typography>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading || inputText.trim() === "" || !imageFile}
                fullWidth
                sx={{
                  mt: 3,
                  backgroundColor: "#5D675B",
                  "&:hover": {
                    backgroundColor: "#4A5749",
                  },
                  borderRadius: 2,
                  fontWeight: "bold",
                  color: "#ffffff",
                  boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Submit"}
              </Button>
              {error && (
                <Box
                  mt={4}
                  p={2}
                  bgcolor="background.default"
                  borderRadius={2}
                  display="flex"
                  alignItems="center"
                >
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

export default MessageImageModal;
