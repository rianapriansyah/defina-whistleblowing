import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { get_all_complaints } from '../../services/complaintService';
import { getSeverityColor } from '../../utils/severity';
import type { Complaint } from '../../types/complaint';

const statusLabels: Record<string, string> = {
  submitted: 'Diterima',
  in_review: 'Dalam peninjauan',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

const severityLabels: Record<string, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  critical: 'Kritis',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

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
    <Box sx={{ p: { xs: 2, sm: 3 }, minWidth: 0, width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Dashboard Pengaduan
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ minWidth: 0 }}>
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Total Pengaduan
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {counts.total}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'success.main', minWidth: 0 }}>
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Rendah
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {counts.low}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'info.main', minWidth: 0 }}>
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Sedang
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {counts.medium}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'warning.main', minWidth: 0 }}>
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Tinggi
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {counts.high}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: 4, borderColor: 'error.main', minWidth: 0 }}>
          <CardContent sx={{ py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Kritis
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {counts.critical}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Daftar Pengaduan
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'visible',
          WebkitOverflowScrolling: 'touch',
          borderRadius: 2,
        }}
      >
        <TableContainer sx={{ minWidth: 600, overflow: 'visible' }}>
          <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nomor Pengaduan</TableCell>
              <TableCell>Judul</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tingkat keparahan</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Diterima pada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Belum ada pengaduan
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{row.complaint_number}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{statusLabels[row.status] ?? row.status}</TableCell>
                  <TableCell>
                    {row.severity ? (
                      <Chip
                        size="small"
                        label={severityLabels[row.severity] ?? row.severity}
                        color={getSeverityColor(row.severity)}
                        variant="outlined"
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{row.category || '—'}</TableCell>
                  <TableCell>{formatDate(row.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
