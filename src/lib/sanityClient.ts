import { createClient } from 'next-sanity'

// Central Sanity client instance for read operations.
// `useCdn: false` is chosen so the app always reads the latest content during development and preview flows.
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
})
