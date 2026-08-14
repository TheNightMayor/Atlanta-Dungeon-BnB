const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  const env = {};
  try {
    const text = fs.readFileSync(envPath, 'utf8');
    text.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (m) {
        env[m[1]] = m[2].trim();
      }
    });
  } catch (e) {
    // ignore
  }
  return env;
}

(async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const env = loadEnv(path.join(repoRoot, '.env'));
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
  const token = env.SANITY_STUDIO_TOKEN;

  if (!projectId || !dataset || !token) {
    console.error('Missing SANITY env vars in .env');
    process.exit(1);
  }

  // find users with image references
  const qUsers = encodeURIComponent('*[_type == "user" && defined(image.asset._ref)]{_id, "assetRef": image.asset._ref}');
  const urlUsers = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${qUsers}`;

  try {
    const resUsers = await fetch(urlUsers, { headers: { Authorization: `Bearer ${token}` } });
    const jsonUsers = await resUsers.json();
    const users = jsonUsers.result || [];
    console.log('users with image refs:', users.length);
    if (users.length === 0) return;

    // check existing userImage docs to avoid duplicates
    const qExisting = encodeURIComponent('*[_type=="userImage"]{asset->{_id}, owner->{_id}}');
    const urlExisting = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${qExisting}`;
    const resExisting = await fetch(urlExisting, { headers: { Authorization: `Bearer ${token}` } });
    const jsonExisting = await resExisting.json();
    const existing = jsonExisting.result || [];
    const existingPairs = new Set(existing.map(e => `${e.owner?._id}||${e.asset?._id}`));

    const mutations = [];
    for (const u of users) {
      const pairKey = `${u._id}||${u.assetRef}`;
      if (existingPairs.has(pairKey)) {
        console.log('already exists wrapper for', u._id, u.assetRef);
        continue;
      }
      mutations.push({
        create: {
          _type: 'userImage',
          asset: { _type: 'image', asset: { _type: 'reference', _ref: u.assetRef } },
          owner: { _type: 'reference', _ref: u._id },
          visibility: 'private',
          note: 'Imported wrapper for existing user image',
        }
      });
    }

    if (mutations.length === 0) {
      console.log('No new wrappers to create');
      return;
    }

    const mutateUrl = `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}?returnIds=true`;
    const resMutate = await fetch(mutateUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations })
    });
    const jsonMutate = await resMutate.json();
    console.log('mutate result:', JSON.stringify(jsonMutate, null, 2));

    // re-query userImage docs
    const resAfter = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent('*[_type == "userImage"]{_id, asset->{_id,url,originalFilename}, owner-> { _id, name, email }, visibility, note}')}`, { headers: { Authorization: `Bearer ${token}` } });
    const jsonAfter = await resAfter.json();
    console.log('found', (jsonAfter.result || []).length, 'userImage docs after creating wrappers');
    console.dir(jsonAfter.result, { depth: 3 });

  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
