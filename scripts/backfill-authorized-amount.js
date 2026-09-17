#!/usr/bin/env node
// Backfill authorizedAmount / authorizedAt on existing bookings from their Stripe PaymentIntent.
// Usage:
//   SANITY_PROJECT_ID=yourId SANITY_DATASET=production SANITY_TOKEN=yourWriteToken STRIPE_SECRET_KEY=sk_... node scripts/backfill-authorized-amount.js
// Add --dry-run to preview changes without writing to Sanity.

const sanityClient = require('@sanity/client');
const Stripe = require('stripe');

const dryRun = process.argv.includes('--dry-run');

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || process.env.SANITY_STUDIO_TOKEN,
  useCdn: false,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });

async function run() {
  const bookings = await client.fetch(
    `*[_type == "booking" && defined(stripePaymentIntentId) && (!defined(authorizedAmount) || !defined(authorizedAt))]{_id, stripePaymentIntentId, totalPrice}`
  );
  console.log(`Found ${bookings.length} booking(s) missing authorizedAmount/authorizedAt.`);

  for (const booking of bookings) {
    try {
      const pi = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
      const authorizedAmount = (pi.amount ?? 0) / 100;
      const authorizedAt = new Date(pi.created * 1000).toISOString();

      console.log(
        `${booking._id}: authorizedAmount=${authorizedAmount} authorizedAt=${authorizedAt}${dryRun ? ' (dry run)' : ''}`
      );

      if (!dryRun) {
        await client.patch(booking._id).setIfMissing({ authorizedAmount, authorizedAt }).commit();
      }
    } catch (err) {
      console.error(`Failed to backfill ${booking._id}:`, err.message || err);
    }
  }

  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
