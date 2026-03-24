export interface StakeholderInvitation {
  id: string;
  email: string;
  nama: string;
  jabatan: string;
  catatan: string | null;
  invited_by: string;
  status: string;
  created_at: string;
}

/** Row from RPC `get_verified_stakeholders_for_assignment` (admin only). */
export interface VerifiedStakeholderAssignee {
  user_id: string;
  email: string;
  display_name: string;
  jabatan: string;
}

/** Row from RPC `get_stakeholder_overview` (admin only). */
export interface StakeholderOverviewRow {
  invitation_id: string;
  email: string;
  nama: string;
  jabatan: string;
  catatan: string | null;
  invited_at: string;
  invitation_status: string;
  user_id: string | null;
  email_confirmed_at: string | null;
  is_verified: boolean;
}
