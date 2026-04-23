const RESEND_API = 'https://api.resend.com/emails';

export async function sendResetEmail(to: string, token: string) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl.replace(/\/$/, '')}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;

  const body = {
    from,
    to,
    subject: 'Password reset instructions',
    html: `<p>We received a request to reset your password. Click the link below to reset it:</p>
           <p><a href="${resetUrl}">Reset password</a></p>
           <p>If you didn't request this, you can ignore this email.</p>`,
  };

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to send email: ${res.status} ${text}`);
  }
}

export default sendResetEmail;
