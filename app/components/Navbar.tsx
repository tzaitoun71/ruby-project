'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext'; 

const Navbar: React.FC = () => {
  const router = useRouter();
  const { signOut } = useUser(); 

  const handleFileComplaint = () => {
    router.push('/complaint-page');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 25 }}>
          <Box
            component="img"
            src="/diamond.png"
            alt="Ruby Logo"
            sx={{ height: 32, marginRight: 1 }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{ color: 'black', fontWeight: 'bold', fontFamily: 'Inter, "Inter Placeholder", sans-serif' }}
          >
            Ruby
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, position: 'absolute', left: '50%', transform: 'translateX(-50%)', alignItems: 'center' }}>
          <Typography variant="button" sx={{ color: 'black', fontFamily: 'Inter, "Inter Placeholder", sans-serif' }}>
            PRODUCTS
          </Typography>
          <Typography variant="button" sx={{ color: 'black', fontFamily: 'Inter, "Inter Placeholder", sans-serif' }}>
            SOLUTIONS
          </Typography>
          <Typography variant="button" sx={{ color: 'black', cursor: 'pointer', fontFamily: 'Inter, "Inter Placeholder", sans-serif' }} onClick={handleFileComplaint}>
            FILE A COMPLAINT
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 25 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              fontFamily: 'Inter, "Inter Placeholder", sans-serif',
              border: '2px solid #E9E3A6',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#E9E3A6',
              },
              textTransform: 'none',
              marginRight: 2,
            }}
            onClick={signOut} 
          >
            Log out
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#E9E3A6',
              color: 'black',
              fontWeight: 'bold',
              fontFamily: 'Inter, "Inter Placeholder", sans-serif',
              textTransform: 'none',
            }}
          >
            GET STARTED
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
