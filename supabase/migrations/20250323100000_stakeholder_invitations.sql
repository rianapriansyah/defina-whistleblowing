-- Audit log of stakeholder invites (actual email is sent via Edge Function + Auth Admin API).

CREATE TABLE IF NOT EXISTS public.stakeholder_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nama text NOT NULL,
  jabatan text NOT NULL,
  catatan text,
  invited_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stakeholder_invitations_email_idx ON public.stakeholder_invitations (lower(email));
CREATE INDEX IF NOT EXISTS stakeholder_invitations_created_at_idx ON public.stakeholder_invitations (created_at DESC);

ALTER TABLE public.stakeholder_invitations ENABLE ROW LEVEL SECURITY;

-- Admins (JWT app_metadata.role = admin) can read invitation history from the app.
CREATE POLICY stakeholder_invitations_admin_select
  ON public.stakeholder_invitations
  FOR SELECT
  TO authenticated
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- Inserts are performed by Edge Function using the service role (bypasses RLS).
