import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_STUDIO_TOKEN,
});

export async function GET() {
  try {
    const items = await serverClient.fetch(`*[_type == "blockedDate"]{_id, date}`);
    return NextResponse.json(items || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
