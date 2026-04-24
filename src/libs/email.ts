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

export async function sendContactNotificationEmail(
  name: string,
  fromEmail: string,
  topic: string,
  text: string
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_FROM || 'admin@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const body = {
    from,
    to,
    subject: `New contact message: ${topic}`,
    html: `<p>You have a new message from the contact form.</p>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${fromEmail}</p>
           <p><strong>Topic:</strong> ${topic}</p>
           <p><strong>Message:</strong></p>
           <p>${text.replace(/\n/g, '<br/>')}</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/studio">Open Sanity Studio</a></p>`,
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
    throw new Error(`Failed to send notification email: ${res.status} ${text}`);
  }
}

export default sendResetEmail;
