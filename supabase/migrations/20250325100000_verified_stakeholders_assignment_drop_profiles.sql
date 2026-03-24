-- Assignment targets: users who were invited (stakeholder_invitations) and confirmed email in Auth.

CREATE OR REPLACE FUNCTION public.get_verified_stakeholders_for_assignment()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  jabatan text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (u.id)
    u.id,
    u.email::text,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      i.nama,
      split_part(u.email::text, '@', 1)
    )::text AS display_name,
    COALESCE(u.raw_user_meta_data->>'jabatan', i.jabatan, '')::text AS jabatan
  FROM auth.users u
  INNER JOIN public.stakeholder_invitations i ON lower(i.email) = lower(u.email::text)
  WHERE u.email_confirmed_at IS NOT NULL
  ORDER BY u.id, i.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_verified_stakeholders_for_assignment() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_verified_stakeholders_for_assignment() TO authenticated;

-- Legacy table replaced by stakeholder flow; assigned_to stores auth user ids directly.
DROP TABLE IF EXISTS public.profiles CASCADE;
