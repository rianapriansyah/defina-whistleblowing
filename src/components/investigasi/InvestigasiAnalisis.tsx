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
  useTheme,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import FilterAltOff from '@mui/icons-material/FilterAltOff';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
import { alpha } from '@mui/material/styles';
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

  const urlQueryKey = searchParams.toString();

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
        valueGetter: (_v, row) => STATUS_LABELS[row.status] ?? row.status,
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
    ],
    []
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
            variant="outlined"
            sx={{
              width: '100%',
              minWidth: 0,
              borderRadius: 2,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              checkboxSelection
              disableRowSelectionOnClick={false}
              autoHeight={false}
              getRowClassName={(params) =>
                theme.palette.mode === 'light' && params.indexRelativeToCurrentPage % 2 === 0
                  ? 'investigasi-row--stripe'
                  : ''
              }
              sx={{
                minWidth: 700,
                width: '100%',
                border: 'none',
                color: 'text.primary',
                /* Bounded height: scroll rows inside grid, footer always visible (MUI demo pattern) */
                height: {
                  xs: 'min(420px, calc(100vh - 240px))',
                  sm: 'min(520px, calc(100vh - 220px))',
                  md: 'min(560px, calc(100vh - 200px))',
                },
                minHeight: 320,
                '& .MuiDataGrid-main': { outline: 'none' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                  color: 'text.primary',
                  borderBottomColor: 'divider',
                },
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
                /* Dark: uniform dark rows + readable text (like MUI DataGrid demo) */
                '& .MuiDataGrid-row': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[900]
                      : theme.palette.background.paper,
                  color: 'text.primary',
                },
                '& .MuiDataGrid-row.investigasi-row--stripe': {
                  backgroundColor: theme.palette.grey[100],
                },
                '& .MuiDataGrid-cell': {
                  color: 'text.primary',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.06)
                      : theme.palette.action.hover,
                },
                '& .MuiDataGrid-row.investigasi-row--stripe:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.06)
                      : alpha(theme.palette.grey[100], 0.85),
                },
                /* Selected: bluish tint like MUI X reference */
                '& .MuiDataGrid-row.Mui-selected': {
                  backgroundColor: `${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.1)} !important`,
                },
                '& .MuiDataGrid-row.Mui-selected:hover': {
                  backgroundColor: `${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.14)} !important`,
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTopColor: 'divider',
                  backgroundColor:
                    theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
                  minHeight: { xs: 56, sm: 52 },
                  py: { xs: 1, sm: 0 },
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                },
                '& .MuiTablePagination-root': {
                  color: 'text.primary',
                  width: '100%',
                  overflow: 'visible',
                },
                '& .MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                  gap: 1,
                  minHeight: { xs: 48, sm: 52 },
                  px: { xs: 1, sm: 2 },
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: 'text.secondary',
                },
              }}
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
      </Box>
    </LocalizationProvider>
  );
}
