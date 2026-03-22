import React, { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getComplaintByNumberAndPassword, getComplaintStatuses } from '../../services/complaintService';
import { getSeverityColor } from '../../utils/severity';
import type { Complaint, ComplaintStatus } from '../../types/complaint';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [complaintNumber, setComplaintNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [statuses, setStatuses] = useState<ComplaintStatus[]>([]);

  useEffect(() => {
    getComplaintStatuses()
      .then(setStatuses)
      .catch(() => setStatuses([]));
  }, []);

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

  const detailRows = useMemo(() => {
    if (!complaint) return [];
    const statusName = statuses.find((s) => s.code === complaint.status)?.name ?? complaint.status;
    return [
      { label: 'Nomor Pengaduan', value: complaint.complaint_number, bold: true },
      { label: 'Status', value: statusName ?? '—', bold: true },
      { label: 'Assigned to', value: complaint.assigned_to || '—' },
      { label: 'Resolution result', value: complaint.resolution || '—', long: true },
      { label: 'Updated at', value: formatDate(complaint.updated_at) },
      { label: 'Resolution date', value: complaint.resolved_at ? formatDate(complaint.resolved_at) : '—' },
      { label: 'Judul', value: complaint.title },
      { label: 'Deskripsi', value: complaint.description, long: true },
      { label: 'Tanggal kejadian', value: complaint.incident_date ? formatDate(complaint.incident_date) : '—' },
      { label: 'Lokasi', value: complaint.location || '—' },
      { label: 'Kategori', value: complaint.category || '—' },
      {
        label: 'Status pelapor',
        value: complaint.reporter_statuses?.name ?? '—',
      },
      { label: 'Unit kerja', value: complaint.reporter_unit_kerja || '—' },
      {
        label: 'Tingkat keparahan',
        value: complaint.severity ? (
          <Chip
            size="small"
            label={severityLabels[complaint.severity] ?? complaint.severity}
            color={getSeverityColor(complaint.severity)}
            variant="outlined"
          />
        ) : (
          '—'
        ),
      },
      { label: 'Diterima pada', value: formatDate(complaint.created_at) },
    ];
  }, [complaint, statuses]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Paper sx={{ maxWidth: 640, width: '100%', p: { xs: 2, sm: 3 } }}>
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
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
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
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Detail Pengaduan
            </Typography>
            {isMobile ? (
              <Box
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                {detailRows.map(({ label, value, bold, long }, index) => (
                  <Box
                    key={label}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderBottom: index < detailRows.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'action.hover',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', fontWeight: 500, mb: 0.5 }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: bold ? 600 : undefined,
                        textAlign: long ? 'left' : undefined,
                        wordBreak: 'break-word',
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    px: 2,
                  },
                  '& .MuiTableRow-root:last-child .MuiTableCell-root': {
                    borderBottom: 'none',
                  },
                }}
              >
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableBody>
                    {detailRows.map(({ label, value, bold, long }) => (
                      <TableRow key={label}>
                        <TableCell
                          variant="head"
                          sx={{
                            width: '42%',
                            fontWeight: 500,
                            color: 'text.secondary',
                            backgroundColor: 'action.hover',
                          }}
                        >
                          {label}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: bold ? 600 : undefined,
                            textAlign: long ? 'left' : undefined,
                            verticalAlign: long ? 'top' : 'middle',
                          }}
                        >
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
