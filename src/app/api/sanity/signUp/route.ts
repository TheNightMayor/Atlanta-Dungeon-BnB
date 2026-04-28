import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import sanityClient from '@/libs/sanity';
import { sendVerificationEmail } from '@/libs/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sanityClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Sanity
    const user = await sanityClient.create({
      _type: 'user',
      email,
      name,
      password: hashedPassword, // In a real app, you'd store this securely
      emailVerified: null,
      // Note: Storing passwords in Sanity is not recommended for production
      // Consider using a proper user management system
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await sanityClient.create({
      _type: 'verification-token',
      identifier: email,
      token,
      expires,
    });

    try {
      await sendVerificationEmail(email, token);
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    return NextResponse.json(
      {
        message: 'Account created successfully. Check your email to confirm your account.',
        needsConfirmation: true,
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}