import { NextRequest, NextResponse } from 'next/server';
import sanityClient from '@/libs/sanity';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const email = request.nextUrl.searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ error: 'Missing token or email' }, { status: 400 });
    }

    const tokenDoc = await sanityClient.fetch(
      `*[_type == "verification-token" && identifier == $email && token == $token][0]`,
      { email, token } as any
    );

    if (!tokenDoc || !tokenDoc.expires) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
    }

    if (new Date(tokenDoc.expires).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 });
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (!user || !user._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await sanityClient.patch(user._id).set({ emailVerified: new Date().toISOString() }).commit();

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
