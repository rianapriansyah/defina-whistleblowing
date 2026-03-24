import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import supabase from '../../utils/supabase';

/**
 * Landing page after stakeholder clicks the invite link in email.
 * Set Supabase Edge secret INVITE_REDIRECT_URL to:
 *   https://<your-domain>/auth/complete-invite
 * and add the same URL under Authentication → URL Configuration → Redirect URLs.
 */
export default function CompleteInvite() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const applySession = (userEmail: string | undefined | null) => {
      if (cancelled || !userEmail) return false;
      setEmail(userEmail);
      setSessionReady(true);
      setLoading(false);
      setError(null);
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    };

    const fail = (message: string) => {
      if (cancelled) return;
      setError(message);
      setLoading(false);
      setSessionReady(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return;
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (applySession(nextSession?.user?.email)) {
          subscription.unsubscribe();
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    });

    void (async () => {
      try {
        const href = window.location.href;
        const url = new URL(href);
        if (url.searchParams.get('code')) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(href);
          if (cancelled) return;
          if (exchangeErr) {
            fail(exchangeErr.message);
            subscription.unsubscribe();
            return;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (applySession(session?.user?.email)) {
          subscription.unsubscribe();
          return;
        }

        timeoutId = setTimeout(async () => {
          if (cancelled) return;
          const {
            data: { session: late },
          } = await supabase.auth.getSession();
          if (cancelled) return;
          if (applySession(late?.user?.email)) {
            subscription.unsubscribe();
            return;
          }
          fail(
            'Invalid or expired invitation link. Ask your administrator for a new invite, or sign in if you already activated your account.',
          );
          subscription.unsubscribe();
        }, 2000);
      } catch (e) {
        if (!cancelled) {
          fail(e instanceof Error ? e.message : 'Could not verify invitation.');
          subscription.unsubscribe();
        }
      }
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      navigate('/dashboard', { replace: true });
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
          Activate your account
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Set a password to finish accepting your invitation.
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && sessionReady && (
          <Box component="form" onSubmit={(ev) => void handleSubmit(ev)}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              slotProps={{ input: { readOnly: true } }}
              helperText="This address is tied to your invitation."
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'OK'}
            </Button>
          </Box>
        )}

        {!loading && !sessionReady && error && (
          <Box sx={{ mt: 1 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" align="center">
              <Link component={RouterLink} to="/login" underline="hover">
                Go to sign in
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
