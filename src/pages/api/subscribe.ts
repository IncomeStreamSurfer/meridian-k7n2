import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../lib/supabase';
import { sendEmail, waitlistWelcomeHTML } from '../../lib/email';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let email = '';
  let source = 'site';
  let referrer = '';

  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      email = (body?.email || '').toString().trim().toLowerCase();
      source = (body?.source || 'site').toString();
    } else {
      const form = await request.formData();
      email = (form.get('email') || '').toString().trim().toLowerCase();
      source = (form.get('source') || 'site').toString();
    }
    referrer = request.headers.get('referer') || '';
  } catch (err) {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 255) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('meridian_waitlist')
      .insert({ email, source, referrer });

    if (error) {
      // Duplicate email — treat as success so we always route to /thanks.
      if ((error.code === '23505') || /duplicate key/i.test(error.message)) {
        return json({ ok: true, duplicate: true });
      }
      console.error('[subscribe] supabase error', error);
      return json({ error: 'We could not save your email. Please try again shortly.' }, 500);
    }

    // Fire-and-forget welcome email. Don't block the response on it.
    sendEmail({
      to: email,
      subject: "You're on the Meridian waitlist",
      html: waitlistWelcomeHTML(email),
    }).catch((err) => console.error('[subscribe] email send failed', err));

    return json({ ok: true });
  } catch (err: unknown) {
    console.error('[subscribe] unexpected', err);
    return json({ error: 'Something went wrong on our end. Please try again.' }, 500);
  }
};

export const GET: APIRoute = () =>
  json({ error: 'Method not allowed. Use POST with { email }.' }, 405);
