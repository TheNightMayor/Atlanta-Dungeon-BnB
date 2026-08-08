import { notFound } from 'next/navigation';
import { getRoom } from '@/libs/apis';
import { getRoomSchema, getRoomUrl, siteUrl } from '@/libs/seo';
import RoomDetailsClient from '@/components/RoomDetails/RoomDetailsClient';

export async function generateMetadata({ params }: { params: Promise<{ slug?: string }> }) {
  const resolvedParams = await params;
  const room = await getRoom(resolvedParams.slug ?? null);

  if (!room) {
    return {
      title: 'Room not found | Dungeon Next Door',
      description: 'Room not found.',
    };
  }

  const description = room.description
    ? room.description
        .flatMap(block => Array.isArray(block.children) ? block.children.map(child => child.text) : [])
        .join(' ')
        .slice(0, 160)
    : 'Book a unique themed room in Atlanta with Dungeon Next Door.';

  return {
    title: `${room.name} | Dungeon Next Door`,
    description,
    openGraph: {
      title: `${room.name} | Dungeon Next Door`,
      description,
      url: getRoomUrl(room.slug.current),
      siteName: 'Dungeon Next Door',
      type: 'article',
      images: [
        {
          url: `${siteUrl.origin}/images/hero-1.jpg`,
          width: 1200,
          height: 630,
          alt: `${room.name} at Dungeon Next Door`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${room.name} | Dungeon Next Door`,
      description,
      images: [`${siteUrl.origin}/images/hero-1.jpg`],
    },
  };
}

const RoomPage = async ({ params }: { params: Promise<{ slug?: string }> }) => {
  const resolvedParams = await params;
  const room = await getRoom(resolvedParams.slug ?? null);
  if (!room) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getRoomSchema(room, getRoomUrl(room.slug.current))),
        }}
      />
      <RoomDetailsClient room={room} />
    </>
  );
};

export default RoomPage; 