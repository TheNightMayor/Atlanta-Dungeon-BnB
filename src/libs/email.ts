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

export async function sendBookingConfirmationEmail(
  to: string,
  roomName: string,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  userName: string | undefined
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'Your booking is confirmed',
    html: `<p>Hi ${userName ?? 'Guest'},</p>
           <p>Your booking for <strong>${roomName}</strong> has been approved and confirmed.</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
           <p>We look forward to welcoming you.</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/users">View your bookings</a></p>`,
  });
}

export async function sendBookingApprovedEmail(
  to: string,
  roomName: string,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  userName: string | undefined
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'Booking approved successfully!',
    html: `<p>Hi ${userName ?? 'Guest'},</p>
           <p>Great news! Your booking for <strong>${roomName}</strong> has been approved successfully.</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
           <p>Thanks for booking with us. We look forward to seeing you soon.</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/users">View your bookings</a></p>`,
  });
}

export async function sendBookingPendingEmail(
  to: string,
  roomName: string,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  userName: string | undefined
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'Booking pending approval',
    html: `<p>Hi ${userName ?? 'Guest'},</p>
           <p>Your booking request for <strong>${roomName}</strong> has been received.</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
           <p>We will notify you when an admin approves your booking.</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/users">View your bookings</a></p>`,
  });
}

export async function sendPaymentConfirmationEmail(
  to: string,
  roomName: string,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  userName: string | undefined
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'Payment received successfully',
    html: `<p>Hi ${userName ?? 'Guest'},</p>
           <p>We received your payment for <strong>${roomName}</strong>.</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Total paid:</strong> $${totalPrice.toFixed(2)}</p>
           <p>Your booking is now pending approval and you will receive another email once approved.</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/users">View your bookings</a></p>`,
  });
}

export async function sendBookingApprovalRequestEmail(
  to: string,
  roomName: string,
  userName: string | undefined,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  customerEmail: string
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'New booking waiting for approval',
    html: `<p>Admin,</p>
           <p>A new booking request has been received for <strong>${roomName}</strong>.</p>
           <p><strong>Guest:</strong> ${userName ?? 'Guest'}</p>
           <p><strong>Email:</strong> ${customerEmail}</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/studio">Review in Sanity Studio</a></p>`,
  });
}

export async function sendBookingRejectionEmail(
  to: string,
  roomName: string,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  userName: string | undefined
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'Booking request declined',
    html: `<p>Hi ${userName ?? 'Guest'},</p>
           <p>Unfortunately your booking request for <strong>${roomName}</strong> has been declined.</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
           <p>If you have questions, please contact us.</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/contact">Contact us</a></p>`,
  });
}

export async function sendBookingCancellationEmail(
  to: string,
  roomName: string,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  userName: string | undefined
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'Booking cancelled',
    html: `<p>Hi ${userName ?? 'Guest'},</p>
           <p>Your booking for <strong>${roomName}</strong> has been cancelled.</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
           <p>If you have questions, please contact us.</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/contact">Contact us</a></p>`,
  });
}

export async function sendBookingRefundEmail(
  to: string,
  roomName: string,
  checkinDate: string,
  checkoutDate: string,
  totalPrice: number,
  userName: string | undefined
) {
  const from = process.env.RESEND_FROM || 'no-reply@example.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await sendResendRequest({
    from,
    to,
    subject: 'Your refund has been processed',
    html: `<p>Hi ${userName ?? 'Guest'},</p>
           <p>We have processed a refund for your booking for <strong>${roomName}</strong>.</p>
           <p><strong>Check-in:</strong> ${checkinDate}</p>
           <p><strong>Check-out:</strong> ${checkoutDate}</p>
           <p><strong>Amount refunded:</strong> $${totalPrice.toFixed(2)}</p>
           <p>If you have questions, please contact us.</p>
           <p><a href="${appUrl.replace(/\/$/, '')}/contact">Contact us</a></p>`,
  });
}

export default sendResetEmail;
