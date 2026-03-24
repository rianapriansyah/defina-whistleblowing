import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import PersonAddAlt from '@mui/icons-material/PersonAddAlt';
import {
  getStakeholderOverview,
  inviteStakeholder,
  listStakeholderInvitations,
} from '../../services/stakeholderInviteService';
import type { StakeholderInvitation, StakeholderOverviewRow } from '../../types/stakeholderInvitation';

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function formatDateShort(value: string | null): string {
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

interface InviteStakeholderDialogProps {
  open: boolean;
  onClose: () => void;
  onInvited: () => void;
}

function InviteStakeholderDialog({ open, onClose, onInvited }: InviteStakeholderDialogProps) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setNama('');
    setEmail('');
    setJabatan('');
    setCatatan('');
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nama.trim() || !email.trim() || !jabatan.trim()) {
      setError('Nama, email, dan jabatan wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      await inviteStakeholder({
        nama: nama.trim(),
        email: email.trim(),
        jabatan: jabatan.trim(),
        catatan: catatan.trim() || undefined,
      });
      reset();
      onInvited();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim undangan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" TransitionProps={{ onExited: reset }}>
      <DialogTitle>Undang stakeholder</DialogTitle>
      <Box component="form" onSubmit={(ev) => void handleSubmit(ev)}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nama"
              fullWidth
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              autoComplete="name"
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Jabatan"
              fullWidth
              required
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
            />
            <TextField
              label="Catatan"
              fullWidth
              multiline
              minRows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Opsional — tersimpan di riwayat undangan."
            />
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={handleClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim undangan'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function InviteStakeholders() {
  const [tab, setTab] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [overview, setOverview] = useState<StakeholderOverviewRow[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const [history, setHistory] = useState<StakeholderInvitation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const rows = await getStakeholderOverview();
      setOverview(rows);
    } catch (e) {
      setOverviewError(e instanceof Error ? e.message : 'Gagal memuat daftar stakeholder.');
      setOverview([]);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const rows = await listStakeholderInvitations(100);
      setHistory(rows);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'Gagal memuat riwayat undangan.');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadOverview(), loadHistory()]);
  }, [loadOverview, loadHistory]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const overviewColumns: GridColDef<StakeholderOverviewRow & { id: string }>[] = useMemo(
    () => [
      {
        field: 'invited_at',
        headerName: 'Diundang',
        width: 150,
        valueGetter: (_v, row) => formatDateShort(row.invited_at),
      },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
      { field: 'nama', headerName: 'Nama', width: 140 },
      { field: 'jabatan', headerName: 'Jabatan', width: 140 },
      {
        field: 'is_verified',
        headerName: 'Status akun',
        width: 150,
        renderCell: (params) =>
          params.row.is_verified ? (
            <Chip size="small" label="Terverifikasi" color="success" variant="outlined" sx={{ my: 0.5 }} />
          ) : (
            <Chip size="small" label="Belum verifikasi" color="default" variant="outlined" sx={{ my: 0.5 }} />
          ),
      },
      {
        field: 'email_confirmed_at',
        headerName: 'Email dikonfirmasi',
        width: 150,
        valueGetter: (_v, row) => formatDate(row.email_confirmed_at),
      },
      {
        field: 'invitation_status',
        headerName: 'Status undangan',
        width: 120,
        valueGetter: (_v, row) => (row.invitation_status === 'sent' ? 'Terkirim' : row.invitation_status),
      },
      {
        field: 'catatan',
        headerName: 'Catatan',
        flex: 0.8,
        minWidth: 120,
        valueGetter: (_v, row) => row.catatan || '—',
      },
    ],
    [],
  );

  const overviewRows = useMemo(
    () => overview.map((r) => ({ ...r, id: r.invitation_id })),
    [overview],
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1400,
        mx: 'auto',
        boxSizing: 'border-box',
        p: { xs: 1.5, sm: 2, md: 3 },
        minWidth: 0,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Stakeholder
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hanya admin. Undangan dikirim lewat Edge Function <strong>invite-stakeholder</strong>. Status verifikasi
        mengacu pada konfirmasi email di Supabase Auth.
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
        >
          <Tab label="Daftar stakeholder" id="stakeholder-tab-0" aria-controls="stakeholder-tabpanel-0" />
          <Tab label="Riwayat undangan" id="stakeholder-tab-1" aria-controls="stakeholder-tabpanel-1" />
        </Tabs>

        {tab === 0 && (
          <Box role="tabpanel" id="stakeholder-tabpanel-0" aria-labelledby="stakeholder-tab-0" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<PersonAddAlt />} onClick={() => setInviteOpen(true)}>
                Undang stakeholder
              </Button>
            </Box>
            {overviewError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {overviewError}
              </Typography>
            )}
            <Paper
              sx={{
                width: '100%',
                minWidth: 0,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <DataGrid
                rows={overviewRows}
                columns={overviewColumns}
                loading={overviewLoading}
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
        )}

        {tab === 1 && (
          <Box role="tabpanel" id="stakeholder-tabpanel-1" aria-labelledby="stakeholder-tab-1" sx={{ p: 2 }}>
            {historyError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {historyError}
              </Typography>
            )}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Waktu</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell>Jabatan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Catatan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary">
                          Memuat…
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary">
                          Belum ada riwayat undangan.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{formatDate(row.created_at)}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.nama}</TableCell>
                        <TableCell>{row.jabatan}</TableCell>
                        <TableCell>{row.status === 'sent' ? 'Terkirim' : row.status}</TableCell>
                        <TableCell sx={{ maxWidth: 220, whiteSpace: 'pre-wrap' }}>{row.catatan || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      <InviteStakeholderDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => void refreshAll()}
      />
    </Box>
  );
}
