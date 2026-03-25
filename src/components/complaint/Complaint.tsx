import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Switch,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { createComplaint, getReporterStatuses } from '../../services/complaintService';
import type { ReporterStatus } from '../../types/complaint';
import { isAllowedFile } from '../../helpers/fileValidation';

const ACCEPT_FILE_TYPES = '.jpg,.jpeg,.png,.pdf';
const MAX_FILE_SIZE_MB = 10;

const categoryOptions = [
  'Penipuan',
  'Korupsi',
  'Pelecehan',
  'Diskriminasi',
  'Keselamatan',
  'Lainnya',
];

const Complaint: React.FC = () => {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState<Dayjs | null>(null);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterStatusId, setReporterStatusId] = useState('');
  const [reporterUnitKerja, setReporterUnitKerja] = useState('');
  const [reporterStatuses, setReporterStatuses] = useState<ReporterStatus[]>([]);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    complaintNumber: string;
    complaintPassword: string;
  } | null>(null);

  useEffect(() => {
    getReporterStatuses()
      .then(setReporterStatuses)
      .catch(() => setReporterStatuses([]));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const result = await createComplaint({
        isAnonymous,
        title: title.trim(),
        description: description.trim(),
        incidentDate: incidentDate ? incidentDate.format('YYYY-MM-DD') : undefined,
        location: location || undefined,
        category: category || undefined,
        reporterName: isAnonymous ? undefined : reporterName.trim() || undefined,
        reporterEmail: isAnonymous ? undefined : reporterEmail.trim() || undefined,
        reporterPhone: isAnonymous ? undefined : reporterPhone.trim() || undefined,
        reporterStatusId: isAnonymous ? undefined : reporterStatusId.trim() || undefined,
        reporterUnitKerja: isAnonymous ? undefined : reporterUnitKerja.trim() || undefined,
        files: files.length > 0 ? files : undefined,
      });

      setSuccessInfo({
        complaintNumber: result.complaintNumber,
        complaintPassword: result.complaintPassword,
      });

      setTitle('');
      setDescription('');
      setIncidentDate(null);
      setLocation('');
      setCategory('');
      setReporterName('');
      setReporterEmail('');
      setReporterPhone('');
      setReporterStatusId('');
      setReporterUnitKerja('');
      setDeclarationAccepted(false);
      setFiles([]);
      setFileError(null);
      setIsAnonymous(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal mengirim pengaduan.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? []);
    setFileError(null);
    const invalid = chosen.filter((f) => !isAllowedFile(f));
    if (invalid.length > 0) {
      setFileError('Hanya file JPG, PNG, dan PDF yang diizinkan.');
      return;
    }
    const tooBig = chosen.filter((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (tooBig.length > 0) {
      setFileError(`Setiap file maksimal ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    setFiles((prev) => [...prev, ...chosen]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  const baseMandatoryFilled =
    title.trim() !== '' &&
    description.trim() !== '' &&
    incidentDate !== null &&
    location.trim() !== '' &&
    category !== '';
  const reporterFilled =
    isAnonymous ||
    (reporterName.trim() !== '' &&
      reporterEmail.trim() !== '' &&
      reporterPhone.trim() !== '' &&
      reporterStatusId.trim() !== '' &&
      reporterUnitKerja.trim() !== '');
  const isFormValid = baseMandatoryFilled && reporterFilled && declarationAccepted;

  const handleDownloadCredentials = (complaintNumber: string, complaintPassword: string) => {
    const text = `Nomor Pengaduan: ${complaintNumber}\nPassword Pengaduan: ${complaintPassword}\n\nSimpan informasi ini untuk melacak status pengaduan Anda.`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pengaduan-${complaintNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper sx={{ maxWidth: 900, width: '100%', p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Kirim Pengaduan
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Anda dapat mengirim secara anonim atau mengisi data diri agar kami dapat menindaklanjuti.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Nomor Pengaduan dan Password Pengaduan akan ditampilkan setelah pengaduan selesai dikirimkan.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sudah punya nomor pengaduan?{' '}
            <Link component={RouterLink} to="/lacak-pengaduan" underline="hover">
              Lacak status pengaduan
            </Link>
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Tipe pengiriman</FormLabel>
              <RadioGroup
                row
                value={isAnonymous ? 'anonymous' : 'identified'}
                onChange={(event) =>
                  setIsAnonymous(event.target.value === 'anonymous')
                }
              >
                <FormControlLabel
                  value="anonymous"
                  control={<Radio />}
                  label="Anonim"
                />
                <FormControlLabel
                  value="identified"
                  control={<Radio />}
                  label="Tidak anonim"
                />
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!isAnonymous && (
                <>
                  <TextField
                    label="Nama Anda"
                    fullWidth
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                  />
                  <TextField
                    select
                    label="Status Pelapor"
                    fullWidth
                    required
                    value={reporterStatusId}
                    onChange={(e) => setReporterStatusId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Pilih status pelapor</em>
                    </MenuItem>
                    {reporterStatuses.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Unit Kerja"
                    fullWidth
                    required
                    value={reporterUnitKerja}
                    onChange={(e) => setReporterUnitKerja(e.target.value)}
                    placeholder="Nama unit atau departemen"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                  />
                  <TextField
                    label="Telepon"
                    fullWidth
                    required
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                  />
                </>
              )}

              <TextField
                label="Judul"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <TextField
                label="Deskripsi pengaduan dan kronologi kejadian"
                fullWidth
                required
                multiline
                minRows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <DatePicker
                label="Tanggal kejadian"
                value={incidentDate}
                onChange={(value) => setIncidentDate(value)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />

              <TextField
                label="Lokasi"
                fullWidth
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <TextField
                select
                label="Kategori"
                fullWidth
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">
                  <em>Pilih kategori</em>
                </MenuItem>
                {categoryOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Lampiran (opsional) — hanya JPG, PNG, atau PDF
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_FILE_TYPES}
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="complaint-file-input"
                />
                <label htmlFor="complaint-file-input">
                  <Button variant="outlined" component="span">
                    Pilih file
                  </Button>
                </label>
                {fileError && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {fileError}
                  </Typography>
                )}
                {files.length > 0 && (
                  <List dense sx={{ mt: 1 }}>
                    {files.map((file, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="Hapus"
                            onClick={() => removeFile(index)}
                          >
                            <DeleteOutline />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mt: 3 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Dialog open={!!successInfo} onClose={() => setSuccessInfo(null)} maxWidth="sm" fullWidth>
              <DialogTitle>Pengaduan berhasil dikirim</DialogTitle>
              <DialogContent>
                {successInfo && (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Nomor Pengaduan:</strong> {successInfo.complaintNumber}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Password Pengaduan:</strong> {successInfo.complaintPassword}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Simpan informasi ini untuk melacak status pengaduan Anda.
                    </Typography>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() =>
                        handleDownloadCredentials(successInfo.complaintNumber, successInfo.complaintPassword)
                      }
                      sx={{ cursor: 'pointer' }}
                    >
                      Unduh Nomor dan Password Pengaduan
                    </Link>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button type="button" onClick={() => setSuccessInfo(null)} variant="contained" autoFocus>
                  Tutup
                </Button>
              </DialogActions>
            </Dialog>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    Saya menyatakan bahwa informasi yang saya sampaikan adalah benar sesuai dengan
                    pengetahuan saya.
                  </Typography>
                }
                sx={{ alignItems: 'center', ml: 0, mb: 2, gap: 1 }}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isFormValid || submitting}
                >
                  {submitting ? 'Mengirim…' : 'Kirim pengaduan'}
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Rumah sakit menjamin kerahasiaan identitas pelapor serta memberikan perlindungan terhadap
                segala bentuk intimidasi atau pembalasan kepada pelapor yang menyampaikan laporan dengan
                itikad baik.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default Complaint;

