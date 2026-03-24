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
import { followUpComplaint, getComplaintAuditLogs, getComplaintStatuses } from '../../services/complaintService';
import { getVerifiedStakeholdersForAssignment } from '../../services/stakeholderInviteService';
import type { Complaint, ComplaintAuditLog, ComplaintStatus } from '../../types/complaint';
import type { VerifiedStakeholderAssignee } from '../../types/stakeholderInvitation';

const SEVERITY_SELECT_OPTIONS = [
  { label: 'Belum ditetapkan', value: '' },
  { label: 'Rendah', value: 'low' },
  { label: 'Sedang', value: 'medium' },
  { label: 'Tinggi', value: 'high' },
  { label: 'Kritis', value: 'critical' },
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

function getStatusName(statuses: ComplaintStatus[], code: string): string {
  return statuses.find((s) => s.code === code)?.name ?? code;
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
  const [statuses, setStatuses] = useState<ComplaintStatus[]>([]);
  const [assignees, setAssignees] = useState<VerifiedStakeholderAssignee[]>([]);
  const [nextStatus, setNextStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [comment, setComment] = useState('');
  const [severityDraft, setSeverityDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [logs, setLogs] = useState<ComplaintAuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const isResolved = complaint?.status === 'resolved';
  const readonly = isResolved;

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
    if (!open) return;
    (async () => {
      try {
        const [s, stakeholders] = await Promise.all([
          getComplaintStatuses(),
          getVerifiedStakeholdersForAssignment(),
        ]);
        setStatuses(s);
        setAssignees(stakeholders);
      } catch {
        setStatuses([]);
        setAssignees([]);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open || !complaint) return;
    setNextStatus('');
    setAssignedTo(complaint.assigned_to ?? '');
    setComment('');
    setSeverityDraft(complaint.severity ? complaint.severity.toLowerCase() : '');
    setActionError(null);
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
    try {
      const statusChanged = nextStatus && nextStatus !== complaint.status;
      const assignedChanged = assignedTo !== (complaint.assigned_to ?? '');
      const nextSev = severityDraft === '' ? null : severityDraft;
      const prevSev = complaint.severity?.toLowerCase() ?? null;
      const severityChanged = nextSev !== prevSev;
      await followUpComplaint({
        complaintId: complaint.id,
        nextStatus: statusChanged ? nextStatus : undefined,
        comment: readonly ? undefined : comment,
        assignedTo: assignedChanged ? assignedTo || null : undefined,
        nextSeverity: severityChanged ? nextSev : undefined,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan tindakan.');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = statuses.filter((s) => s.code !== (complaint?.status ?? ''));
  const currentStatusName = complaint ? getStatusName(statuses, complaint.status) : '';

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Tindakan Pengaduan - {complaint?.complaint_number}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {complaint && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {complaint.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" align='justify'>
              {complaint.description}
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
            disabled={!complaint || readonly}
          >
            {statusOptions.map((s) => (
              <MenuItem key={s.id} value={s.code}>
                {s.name}
              </MenuItem>
            ))}
            {statusOptions.length === 0 && (
              <MenuItem value="" disabled>
                Tidak ada status lain
              </MenuItem>
            )}
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Status saat ini"
            value={currentStatusName}
            disabled
          />
        </Box>

        <TextField
          select
          fullWidth
          size="small"
          label="Tingkat keparahan"
          value={severityDraft}
          onChange={(e) => setSeverityDraft(e.target.value)}
          disabled={!complaint || readonly}
          sx={{ mb: 0.5 }}
          helperText="Ditetapkan oleh admin berdasarkan dokumentasi penilaian manual."
        >
          {SEVERITY_SELECT_OPTIONS.map((s) => (
            <MenuItem key={s.value || 'unset'} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Tugaskan ke (stakeholder terverifikasi)"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          disabled={!complaint || readonly}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">
            <em>Tidak ditugaskan</em>
          </MenuItem>
          {assignees.map((s) => (
            <MenuItem key={s.user_id} value={s.user_id}>
              {s.display_name} · {s.email}
              {s.jabatan ? ` · ${s.jabatan}` : ''}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Komentar tindak lanjut"
          placeholder="Tulis catatan investigasi, permintaan dokumen, hasil analisa awal, dll."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          minRows={4}
          multiline
          disabled={!complaint || readonly}
        />

        {readonly && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Pengaduan ini sudah Selesai. Semua bidang hanya untuk dibaca.
          </Typography>
        )}

        {actionError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setActionError(null)}>
            {actionError}
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
        {!readonly && (
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={saving || !complaint}
          >
            {saving ? 'Menyimpan…' : 'Simpan tindakan'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
