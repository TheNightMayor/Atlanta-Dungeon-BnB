const RESEND_API = 'https://api.resend.com/emails';

function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[email] RESEND_API_KEY is present, prefix:', apiKey.slice(0, 8));
  }

  return apiKey;
}

async function sendResendRequest(body: Record<string, unknown>) {
  const apiKey = getResendApiKey();
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text().catch(() => '');
  if (process.env.NODE_ENV !== 'production') {
    console.log('[email] Resend response status:', res.status, 'statusText:', res.statusText);
    console.log('[email] Resend response body:', responseText);
  }

  if (!res.ok) {
    throw new Error(`Failed to send email: ${res.status} ${responseText}`);
  }
}

export async function sendResetEmail(to: string, token: string) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl.replace(/\/$/, '')}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;

  await sendResendRequest({
    from,
    to,
    subject: 'Password reset instructions',
    html: `<p>We received a request to reset your password. Click the link below to reset it:</p>
           <p><a href="${resetUrl}">Reset password</a></p>
           <p>If you didn't request this, you can ignore this email.</p>`,
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl.replace(/\/$/, '')}/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;

  await sendResendRequest({
    from,
    to,
    subject: 'Confirm your email',
    html: `<p>Welcome! Please confirm your account by clicking the link below:</p>
           <p><a href="${verificationUrl}">Confirm your email</a></p>
           <p>If you didn't create an account, you can ignore this message.</p>`,
  });
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

  await sendResendRequest({
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
  });
}

export default sendResetEmail;
