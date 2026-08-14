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

  const query = encodeURIComponent('*[_type == "userImage"]{_id, asset->{_id,url,originalFilename}, owner-> { _id, name, email }, visibility, note}');
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`;

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.error('Sanity query failed', res.status, await res.text());
      process.exit(1);
    }
    const json = await res.json();
    console.log('found', (json.result || []).length, 'userImage docs');
    console.dir(json.result, { depth: 3 });
  } catch (err) {
    console.error('query error', err);
    process.exit(1);
  }
})();
