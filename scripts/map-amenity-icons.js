// scripts/map-amenity-icons.js
// Usage:
// SANITY_PROJECT_ID=yourId SANITY_DATASET=production SANITY_TOKEN=yourWriteToken node scripts/map-amenity-icons.js

const sanityClient = require('@sanity/client');
const AMENITY_ICON_MAP = require('../studio/inputs/amenityIconMap').default;

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

function mapAmenityToIcon(amenity, currentIcon) {
  if (currentIcon) return currentIcon; // keep existing explicit icon
  if (!amenity) return undefined;
  const key = String(amenity).toLowerCase().replace(/\s+/g, '');
  return AMENITY_ICON_MAP[key] || undefined;
}

async function run() {
  console.log('Fetching hotelRoom documents...');
  const docs = await client.fetch('*[_type == "hotelRoom"]{_id, offeredAmenities}');
  console.log(`Found ${docs.length} documents.`);
  for (const doc of docs) {
    const { _id, offeredAmenities } = doc;
    if (!offeredAmenities || !Array.isArray(offeredAmenities)) continue;
    let changed = false;
    const newAmenities = offeredAmenities.map(item => {
      const oldIcon = item.icon;
      const newIcon = mapAmenityToIcon(item.amenity, oldIcon);
      if (newIcon !== oldIcon) changed = true;
      return { ...item, icon: newIcon };
    });
    if (changed) {
      console.log(`Patching ${_id} — updating ${offeredAmenities.length} amenities`);
      await client
        .patch(_id)
        .set({ offeredAmenities: newAmenities })
        .commit({ autoGenerateArrayKeys: true });
    } else {
      console.log(`Skipping ${_id} — no changes`);
    }
  }
  console.log('Done');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
