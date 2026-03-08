import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import './App.css';
import { AppBar, Box, Link, styled, Toolbar, Typography } from '@mui/material';
import AppTheme from './theme/AppTheme';
import Complaint from './components/complaint/Complaint';
import TrackComplaint from './components/complaint/TrackComplaint';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

const App: React.FC = () => {
  return (
    <AppTheme>
      <Router>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Defina Whistleblowing
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ mr: 2 }}>
              Kirim Pengaduan
            </Link>
            <Link component={RouterLink} to="/lacak-pengaduan" color="inherit" underline="hover">
              Lacak Pengaduan
            </Link>
          </Toolbar>
        </AppBar>
        <Offset />
        <Box component="main">
          <Routes>
            <Route path="/" element={<Complaint />} />
            <Route path="/lacak-pengaduan" element={<TrackComplaint />} />
          </Routes>
        </Box>
      </Router>
    </AppTheme>
  );
};

export default App;
