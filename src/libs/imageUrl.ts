export function urlFromAssetRef(ref?: string) {
  if (!ref || typeof ref !== 'string') return null;
  // ref format: image-<id>-<size>-<ext> or image-<id>-<ext>
  const withoutPrefix = ref.replace(/^image-/, '');
  const parts = withoutPrefix.split('-');
  const ext = parts.pop();
  const id = parts.join('-');
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}.${ext}`;
}

// Accepts a photo object (may have `url` or `image.asset._ref`) or a raw ref string
export default function getImageUrl(source: any): string | null {
  if (!source) return null;
  if (typeof source === 'string') return source;
  if (source.url) return source.url;
  const ref = source?.asset?._ref || source?.image?.asset?._ref || source?._ref;
  return urlFromAssetRef(ref) || null;
}
