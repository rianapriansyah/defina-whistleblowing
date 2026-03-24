import supabase from '../utils/supabase';
import type {
  StakeholderInvitation,
  StakeholderOverviewRow,
  VerifiedStakeholderAssignee,
} from '../types/stakeholderInvitation';

function getSupabaseAnonKey(): string {
  const k =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!k?.trim()) {
    throw new Error('Konfigurasi Supabase tidak lengkap.');
  }
  return k.trim();
}

export interface InviteStakeholderInput {
  nama: string;
  email: string;
  jabatan: string;
  catatan?: string;
}

export async function inviteStakeholder(input: InviteStakeholderInput): Promise<void> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error('VITE_SUPABASE_URL tidak diset.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sesi habis. Silakan masuk kembali.');
  }

  const res = await fetch(`${baseUrl}/functions/v1/invite-stakeholder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: getSupabaseAnonKey(),
    },
    body: JSON.stringify({
      nama: input.nama.trim(),
      email: input.email.trim(),
      jabatan: input.jabatan.trim(),
      catatan: input.catatan?.trim() || undefined,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { error?: string; detail?: string; ok?: boolean };
  if (!res.ok) {
    throw new Error(json.error || json.detail || `Gagal mengirim undangan (${res.status}).`);
  }
}

export async function listStakeholderInvitations(limit = 25): Promise<StakeholderInvitation[]> {
  const { data, error } = await supabase
    .from('stakeholder_invitations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as StakeholderInvitation[];
}

export async function getStakeholderOverview(): Promise<StakeholderOverviewRow[]> {
  const { data, error } = await supabase.rpc('get_stakeholder_overview');
  if (error) throw new Error(error.message);
  return (data ?? []) as StakeholderOverviewRow[];
}

export async function getVerifiedStakeholdersForAssignment(): Promise<VerifiedStakeholderAssignee[]> {
  const { data, error } = await supabase.rpc('get_verified_stakeholders_for_assignment');
  if (error) throw new Error(error.message);
  return (data ?? []) as VerifiedStakeholderAssignee[];
}
