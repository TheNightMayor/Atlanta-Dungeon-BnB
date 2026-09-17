export type AmenityOption = { _id: string; title: string; icon?: string };

type SanityClient = {
  fetch: (query: string) => Promise<unknown>;
};

const query = '*[_type == "amenity"]{_id, title, icon}';
const cache = new WeakMap<object, Promise<AmenityOption[]>>();

export function getAmenityOptions(client: SanityClient): Promise<AmenityOption[]> {
  const cached = cache.get(client);
  if (cached) return cached;

  const request = client.fetch(query)
    .then((docs) => (Array.isArray(docs) ? docs : []).map((doc: any) => ({
      _id: doc._id,
      title: doc.title,
      icon: doc.icon ?? undefined,
    })))
    .catch((error) => {
      cache.delete(client);
      throw error;
    });

  cache.set(client, request);
  return request;
}

export function invalidateAmenityOptions(client: SanityClient) {
  cache.delete(client);
}