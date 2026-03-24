import type { User } from '@supabase/supabase-js';

export function getUserAppRole(user: User | null | undefined): string | null {
  if (!user?.app_metadata) return null;
  const r = (user.app_metadata as Record<string, unknown>)['role'];
  return typeof r === 'string' ? r : null;
}

export function isAdminUser(user: User | null | undefined): boolean {
  return getUserAppRole(user) === 'admin';
}
