'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { getRooms } from '@/libs/apis';
import { Room } from '@/models/room';

const Gallery = () => {
  const [allImages, setAllImages] = useState<Array<{ url: string; key: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchRoomImages() {
      try {
        const rooms = await getRooms();
        const images: Array<{ url: string; key: string }> = [];

        // Collect images from all rooms
        rooms.forEach((room: Room) => {
          // Add cover image
          if (room.coverImage && room.coverImage.url) {
            images.push({ url: room.coverImage.url, key: `${room._id}-cover` });
          }
          // Add room gallery images
          if (room.images && Array.isArray(room.images)) {
            room.images.forEach((img, idx) => {
              if (img && img.url) {
                images.push({ url: img.url, key: `${room._id}-${idx}` });
              }
            });
          }
        });

        setAllImages(images);
      } catch (error) {
        console.error('Failed to fetch room images:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoomImages();
  }, []);

  // Shuffle and pick 6 random images using useMemo
  const randomImages = useMemo(() => {
    if (allImages.length === 0) return [];

    const shuffleArray = (array: typeof allImages) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    return shuffleArray(allImages).slice(0, 6);
  }, [allImages]);

  if (loading || allImages.length === 0 || randomImages.length === 0) {
    return <div className='bg-white dark:bg-black px-auto py-14 h-full z-10 relative'></div>;
  }

  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23cccccc" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

  return (
    <div className='bg-white dark:bg-black px-auto py-14 h-full z-10 relative'>
      <div className='flex md:m-3 gap-1 md:gap-2'>
        {randomImages.map((img) => (
          <div
            key={img.key}
            className='flex-1 h-48 cursor-pointer overflow-hidden'
            onClick={() => setModalIndex(allImages.findIndex(i => i.key === img.key))}
          >
            <Image
              alt='gallery'
              className='img hover:opacity-90 transition-opacity'
              src={img.url || placeholderImage}
              width={200}
              height={200}
            />
          </div>
        ))}
      </div>

      {modalIndex !== null && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'
          onClick={() => setModalIndex(null)}
        >
          <button
            className='absolute top-4 right-6 text-white text-4xl leading-none'
            onClick={() => setModalIndex(null)}
          >
            &times;
          </button>
          <button
            className='absolute left-4 text-white text-4xl px-2'
            onClick={(e) => { e.stopPropagation(); setModalIndex((modalIndex - 1 + allImages.length) % allImages.length); }}
          >
            &#8249;
          </button>
          <div className='relative w-[90vw] max-w-4xl h-[80vh]' onClick={(e) => e.stopPropagation()}>
            <Image
              alt='gallery large'
              className='object-contain'
              src={allImages[modalIndex]?.url || placeholderImage}
              fill
            />
          </div>
          <button
            className='absolute right-4 text-white text-4xl px-2'
            onClick={(e) => { e.stopPropagation(); setModalIndex((modalIndex + 1) % allImages.length); }}
          >
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
