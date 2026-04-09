#!/usr/bin/env node
// Usage:
// SANITY_PROJECT_ID=yourId SANITY_DATASET=production SANITY_TOKEN=yourWriteToken node scripts/migrate-user-images.js

const sanityClient = require('@sanity/client');
const axios = require('axios');
const path = require('path');

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

async function run() {
  console.log('Querying users with image stored as string URL...');
  const docs = await client.fetch('*[_type == "user" && defined(image) && image match "http*"]{_id, image}');
  console.log(`Found ${docs.length} users to migrate.`);

  for (const doc of docs) {
    const { _id, image } = doc;
    const url = image;
    try {
      console.log(`Fetching image for ${_id} -> ${url}`);
      const resp = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
      const buffer = Buffer.from(resp.data);
      const contentType = resp.headers['content-type'] || 'image/jpeg';
      let filename;
      try {
        filename = path.basename(new URL(url).pathname) || `${_id}.jpg`;
      } catch (_) {
        filename = `${_id}.jpg`;
      }

      console.log(`Uploading asset for ${_id} (${filename}, ${contentType})`);
      const asset = await client.assets.upload('image', buffer, { filename, contentType });

      if (!asset || !asset._id) {
        throw new Error('Asset upload returned invalid response');
      }

      await client
        .patch(_id)
        .set({
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
        })
        .commit({ autoGenerateArrayKeys: true });

      console.log(`Patched user ${_id} -> ${asset._id}`);
    } catch (err) {
      console.error(`Failed for ${_id}:`, err && err.message ? err.message : err);
    }
  }

  console.log('Done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
