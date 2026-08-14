const fs = require('fs');
const path = require('path');
function loadEnv(envPath) {
  const env = {};
  try { const text = fs.readFileSync(envPath, 'utf8'); text.split(/\r?\n/).forEach(line => { const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim(); }); } catch (e) {}
  return env;
}
(async ()=>{
  const repoRoot = path.resolve(__dirname,'..');
  const env = loadEnv(path.join(repoRoot,'.env'));
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
  const token = env.SANITY_STUDIO_TOKEN;
  if (!projectId||!dataset||!token){console.error('Missing env');process.exit(1)}
  const q = encodeURIComponent('*[_type=="userImage"]{_id, asset, owner, visibility, note}');
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${q}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  console.dir(json.result, { depth: 4 });
})();
