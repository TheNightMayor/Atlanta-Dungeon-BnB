import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import sanityClient from '@/libs/sanity';

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find matching token
    const tokenDoc = await sanityClient.fetch(
      `*[_type == "verification-token" && identifier == $email && token == $token][0]`,
      { email, token } as any
    );

    if (!tokenDoc) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const expires = new Date(tokenDoc.expires).getTime();
    if (Date.now() > expires) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    // Hash new password
    const hashed = await bcrypt.hash(password, 12);

    // Update user password
    const user = await sanityClient.fetch(`*[_type == "user" && email == $email][0]`, { email });
    if (!user) {
      // Still return generic error
      return NextResponse.json({ error: 'Invalid token or user' }, { status: 400 });
    }

    await sanityClient.patch(user._id).set({ password: hashed }).commit();

    // Delete all tokens for this identifier (single-use)
    await sanityClient.delete({
      query: `*[_type == "verification-token" && identifier == $email]`,
      params: { email },
    }).catch(() => null);

    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
