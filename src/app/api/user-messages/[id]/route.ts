import { NextRequest, NextResponse } from 'next/server';
import { createMessage } from '@/libs/apis';
import sanityClient from '@/libs/sanity';
import { groq } from 'next-sanity';

export async function POST(req: NextRequest, { params }: { params: any }) {
  try {
    // Support both Promise and plain object for params
    if (typeof params.then === 'function') params = await params;
    const body = await req.json();
    // params.id is the user's email
    const { topic, text, name, email } = body;
    if (!topic || !text || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Look up the user by email to get the Sanity _id
    const userQuery = groq`*[_type == 'user' && email == $email][0]{ _id }`;
    const user = await sanityClient.fetch(userQuery, { email: params.id });
    if (!user?._id) {
      return NextResponse.json({ error: 'User not found in Sanity' }, { status: 404 });
    }
    const result = await createMessage({
      topic,
      text,
      name,
      email,
      userId: user._id,
    });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
