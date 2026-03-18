import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import FilterAltOff from '@mui/icons-material/FilterAltOff';
import Draw from '@mui/icons-material/Draw';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
import { getComplaintStatuses, searchComplaints } from '../../services/complaintService';
import { getSeverityColor } from '../../utils/severity';
import type { Complaint, ComplaintStatus } from '../../types/complaint';
import TindakanPengaduanModal from './TindakanPengaduanModal';

const CATEGORY_OPTIONS = ['Penipuan', 'Korupsi', 'Pelecehan', 'Diskriminasi', 'Keselamatan', 'Lainnya'];

const SEVERITY_OPTIONS = [
  { label: 'Rendah', value: 'low' },
  { label: 'Sedang', value: 'medium' },
  { label: 'Tinggi', value: 'high' },
  { label: 'Kritis', value: 'critical' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

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
  const theme = useTheme();
  const showActionHeader = useMediaQuery(theme.breakpoints.up('lg'));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [incidentDate, setIncidentDate] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Complaint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const [actionOpen, setActionOpen] = useState(false);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [statuses, setStatuses] = useState<ComplaintStatus[]>([]);

  const urlQueryKey = searchParams.toString();

  useEffect(() => {
    getComplaintStatuses()
      .then(setStatuses)
      .catch(() => setStatuses([]));
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(urlQueryKey);
    const sev = sp.get('severity') ?? '';
    const cat = sp.get('category') ?? '';
    setSeverity(sev);
    setCategory(cat);
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchComplaints({
          severity: sev || undefined,
          category: cat || undefined,
        });
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data.');
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [urlQueryKey]);

  const doSearch = useCallback(async () => {
    setError(null);
    setLoading(true);
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
      setPaginationModel((m) => ({ ...m, page: 0 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat hasil pencarian.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, incidentDate, category, severity, nip]);

  const openAction = (row: Complaint) => {
    setActiveComplaint(row);
    setActionOpen(true);
  };

  const closeAction = () => {
    setActionOpen(false);
    setActiveComplaint(null);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setIncidentDate(null);
    setCategory('');
    setSeverity('');
    setNip('');
    setExpanded(false);
    setPaginationModel({ page: 0, pageSize: 10 });
    const path = '/investigasi-analisis';
    const hadQuery = searchParams.toString().length > 0;
    if (hadQuery) {
      navigate(path, { replace: true });
      return;
    }
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await searchComplaints({});
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch();
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'complaint_number', headerName: 'Nomor Pengaduan', width: 160, minWidth: 140 },
      { field: 'title', headerName: 'Judul', flex: 1, minWidth: 140 },
      {
        field: 'description',
        headerName: 'Deskripsi',
        flex: 1,
        minWidth: 180,
        valueGetter: (_v, row) => row.description || '—',
      },
      {
        field: 'location',
        headerName: 'Lokasi',
        width: 130,
        valueGetter: (_v, row) => row.location || '—',
      },
      {
        field: 'incident_date',
        headerName: 'Tanggal Kejadian',
        width: 130,
        valueGetter: (_v, row) => formatDate(row.incident_date),
      },
      {
        field: 'category',
        headerName: 'Kategori',
        width: 120,
        valueGetter: (_v, row) => row.category || '—',
      },
      {
        field: 'severity',
        headerName: 'Tingkat Keparahan',
        width: 150,
        renderCell: (params) => {
          const s = params.row.severity as string | null;
          if (!s) return '—';
          return (
            <Chip
              size="small"
              label={SEVERITY_OPTIONS.find((x) => x.value === s)?.label ?? s}
              color={getSeverityColor(s)}
              variant="outlined"
              sx={{ my: 0.5 }}
            />
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        valueGetter: (_v, row) =>
          statuses.find((s) => s.code === row.status)?.name ?? row.status ?? '—',
      },
      {
        field: 'reporter_user_id',
        headerName: 'NIP',
        width: 120,
        valueGetter: (_v, row) => row.reporter_user_id || '—',
      },
      {
        field: 'created_at',
        headerName: 'Diterima pada',
        width: 130,
        valueGetter: (_v, row) => formatDate(row.created_at),
      },
      {
        field: '__actions',
        headerName: showActionHeader ? 'Tindakan' : '',
        width: showActionHeader ? 132 : 72,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            aria-label="Tindakan"
            startIcon={showActionHeader ? <Draw fontSize="small" /> : undefined}
            onClick={(e) => {
              e.stopPropagation();
              openAction(params.row as Complaint);
            }}
            sx={{
              minWidth: showActionHeader ? undefined : 40,
              px: showActionHeader ? 1.25 : 0.75,
              py: 0.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: (t) => (showActionHeader ? t.shadows[1] : 0),
              '&:hover': { boxShadow: (t) => t.shadows[2] },
            }}
          >
            {showActionHeader ? 'Tindakan' : <Draw fontSize="small" />}
          </Button>
        ),
      },
    ],
    [showActionHeader, statuses]
  );

  const rows = useMemo(
    () => results.map((r) => ({ ...r, id: r.id })),
    [results]
  );

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
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                flexWrap: 'wrap',
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Cari Nomor Aduan, Judul, Deskripsi, Lokasi..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                sx={{ flex: { sm: 1 }, minWidth: { sm: 200 } }}
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
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: 100 }}>
                  {loading ? 'Mencari…' : 'Cari'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  startIcon={<FilterAltOff />}
                  disabled={loading}
                  onClick={handleClearFilters}
                >
                  Hapus filter
                </Button>
              </Box>
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

        <Box sx={{ width: '100%', minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
            {loading ? 'Memuat…' : `${results.length} pengaduan`}
          </Typography>
          <Paper
            sx={{
              width: '100%',
              minWidth: 0,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              disableRowSelectionOnClick
              autoHeight
              slotProps={{
                pagination: {
                  labelRowsPerPage: 'Baris per halaman:',
                  labelDisplayedRows: ({
                    from,
                    to,
                    count,
                  }: {
                    from: number;
                    to: number;
                    count: number;
                  }) => `${from}–${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`,
                },
              }}
            />
          </Paper>
        </Box>

        <TindakanPengaduanModal
          open={actionOpen}
          complaint={activeComplaint}
          onClose={closeAction}
          onSaved={doSearch}
        />
      </Box>
    </LocalizationProvider>
  );
}
