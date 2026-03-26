-- Public documentation bucket for downloadable guides (PDFs).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentation',
  'documentation',
  true,
  52428800,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read documentation objects" on storage.objects;
create policy "Public read documentation objects"
on storage.objects for select
to public
using (bucket_id = 'documentation');
