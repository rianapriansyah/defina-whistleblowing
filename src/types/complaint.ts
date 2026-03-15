export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ComplaintInsertPayload {
  isAnonymous: boolean;
  title: string;
  description: string;
  incidentDate?: string;
  location?: string;
  category?: string;
  severity?: ComplaintSeverity;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  /** Nomor Induk Pegawai (stored in reporter_user_id when non-anonymous). */
  reporterNip?: string;
  /** Files to upload (jpg, png, pdf only). */
  files?: File[];
}

export interface Complaint {
  id: string;
  complaint_number: string;
  complaint_password_hash: string;
  is_anonymous: boolean;
  reporter_user_id: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  title: string;
  description: string;
  incident_date: string | null;
  location: string | null;
  category: string | null;
  severity: string | null;
  status: string;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string | null;
  updated_at: string | null;
  resolved_at: string | null;
  is_deleted: boolean | null;
}

