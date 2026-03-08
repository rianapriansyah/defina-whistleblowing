import supabase from '../utils/supabase';
import type { Complaint, ComplaintInsertPayload } from '../types/complaint';

const COMPLAINT_ATTACHMENTS_BUCKET = import.meta.env.VITE_SUPABASE_COMPLAINT_BUCKET ?? 'complaint-attachments';
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export function isAllowedFile(file: File): boolean {
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
  return ALLOWED_FILE_TYPES.includes(file.type) && ALLOWED_EXTENSIONS.includes(ext);
}

export async function get_all_complaints() {
  const { data, error } = await supabase.from('complaints').select('*');
  if (error) throw new Error(error.message);
  return data as Complaint[];
}

export async function get_complaint_by_complaint_number(complaint_number: string) {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('complaint_number', complaint_number)
    .single();
  if (error) throw new Error(error.message);
  return data as Complaint;
}

function generateComplaintNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1_000_0)
    .toString(36)
    .toUpperCase()
    .padStart(3, '0');
  return `CMP-${timestamp}-${random}`;
}

function generateComplaintPassword() {
  return Math.random().toString(36).slice(-10);
}

async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Fetch complaint by number and verify password; throws if not found or password invalid. */
export async function getComplaintByNumberAndPassword(
  complaintNumber: string,
  password: string
): Promise<Complaint> {
  let complaint: Complaint;
  try {
    complaint = await get_complaint_by_complaint_number(complaintNumber.trim());
  } catch {
    throw new Error('Nomor pengaduan atau password salah.');
  }
  const hash = await hashPassword(password);
  if (complaint.complaint_password_hash !== hash) {
    throw new Error('Nomor pengaduan atau password salah.');
  }
  return complaint;
}

export async function createComplaint(payload: ComplaintInsertPayload) {
  const complaintNumber = generateComplaintNumber();
  const complaintPassword = generateComplaintPassword();
  const complaintPasswordHash = await hashPassword(complaintPassword);

  const insert = {
    complaint_number: complaintNumber,
    complaint_password_hash: complaintPasswordHash,
    is_anonymous: payload.isAnonymous,
    reporter_name: payload.isAnonymous ? null : payload.reporterName || null,
    reporter_email: payload.isAnonymous ? null : payload.reporterEmail || null,
    reporter_phone: payload.isAnonymous ? null : payload.reporterPhone || null,
    title: payload.title,
    description: payload.description,
    incident_date: payload.incidentDate || null,
    location: payload.location || null,
    category: payload.category || null,
    severity: payload.severity || null,
    status: 'submitted',
    reporter_user_id: null,
    assigned_to: null,
    resolution: null,
    resolved_at: null,
    is_deleted: false,
  };

  const { data, error } = await supabase
    .from('complaints')
    .insert(insert)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const complaint = data as Complaint;
  const files = payload.files?.filter(isAllowedFile) ?? [];

  for (const file of files) {
    const path = `${complaint.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(COMPLAINT_ATTACHMENTS_BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) {
      throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(COMPLAINT_ATTACHMENTS_BUCKET)
      .getPublicUrl(path);

    await supabase.from('complaint_attachments').insert({
      complaint_id: complaint.id,
      file_url: urlData.publicUrl,
      file_name: file.name,
      uploaded_by: null,
    });
  }

  return {
    complaint,
    complaintNumber,
    complaintPassword,
  };
}
