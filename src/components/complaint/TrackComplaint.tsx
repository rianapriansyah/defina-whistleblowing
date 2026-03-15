import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import { getComplaintByNumberAndPassword } from '../../services/complaintService';
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
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

export default function TrackComplaint() {
  const [complaintNumber, setComplaintNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<Complaint | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setComplaint(null);
    if (!complaintNumber.trim() || !password) {
      setError('Nomor pengaduan dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const data = await getComplaintByNumberAndPassword(complaintNumber.trim(), password);
      setComplaint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data pengaduan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 640, width: '100%', p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Lacak Pengaduan
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Masukkan Nomor Pengaduan dan Password Pengaduan yang Anda terima saat mengirim pengaduan.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nomor Pengaduan"
            fullWidth
            value={complaintNumber}
            onChange={(e) => setComplaintNumber(e.target.value)}
            placeholder="Contoh: CMP-XXXX-XXX"
          />
          <TextField
            label="Password Pengaduan"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Memuat…' : 'Cari pengaduan'}
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Link component={RouterLink} to="/" underline="hover">
            ← Kembali ke formulir pengaduan
          </Link>
        </Box>

        {complaint && (
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Detail Pengaduan
            </Typography>
            <Box component="dl" sx={{ m: 0 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Nomor Pengaduan:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ fontWeight: 500 }}>
                  {complaint.complaint_number}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Status:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ fontWeight: 500 }}>
                  {statusLabels[complaint.status] ?? complaint.status}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Assigned to:
                </Typography>
                <Typography component="dd" variant="body2">
                  {complaint.assigned_to || '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Resolution result:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ flex: 1 }}>
                  {complaint.resolution || '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Updated at:
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatDate(complaint.updated_at)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Resolution date:
                </Typography>
                <Typography component="dd" variant="body2">
                  {complaint.resolved_at ? formatDate(complaint.resolved_at) : '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Judul:
                </Typography>
                <Typography component="dd" variant="body2">
                  {complaint.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Deskripsi:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ flex: 1 }}>
                  {complaint.description}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Tanggal kejadian:
                </Typography>
                <Typography component="dd" variant="body2">
                  {complaint.incident_date ? formatDate(complaint.incident_date) : '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Lokasi:
                </Typography>
                <Typography component="dd" variant="body2">
                  {complaint.location || '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Kategori:
                </Typography>
                <Typography component="dd" variant="body2">
                  {complaint.category || '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Tingkat keparahan:
                </Typography>
                <Typography component="dd" variant="body2">
                  {complaint.severity ? (
                    <Chip
                      size="small"
                      label={severityLabels[complaint.severity] ?? complaint.severity}
                      color={getSeverityColor(complaint.severity)}
                      variant="outlined"
                    />
                  ) : (
                    '—'
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  Diterima pada:
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatDate(complaint.created_at)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
