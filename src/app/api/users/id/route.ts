import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/libs/auth';
import sanityClient from '@/libs/sanity';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Authentication Required', { status: 401 });
  }

  const userId = (session.user as any).id ?? session.user.name;
  const formData = await req.formData();
  const imageFile = formData.get('idDocument');

  if (!imageFile || typeof (imageFile as any).arrayBuffer !== 'function') {
    return new NextResponse('ID document file is required', { status: 400 });
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
        idDocument: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
      })
      .commit();

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('ID document upload error:', error);
    return new NextResponse('Unable to save ID document', { status: 500 });
  }
}
