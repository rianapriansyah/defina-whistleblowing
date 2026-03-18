import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { followUpComplaint, getComplaintAuditLogs } from '../../services/complaintService';
import type { Complaint, ComplaintAuditLog } from '../../types/complaint';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Diterima',
  in_review: 'Dalam peninjauan',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

const STATUS_OPTIONS = [
  { label: 'Diterima', value: 'submitted' },
  { label: 'Dalam peninjauan', value: 'in_review' },
  { label: 'Selesai', value: 'resolved' },
  { label: 'Ditutup', value: 'closed' },
] as const;

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

export interface TindakanPengaduanModalProps {
  open: boolean;
  complaint: Complaint | null;
  onClose: () => void;
  /** Called after a successful save so the parent can refresh the list. */
  onSaved: () => void | Promise<void>;
}

export default function TindakanPengaduanModal({
  open,
  complaint,
  onClose,
  onSaved,
}: TindakanPengaduanModalProps) {
  const [nextStatus, setNextStatus] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [logs, setLogs] = useState<ComplaintAuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadLogs = useCallback(async (complaintId: string) => {
    setLogsLoading(true);
    try {
      const data = await getComplaintAuditLogs(complaintId);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !complaint) return;
    setNextStatus(complaint.status ?? '');
    setComment('');
    setActionError(null);
    setActionSuccess(null);
    void loadLogs(complaint.id);
  }, [open, complaint, loadLogs]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!complaint) return;
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const statusChanged = nextStatus && nextStatus !== complaint.status;
      await followUpComplaint({
        complaintId: complaint.id,
        nextStatus: statusChanged ? nextStatus : undefined,
        comment,
      });
      setActionSuccess('Tindakan tersimpan.');
      await onSaved();
      await loadLogs(complaint.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan tindakan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Tindakan Pengaduan</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {complaint && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {complaint.complaint_number}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {complaint.title}
            </Typography>
          </Paper>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            select
            fullWidth
            size="small"
            label="Update Status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value)}
            disabled={!complaint}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Status saat ini"
            value={complaint ? `${STATUS_LABELS[complaint.status] ?? complaint.status}` : ''}
            disabled
          />
        </Box>

        <TextField
          fullWidth
          label="Komentar tindak lanjut"
          placeholder="Tulis catatan investigasi, permintaan dokumen, hasil analisa awal, dll."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          minRows={4}
          multiline
          disabled={!complaint}
        />

        {actionError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}
        {actionSuccess && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Riwayat Tindakan Terakhir
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <List dense disablePadding>
              {logsLoading ? (
                <ListItem>
                  <ListItemText primary="Memuat riwayat…" />
                </ListItem>
              ) : logs.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Belum ada riwayat tindakan." />
                </ListItem>
              ) : (
                logs.map((l) => (
                  <ListItem key={l.id} divider>
                    <ListItemText
                      primary={
                        l.action
                          ? `${l.action}${l.created_at ? ` • ${formatDate(l.created_at)}` : ''}`
                          : `${l.created_at ? formatDate(l.created_at) : '—'}`
                      }
                      secondary={l.description || '—'}
                      secondaryTypographyProps={{ sx: { whiteSpace: 'pre-wrap' } }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Tutup
        </Button>
        <Button variant="contained" onClick={() => void handleSave()} disabled={saving || !complaint}>
          {saving ? 'Menyimpan…' : 'Simpan tindakan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
