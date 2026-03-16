import { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { get_all_complaints } from '../../services/complaintService';
import type { Complaint } from '../../types/complaint';

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get_all_complaints()
      .then((data) => setComplaints(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: complaints.length,
    low: complaints.filter((c) => c.severity?.toLowerCase() === 'low').length,
    medium: complaints.filter((c) => c.severity?.toLowerCase() === 'medium').length,
    high: complaints.filter((c) => c.severity?.toLowerCase() === 'high').length,
    critical: complaints.filter((c) => c.severity?.toLowerCase() === 'critical').length,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        p: { xs: 1.5, sm: 2, md: 3 },
        minWidth: 0,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        Dashboard Pengaduan
      </Typography>

      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: { xs: 1.5, sm: 2 },
          mt: 2,
        }}
      >
        <Card sx={{ minWidth: 0, width: '100%' }}>
          <CardContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Total Pengaduan
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, fontWeight: 600 }}>
              {counts.total}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'success.main', minWidth: 0, width: '100%' }}>
          <CardContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Rendah
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, fontWeight: 600 }}>
              {counts.low}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'info.main', minWidth: 0, width: '100%' }}>
          <CardContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Sedang
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, fontWeight: 600 }}>
              {counts.medium}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'warning.main', minWidth: 0, width: '100%' }}>
          <CardContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Tinggi
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, fontWeight: 600 }}>
              {counts.high}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'error.main', minWidth: 0, width: '100%' }}>
          <CardContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Kritis
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, fontWeight: 600 }}>
              {counts.critical}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
