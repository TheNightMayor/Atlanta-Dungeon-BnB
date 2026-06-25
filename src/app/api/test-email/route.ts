import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const to = url.searchParams.get('to') || process.env.TEST_EMAIL_TO;

    if (!to) {
      return new NextResponse('Missing `to` query parameter or TEST_EMAIL_TO env var', { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return new NextResponse('RESEND_API_KEY is not set', { status: 500 });
    }

    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'Test email from Atlanta Dungeon BnB',
        html: '<p>This is a test email to verify Resend is working correctly.</p>',
      }),
    });

    const bodyText = await res.text().catch(() => '');

    if (!res.ok) {
      console.error('[test-email] Resend error:', res.status, bodyText);
      return new NextResponse(`Resend error ${res.status}: ${bodyText}`, { status: 500 });
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(bodyText || '{}');
    } catch (e) {
      parsed = bodyText;
    }

    console.log('[test-email] Sent successfully to', to);
    return NextResponse.json({ ok: true, to, from, resend: parsed });
  } catch (err) {
    console.error('[test-email] Unexpected error', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
