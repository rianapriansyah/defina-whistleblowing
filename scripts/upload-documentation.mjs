/**
 * Upload generated documentation PDF to Supabase Storage (bucket: documentation).
 * Requires SUPABASE_SERVICE_ROLE_KEY (never commit; set in env or .env.local).
 * Usage: node --env-file=.env.local scripts/upload-documentation.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PDF_PATH = resolve(__dirname, '../docs/panduan-penggunaan-defina-whistleblowing.pdf');
const BUCKET = 'documentation';
const OBJECT_KEY = 'panduan-penggunaan-defina-whistleblowing.pdf';

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = (
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  ''
).trim();

if (!url?.trim()) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_URL');
  process.exit(1);
}

const apiKey = serviceKey || anonKey;
if (!apiKey) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY (need one for uploads)',
  );
  process.exit(1);
}
if (!serviceKey && anonKey) {
  console.warn('Using anon key: only allowed for scoped panduan object in bucket documentation.');
}
if (!existsSync(PDF_PATH)) {
  console.error('PDF not found; run: python scripts/generate_panduan_pdf.py');
  process.exit(1);
}

const supabase = createClient(url.trim(), apiKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const bytes = readFileSync(PDF_PATH);
const { error } = await supabase.storage.from(BUCKET).upload(OBJECT_KEY, bytes, {
  contentType: 'application/pdf',
  upsert: true,
});

if (error) {
  console.error('Upload failed:', error.message);
  process.exit(1);
}

const publicUrl = `${url.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${OBJECT_KEY}`;
console.log('Uploaded OK:', publicUrl);
