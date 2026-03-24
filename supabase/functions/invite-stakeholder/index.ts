/**
 * Deploy: supabase functions deploy invite-stakeholder --no-verify-jwt
 * Set secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto in hosted Supabase)
 * INVITE_REDIRECT_URL — full URL for SPA invite landing (e.g. https://app.example.com/auth/complete-invite)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing or invalid Authorization' }, 401);
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: authErr,
  } = await supabaseAdmin.auth.getUser(token);

  if (authErr || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const role = user.app_metadata && (user.app_metadata as Record<string, unknown>)['role'];
  if (role !== 'admin') {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const email = String(body['email'] ?? '')
    .trim()
    .toLowerCase();
  const nama = String(body['nama'] ?? '').trim();
  const jabatan = String(body['jabatan'] ?? '').trim();
  const catatan =
    body['catatan'] != null && String(body['catatan']).trim() !== ''
      ? String(body['catatan']).trim()
      : null;

  if (!email || !nama || !jabatan) {
    return jsonResponse({ error: 'Nama, email, dan jabatan wajib diisi.' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Format email tidak valid.' }, 400);
  }

  const redirectTo = Deno.env.get('INVITE_REDIRECT_URL')?.trim() || undefined;

  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      ...(redirectTo ? { redirectTo } : {}),
      data: {
        full_name: nama,
        jabatan,
        invitation_catatan: catatan,
      },
    },
  );

  if (inviteError) {
    return jsonResponse(
      { error: inviteError.message || 'Gagal mengirim undangan email.' },
      400,
    );
  }

  const { error: insertError } = await supabaseAdmin.from('stakeholder_invitations').insert({
    email,
    nama,
    jabatan,
    catatan,
    invited_by: user.id,
    status: 'sent',
  });

  if (insertError) {
    console.error('stakeholder_invitations insert:', insertError);
    return jsonResponse(
      {
        error: 'Undangan terkirim, tetapi pencatatan undangan gagal. Periksa log server.',
        detail: insertError.message,
      },
      500,
    );
  }

  return jsonResponse({
    ok: true,
    userId: inviteData?.user?.id ?? null,
  });
});
