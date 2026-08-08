import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sanityClient from '@/libs/sanity';
import { sendVerificationEmail } from '@/libs/email';

const COOLDOWN_SECONDS = 180;

async function createVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await sanityClient.create({
    _type: 'verification-token',
    identifier: email,
    token,
    expires,
  });

  await sendVerificationEmail(email, token);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

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
        return NextResponse.json(
          { message: 'If an account exists, a confirmation email has been sent.', cooldown: remaining },
          { status: 200 }
        );
      }
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (user && !user.emailVerified) {
      await createVerificationToken(email);
      return NextResponse.json(
        { message: 'Confirmation email sent. Please check your inbox.', cooldown: COOLDOWN_SECONDS },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'If an account exists and is not verified, a confirmation email has been sent.', cooldown: COOLDOWN_SECONDS },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
