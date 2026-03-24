-- Lookup table for reporter role (status pelapor).
CREATE TABLE IF NOT EXISTS public.reporter_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  sequence int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.reporter_statuses (code, name, sequence) VALUES
  ('pegawai_rs', 'Pegawai RS', 1),
  ('dokter', 'Dokter', 2),
  ('perawat', 'Perawat', 3),
  ('pasien_keluarga', 'Pasien / Keluarga Pasien', 4),
  ('vendor_mitra', 'Vendor / Mitra', 5)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.complaints
  DROP COLUMN IF EXISTS reporter_user_id;

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS reporter_status_id uuid REFERENCES public.reporter_statuses (id) ON DELETE SET NULL;

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS reporter_unit_kerja text;

CREATE INDEX IF NOT EXISTS complaints_reporter_status_id_idx ON public.complaints (reporter_status_id);
