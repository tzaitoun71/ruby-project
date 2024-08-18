'use client';

import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import QueryInputModal from '../components/QueryInputModal';
import MessageImageModal from '../components/MessageImageModal';
import VoiceUploadModal from '../components/VoiceUploadModal';

const Home = () => {
  // State management for the QueryInput modal
  const [isQueryModalOpen, setQueryModalOpen] = useState(false);
  const handleOpenQueryModal = () => {
    setQueryModalOpen(true);
  };
  const handleCloseQueryModal = () => {
    setQueryModalOpen(false);
  };

  // State management for the MessageImage modal
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const handleOpenMessageModal = () => {
    setMessageModalOpen(true);
  };
  const handleCloseMessageModal = () => {
    setMessageModalOpen(false);
  };

  // State management for the VoiceUpload modal
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const handleOpenVoiceModal = () => {
    setVoiceModalOpen(true);
  };
  const handleCloseVoiceModal = () => {
    setVoiceModalOpen(false);
  };

  return (
    <div>
      <h1>Welcome to My Landing Page</h1>

      {/* Button to open the QueryInput modal */}
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleOpenQueryModal}>
          Open Query Modal
        </Button>
      </Box>

      {/* Button to open the MessageImage modal */}
      <Box mt={2}>
        <Button variant="contained" color="secondary" onClick={handleOpenMessageModal}>
          Open Message Image Modal
        </Button>
      </Box>

      {/* Button to open the VoiceUpload modal */}
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleOpenVoiceModal}>
          Open Voice Upload Modal
        </Button>
      </Box>

      {/* QueryInputModal */}
      <QueryInputModal open={isQueryModalOpen} onClose={handleCloseQueryModal} />

      {/* MessageImageModal */}
      <MessageImageModal open={isMessageModalOpen} onClose={handleCloseMessageModal} />

      {/* VoiceUploadModal */}
      <VoiceUploadModal open={isVoiceModalOpen} onClose={handleCloseVoiceModal} />
    </div>
  );
};

export default Home;
