const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ija74i93',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_STUDIO_TOKEN, // required for patching
  useCdn: false,
});

async function syncAll() {
  const docs = await client.fetch(`*[_type == "hotelRoom"]{_id, slug, coverImage{image{asset-> { _id, url }}}}`);
  for (const d of docs) {
    const assetUrl = d?.coverImage?.image?.asset?.url;
    console.log(`${d._id} (${d.slug?.current ?? d.slug ?? 'no-slug'}) => ${assetUrl || 'NO_ASSET_URL'}`);
  }
  console.log('Done');
}

syncAll().catch(err => {
  console.error(err);
  process.exit(1);
});
