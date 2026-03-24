-- Admin-only RPC: invitations joined to auth.users for verification (email_confirmed_at).

CREATE OR REPLACE FUNCTION public.get_stakeholder_overview()
RETURNS TABLE (
  invitation_id uuid,
  email text,
  nama text,
  jabatan text,
  catatan text,
  invited_at timestamptz,
  invitation_status text,
  user_id uuid,
  email_confirmed_at timestamptz,
  is_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.email,
    i.nama,
    i.jabatan,
    i.catatan,
    i.created_at,
    i.status,
    u.id,
    u.email_confirmed_at,
    (u.id IS NOT NULL AND u.email_confirmed_at IS NOT NULL) AS is_verified
  FROM public.stakeholder_invitations i
  LEFT JOIN auth.users u ON lower(u.email) = lower(i.email)
  ORDER BY i.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_stakeholder_overview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_stakeholder_overview() TO authenticated;
