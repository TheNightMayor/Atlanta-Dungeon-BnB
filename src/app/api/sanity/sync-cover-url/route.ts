import sanityClient from '@/libs/sanity';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, slug } = body || {};

    if (!id && !slug) {
      return NextResponse.json({ error: 'Provide `id` or `slug` in request body' }, { status: 400 });
    }

    const query = slug
      ? `*[_type == "hotelRoom" && slug.current == $slug][0]{_id, coverImage{image{asset-> { _id, url }}, url}}`
      : `*[_type == "hotelRoom" && _id == $id][0]{_id, coverImage{image{asset-> { _id, url }}, url}}`;

    const params = slug ? { slug } : { id };
    const doc = await sanityClient.fetch(query, params);

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const assetUrl = doc?.coverImage?.image?.asset?.url || null;

    if (!assetUrl) {
      return NextResponse.json({ error: 'No image asset URL found on document' }, { status: 422 });
    }

    await sanityClient.patch(doc._id).set({ 'coverImage.url': assetUrl }).commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ ok: true, id: doc._id, coverImageUrl: assetUrl });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
