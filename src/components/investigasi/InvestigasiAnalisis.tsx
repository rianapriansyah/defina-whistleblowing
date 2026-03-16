import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
import { searchComplaints } from '../../services/complaintService';
import { getSeverityColor } from '../../utils/severity';
import type { Complaint } from '../../types/complaint';

const CATEGORY_OPTIONS = ['Penipuan', 'Korupsi', 'Pelecehan', 'Diskriminasi', 'Keselamatan', 'Lainnya'];

const SEVERITY_OPTIONS = [
  { label: 'Rendah', value: 'low' },
  { label: 'Sedang', value: 'medium' },
  { label: 'Tinggi', value: 'high' },
  { label: 'Kritis', value: 'critical' },
];

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Diterima',
  in_review: 'Dalam peninjauan',
  resolved: 'Selesai',
  closed: 'Ditutup',
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

export default function InvestigasiAnalisis() {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [incidentDate, setIncidentDate] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Complaint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async () => {
    setError(null);
    setLoading(true);
    setSearched(true);
    try {
      const incidentDateStr = incidentDate ? incidentDate.format('YYYY-MM-DD') : undefined;
      const data = await searchComplaints({
        keyword: keyword.trim() || undefined,
        incidentDate: incidentDateStr,
        category: category || undefined,
        severity: severity || undefined,
        nip: nip.trim() || undefined,
      });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat hasil pencarian.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, incidentDate, category, severity, nip]);

  useEffect(() => {
    const severityParam = searchParams.get('severity');
    const categoryParam = searchParams.get('category');
    if (severityParam) setSeverity(severityParam);
    if (categoryParam) setCategory(categoryParam);
  }, [searchParams]);

  useEffect(() => {
    const severityParam = searchParams.get('severity');
    const categoryParam = searchParams.get('category');
    if (!severityParam && !categoryParam) return;
    setSearched(true);
    setLoading(true);
    setError(null);
    searchComplaints({
      severity: severityParam || undefined,
      category: categoryParam || undefined,
    })
      .then(setResults)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat hasil pencarian.');
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
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
          Investigasi & Analisis
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari Nomor Aduan, Judul, Deskripsi, Lokasi..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={expanded ? 'Sembunyikan filter' : 'Perluas pencarian'}
                          onClick={() => setExpanded((prev) => !prev)}
                          size="small"
                        >
                          {expanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                {loading ? 'Mencari…' : 'Cari'}
              </Button>
            </Box>

            <Collapse in={expanded} timeout="auto">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                  gap: 2,
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <DatePicker
                  label="Tanggal Kejadian"
                  value={incidentDate}
                  onChange={(v) => setIncidentDate(v)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Semua</em>
                  </MenuItem>
                  {CATEGORY_OPTIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tingkat Keparahan"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Semua</em>
                  </MenuItem>
                  {SEVERITY_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  label="NIP"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                />
              </Box>
            </Collapse>
          </Box>
        </Paper>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {searched && (
          <Box sx={{ width: '100%', minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              {loading ? 'Memuat…' : `Ditemukan ${results.length} hasil`}
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
              <TableContainer sx={{ minWidth: 700, overflow: 'visible' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nomor Pengaduan</TableCell>
                      <TableCell>Judul</TableCell>
                      <TableCell>Deskripsi</TableCell>
                      <TableCell>Lokasi</TableCell>
                      <TableCell>Tanggal Kejadian</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>Tingkat Keparahan</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>NIP</TableCell>
                      <TableCell>Diterima pada</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.length === 0 && !loading ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      results.map((row, index) => (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            backgroundColor: index % 2 === 0 ? 'grey.100' : 'background.paper',
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{row.complaint_number}</TableCell>
                          <TableCell>{row.title}</TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.description || '—'}
                          </TableCell>
                          <TableCell>{row.location || '—'}</TableCell>
                          <TableCell>{formatDate(row.incident_date)}</TableCell>
                          <TableCell>{row.category || '—'}</TableCell>
                          <TableCell>
                            {row.severity ? (
                              <Chip
                                size="small"
                                label={SEVERITY_OPTIONS.find((s) => s.value === row.severity)?.label ?? row.severity}
                                color={getSeverityColor(row.severity)}
                                variant="outlined"
                              />
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>{STATUS_LABELS[row.status] ?? row.status}</TableCell>
                          <TableCell>{row.reporter_user_id || '—'}</TableCell>
                          <TableCell>{formatDate(row.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}
