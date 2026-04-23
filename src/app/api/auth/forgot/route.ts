import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sendResetEmail from '@/libs/email';
import sanityClient from '@/libs/sanity';

const COOLDOWN_SECONDS = 180; // 3 minutes

async function createTokenForEmail(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await sanityClient.create({
    _type: 'verification-token',
    identifier: email,
    token,
    expires,
  });

  try {
    await sendResetEmail(email, token);
  } catch (err) {
    console.error('Failed to send reset email:', err);
    // do not fail the request — we still return generic response
  }

  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Lookup latest token for this identifier
    const lastToken = await sanityClient.fetch(
      `*[_type == "verification-token" && identifier == $email] | order(_createdAt desc)[0]`,
      { email }
    );

    if (lastToken && lastToken._createdAt) {
      const created = new Date(lastToken._createdAt).getTime();
      const now = Date.now();
      const diff = now - created;
      if (diff < COOLDOWN_SECONDS * 1000) {
        const remaining = Math.ceil((COOLDOWN_SECONDS * 1000 - diff) / 1000);
        return NextResponse.json({ message: 'If an account exists, reset instructions have been sent.', cooldown: remaining }, { status: 200 });
      }
    }

    // Lookup user — but don't reveal existence to the client
    const user = await sanityClient.fetch(`*[_type == "user" && email == $email][0]`, { email });

    if (user) {
      await createTokenForEmail(email);
    }

    return NextResponse.json({ message: 'If an account exists, reset instructions have been sent.', cooldown: COOLDOWN_SECONDS }, { status: 200 });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
