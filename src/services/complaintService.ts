import supabase from '../utils/supabase';
import type { Complaint, ComplaintInsertPayload } from '../types/complaint';
import { generateComplaintNumber, generateComplaintPassword } from '../generators/complaintGenerators';
import { hashPassword } from '../helpers/crypto';
import { isAllowedFile } from '../helpers/fileValidation';

const COMPLAINT_ATTACHMENTS_BUCKET =
  import.meta.env.VITE_SUPABASE_COMPLAINT_BUCKET ?? 'complaint-attachments';

export interface SearchComplaintsParams {
  /** Search in complaint_number, title, description, location (case-insensitive). */
  keyword?: string;
  /** Filter by incident date (ISO date string, match on that day). */
  incidentDate?: string;
  category?: string;
  severity?: string;
  /** NIP / reporter_user_id. */
  nip?: string;
}

export async function get_all_complaints() {
  const { data, error } = await supabase.from('complaints').select('*');
  if (error) throw new Error(error.message);
  return data as Complaint[];
}

function matchesKeyword(row: Complaint, keyword: string): boolean {
  const k = keyword.toLowerCase();
  const fields = [
    row.complaint_number ?? '',
    row.title ?? '',
    row.description ?? '',
    row.location ?? '',
  ];
  return fields.some((f) => f.toLowerCase().includes(k));
}

export async function searchComplaints(params: SearchComplaintsParams): Promise<Complaint[]> {
  let query = supabase
    .from('complaints')
    .select('*')
    .eq('is_deleted', false);

  const { keyword, incidentDate, category, severity, nip } = params;

  if (category && category.trim()) {
    query = query.eq('category', category.trim());
  }
  if (severity && severity.trim()) {
    query = query.eq('severity', severity.trim().toLowerCase());
  }
  if (nip && nip.trim()) {
    query = query.eq('reporter_user_id', nip.trim());
  }
  if (incidentDate && incidentDate.trim()) {
    const date = incidentDate.trim();
    query = query.gte('incident_date', date).lte('incident_date', `${date}T23:59:59.999Z`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  let list = (data ?? []) as Complaint[];
  if (keyword && keyword.trim()) {
    list = list.filter((row) => matchesKeyword(row, keyword.trim()));
  }
  return list;
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
    reporter_user_id: payload.isAnonymous ? null : payload.reporterNip?.trim() || null,
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
