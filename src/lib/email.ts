const RESEND_API = 'https://api.resend.com/emails';

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'Meridian <onboarding@resend.dev>',
}: SendEmailArgs) {
  const key = import.meta.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to);
    return { skipped: true };
  }
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[email] Resend error', res.status, body);
    return { ok: false, status: res.status };
  }
  return { ok: true };
}

export function waitlistWelcomeHTML(email: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#1A1410;font-family:Inter,Segoe UI,sans-serif;color:#F5EFE6">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A1410;padding:48px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#221A14;border-radius:16px;overflow:hidden">
            <tr>
              <td style="padding:40px 40px 16px 40px">
                <div style="font-family:Georgia,serif;font-size:32px;letter-spacing:-0.5px">Meridian</div>
                <div style="height:2px;width:40px;background:#B8722E;margin:16px 0 24px"></div>
                <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;font-weight:500;margin:0 0 16px;color:#F5EFE6">
                  You're on the list.
                </h1>
                <p style="font-size:15px;line-height:1.7;color:#F5EFE6cc;margin:0 0 16px">
                  Welcome to the quiet side of the waitlist — where the first crack, farm stories, and launch-day allocations arrive before anything else.
                </p>
                <p style="font-size:15px;line-height:1.7;color:#F5EFE6cc;margin:0 0 24px">
                  We confirmed <strong style="color:#B8722E">${email}</strong>. Nothing to do now — we'll reach out soon with a closer look at what we're roasting.
                </p>
                <p style="font-size:13px;line-height:1.6;color:#F5EFE699;font-style:italic;margin:0 0 8px">
                  "The best cup of your day deserves care at every step."
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 40px;border-top:1px solid #F5EFE615">
                <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F5EFE677;margin:0">
                  Meridian Coffee · Where every cup finds its moment
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
