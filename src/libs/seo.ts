export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com');
export const siteName = 'Dungeon Next Door';
export const siteDescription = 'Escape into a unique Atlanta stay with immersive rooms, quirky decor, and easy booking.';
export const twitterHandle = '@DungeonNextDoor';
export const defaultImage = `${siteUrl.origin}/images/hero-1.jpg`;

export const getRoomUrl = (slug: string) => `${siteUrl.origin}/rooms/${slug}`;
export const getPageUrl = (path: string) => `${siteUrl.origin}${path.startsWith('/') ? path : `/${path}`}`;

export const baseStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: siteUrl.href,
  name: siteName,
  description: siteDescription,
};

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getLodgingBusinessSchema = (url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: siteName,
  url,
  description: siteDescription,
  image: [defaultImage],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Atlanta',
    addressRegion: 'GA',
    addressCountry: 'US',
  },
  telephone: '+1-404-555-0100',
});

export const getRoomSchema = (room: { name: string; description?: Array<{ _type: string; children?: Array<{ _key: string; _type: string; text: string }>; }>; price: number; slug: { current: string } }, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: room.name,
  url,
  description: Array.isArray(room.description)
    ? room.description
        .flatMap(block => Array.isArray(block.children) ? block.children.map(child => child.text) : [])
        .join(' ')
        .slice(0, 160)
    : siteDescription,
  image: [defaultImage],
  priceRange: `$${room.price}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Atlanta',
    addressRegion: 'GA',
    addressCountry: 'US',
  },
});
