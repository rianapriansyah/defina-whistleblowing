import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (tab === 0) {
        const { error: err } = await signIn(email, password);
        if (err) setError(err.message);
      } else {
        const { error: err, alreadyRegistered } = await signUp(email, password);
        if (err) {
          setError(err.message);
          if (alreadyRegistered) setTab(0); // Switch to Sign in so they can log in
        } else {
          setMessage('Check your email to confirm your account.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ maxWidth: 400, width: '100%', p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Defina Whistleblowing
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Sign in to access the platform
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
          <Tab label="Sign in" />
          <Tab label="Sign up" />
        </Tabs>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            autoComplete="email"
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete={tab === 0 ? 'current-password' : 'new-password'}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setMessage(null)}>
              {message}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : tab === 0 ? 'Sign in' : 'Sign up'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
