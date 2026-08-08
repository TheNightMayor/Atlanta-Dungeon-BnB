import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/libs/auth';
import { getSessionUserId } from '@/libs/session';
import sanityClient from '@/libs/sanity';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  if (!userId) {
    return new NextResponse('Authentication Required', { status: 401 });
  }
  const formData = await req.formData();
  const imageFile = formData.get('image');

  if (!imageFile || typeof (imageFile as any).arrayBuffer !== 'function') {
    return new NextResponse('Image file is required', { status: 400 });
  }

  const file = imageFile as any;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type || 'image/jpeg',
    });

    if (!asset?._id) {
      throw new Error('Failed to upload asset');
    }

    const updatedUser = await sanityClient.patch(userId)
      .set({
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
      })
      .commit();

    // Create a wrapper document to mark this as a user-uploaded image (private by default)
    try {
      await sanityClient.create({
        _type: 'userImage',
        asset: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
        owner: { _type: 'reference', _ref: userId },
        visibility: 'private',
        note: 'Profile image upload via web',
      });
    } catch (err) {
      console.warn('Failed to create userImage wrapper doc:', err);
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Profile image upload error:', error);
    return new NextResponse('Unable to save profile image', { status: 500 });
  }
}
