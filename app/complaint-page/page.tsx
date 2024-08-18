'use client';

import React, { useState } from 'react';
import { Button, Box, Grid, Tooltip, Typography, Paper, Container, keyframes } from '@mui/material';
import { QueryStats, Image, Mic, Videocam } from '@mui/icons-material';
import QueryInputModal from '../components/QueryInputModal';
import MessageImageModal from '../components/MessageImageModal';
import VoiceUploadModal from '../components/VoiceUploadModal';
import UploadVideoModal from '../components/UploadVideoModal'; 

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Home = () => {
  const [isQueryModalOpen, setQueryModalOpen] = useState(false);
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);

  const handleOpenQueryModal = () => setQueryModalOpen(true);
  const handleCloseQueryModal = () => setQueryModalOpen(false);

  const handleOpenMessageModal = () => setMessageModalOpen(true);
  const handleCloseMessageModal = () => setMessageModalOpen(false);

  const handleOpenVoiceModal = () => setVoiceModalOpen(true);
  const handleCloseVoiceModal = () => setVoiceModalOpen(false);

  const handleOpenVideoModal = () => setVideoModalOpen(true);
  const handleCloseVideoModal = () => setVideoModalOpen(false);

  const boxStyle = {
    padding: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    backgroundColor: 'rgb(239, 237, 226)',
    borderRadius: 2,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(239, 237, 226, 0.9)', 
    },
    aspectRatio: '1/1', 
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        textAlign: 'center',
        mt: 8,
        backgroundColor: '#1A1A1A',
        padding: { xs: '20px', md: '50px' },
        borderRadius: 2,
        animation: `${fadeIn} 1s ease-in-out`, 
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
        Submit Your Complaints and Issues
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: 'white', mb: 4 }}>
        Here you can submit complaints or issues related to various aspects. Please select the appropriate option below and proceed.
      </Typography>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Query Box */}
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Process Queries" arrow>
              <Paper
                sx={boxStyle}
                onClick={handleOpenQueryModal}
              >
                <QueryStats sx={{ fontSize: 60 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Text
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>

          {/* Message Image Box */}
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Process Images" arrow>
              <Paper
                sx={boxStyle}
                onClick={handleOpenMessageModal}
              >
                <Image sx={{ fontSize: 60 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Image Processing
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>

          {/* Voice Upload Box */}
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Upload Voice Recording" arrow>
              <Paper
                sx={boxStyle}
                onClick={handleOpenVoiceModal}
              >
                <Mic sx={{ fontSize: 60 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Voice Upload
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>

          {/* Video Processing Box */}
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Process Video" arrow>
              <Paper
                sx={boxStyle}
                onClick={handleOpenVideoModal}
              >
                <Videocam sx={{ fontSize: 60 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Video Processing
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {/* Modals */}
      <QueryInputModal open={isQueryModalOpen} onClose={handleCloseQueryModal} />
      <MessageImageModal open={isMessageModalOpen} onClose={handleCloseMessageModal} />
      <VoiceUploadModal open={isVoiceModalOpen} onClose={handleCloseVoiceModal} />

      {/* UploadVideoModal */}
      <UploadVideoModal open={isVideoModalOpen} onClose={handleCloseVideoModal} />
    </Container>
  );
};

export default Home;
