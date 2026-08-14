// scripts/import-amenities.js
// One-time migration script to import built-in amenities into Sanity as `amenity` documents.
// Usage: set SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_TOKEN env vars, then run:
// SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_TOKEN=yourWriteToken node scripts/import-amenities.js

const { createClient } = require('next-sanity');

const AMENITIES = [
  { title: "Sunshine", value: "sunshine", icon: 'fa-sun' },
  { title: "Haunted", value: "haunted", icon: 'fa-ghost' },
  { title: "Central Air Conditioning", value: "ac", icon: 'fa-snowflake' },
  { title: "Central Heating", value: "heat", icon: 'fa-fire' },
  { title: "WiFi", value: "wifi", icon: 'fa-wifi' },
  { title: "Kitchen", value: "kitchen", icon: 'fa-utensils' },
  { title: "Refrigerator", value: "fridge", icon: 'fa-box-open' },
  { title: "Microwave", value: "microwave", icon: 'fa-microchip' },
  { title: "Cooking Basics", value: "cooking", icon: 'fa-utensils' },
  { title: "Dishes and Silverware", value: "dishes", icon: 'fa-utensils' },
  { title: "Dishwasher", value: "dishwasher", icon: 'fa-broom' },
  { title: "Stove", value: "stove", icon: 'fa-fire' },
  { title: "Oven", value: "oven", icon: 'fa-oven' },
  { title: "Keurig", value: "keurig", icon: 'fa-mug-hot' },
  { title: "Wine Glasses", value: "glasses", icon: 'fa-wine-glass' },
  { title: "Dining Table", value: "table", icon: 'fa-table' },
  { title: "Shared Backyard", value: "yard", icon: 'fa-tree' },
  { title: "Fire Pit", value: "fire", icon: 'fa-fire' },
  { title: "On-Site Parking", value: "onsiteparking", icon: 'fa-car' },
  { title: "Street Parking", value: "streetparking", icon: 'fa-parking' },
  { title: "Self check-in", value: "selfcheckin", icon: 'fa-key' },
  { title: "Keypad", value: "keypad", icon: 'fa-keyboard' },
  { title: "Outdoor Security Cameras", value: "cameras", icon: 'fa-camera' },
  { title: "Smoke Alarm", value: "smokealarm", icon: 'fa-bell' },
  { title: "Carbon Monoxide Alarm", value: "coalarm", icon: 'fa-bell' },
  { title: "Fire Extinguisher", value: "fireextinguisher", icon: 'fa-fire-extinguisher' },
  { title: "First Aid Kit", value: "firstaid", icon: 'fa-first-aid' },
  { title: "Bed Linens", value: "linens", icon: 'fa-bed' },
  { title: "Blackout Curtains", value: "curtains", icon: 'fa-curtain' },
  { title: "Hair Dryer", value: "hairdryer", icon: 'fa-wind' },
  { title: "Hot Water", value: "hotwater", icon: 'fa-hot-tub' },
];

async function run() {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.SANITY_TOKEN;
  if (!projectId || !token) {
    console.error('Please set SANITY_PROJECT_ID and SANITY_TOKEN environment variables.');
    process.exit(1);
  }

  const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: false, token });

  for (const a of AMENITIES) {
    try {
      // Skip if an amenity with the same title exists
      const exists = await client.fetch('*[_type == "amenity" && title == $title][0]', { title: a.title });
      if (exists) {
        console.log('Skipping existing:', a.title);
        continue;
      }
      const doc = await client.create({ _type: 'amenity', title: a.title, icon: a.icon });
      console.log('Created', doc._id, a.title);
    } catch (err) {
      console.error('Failed for', a.title, err.message || err);
    }
  }
  console.log('Done');
}

run().catch(err => { console.error(err); process.exit(1); });
