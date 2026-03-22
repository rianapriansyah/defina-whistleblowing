export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical';

/** From reporter_statuses table (maps to complaints.reporter_status_id). */
export interface ReporterStatus {
  id: string;
  code: string;
  name: string;
  sequence: number | null;
  created_at: string | null;
}

export interface ComplaintInsertPayload {
  isAnonymous: boolean;
  title: string;
  description: string;
  incidentDate?: string;
  location?: string;
  category?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  /** FK to reporter_statuses when non-anonymous. */
  reporterStatusId?: string;
  reporterUnitKerja?: string;
  /** Files to upload (jpg, png, pdf only). */
  files?: File[];
}

export interface Complaint {
  id: string;
  complaint_number: string;
  complaint_password_hash: string;
  is_anonymous: boolean;
  reporter_status_id: string | null;
  reporter_unit_kerja: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  /** Populated when selecting with reporter_statuses join. */
  reporter_statuses?: { code: string; name: string } | null;
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

export interface ComplaintAuditLog {
  id: string;
  complaint_id: string | null;
  action: string | null;
  description: string | null;
  performed_by: string | null;
  assigned_to: string | null;
  created_at: string | null;
}

/** From complaint_statuses table (code used in complaints.status). */
export interface ComplaintStatus {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_final: boolean | null;
  sequence: number | null;
  created_at: string | null;
}

/** From profiles table; user_id links to auth. */
export interface Profile {
  id: number;
  user_id: string;
  role: string | null;
  created_at: string | null;
}

