-- One-object policy: allow upsert of the official user guide PDF only (bucket documentation).
-- Mitigate abuse by scoping to exact object name; orgs may remove these policies after seeding.
drop policy if exists "documentation panduan insert" on storage.objects;
create policy "documentation panduan insert"
on storage.objects for insert
to public
with check (
  bucket_id = 'documentation'
  and name = 'panduan-penggunaan-defina-whistleblowing.pdf'
);

drop policy if exists "documentation panduan update" on storage.objects;
create policy "documentation panduan update"
on storage.objects for update
to public
using (
  bucket_id = 'documentation'
  and name = 'panduan-penggunaan-defina-whistleblowing.pdf'
)
with check (
  bucket_id = 'documentation'
  and name = 'panduan-penggunaan-defina-whistleblowing.pdf'
);
