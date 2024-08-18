'use client';

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';

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
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', 
        paddingTop: '100px', 
        height: '100vh',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(26, 54, 50, 0.2)', 
          padding: '40px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          maxWidth: '800px',
          textAlign: 'center',
          animation: `${fadeIn} 1s ease-in-out`, 
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 'bold', marginBottom: '20px', color: 'white', fontFamily: 'Inter, "Inter Placeholder", sans-serif' }}>
          All-in-one financial platform for modern businesses
        </Typography>
        <Typography variant="h6" sx={{ color: 'white', fontFamily: 'Inter, "Inter Placeholder", sans-serif' }}>
          Empower your business with banking<sup>1</sup>, integrations, financial insights, automatic fee recovery and team management.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
