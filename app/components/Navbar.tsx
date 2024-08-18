'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const router = useRouter();

  const handleFileComplaint = () => {
    router.push('/complaint-page'); 
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black', display: 'flex', alignItems: 'center' }}>
          <Box component="img" src="/diamond.png" alt="Ruby Logo" sx={{ height: 24, marginRight: 1 }} />
          Ruby
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="button" sx={{ color: 'black' }}>
            Products
          </Typography>
          <Typography variant="button" sx={{ color: 'black' }}>
            Solutions
          </Typography>
          <Typography variant="button" sx={{ color: 'black', cursor: 'pointer' }} onClick={handleFileComplaint}>
            File a Complaint
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: '#f5e342', color: 'black', fontWeight: 'bold' }}>
            Get Started
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
