'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { getRooms } from '@/libs/apis';
import { Room } from '@/models/room';

const Gallery = () => {
  const [allImages, setAllImages] = useState<Array<{ url: string; key: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (modalIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modalIndex]);

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

  // Shuffle images; we'll show as many as fit while keeping min tile size
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

    return shuffleArray(allImages);
  }, [allImages]);

  // Determine how many tiles fit on one row given min tile size = 25vh
  useEffect(() => {
    const updateVisible = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const minTile = vh * 0.25; // 25vh in px
      const count = Math.max(1, Math.floor(vw / minTile));
      setVisibleCount(count);
    };

    updateVisible();
    window.addEventListener('resize', updateVisible);
    window.addEventListener('orientationchange', updateVisible);
    return () => {
      window.removeEventListener('resize', updateVisible);
      window.removeEventListener('orientationchange', updateVisible);
    };
  }, []);

  if (loading || allImages.length === 0 || randomImages.length === 0) {
    return <div className='bg-white dark:bg-black px-auto py-14 h-full z-10 relative'></div>;
  }

  const placeholderDataUrl = (label = 'No Image') => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>` +
      `<rect width='100%' height='100%' fill='#f3f4f6'/>` +
      `<text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9CA3AF' font-family='Inter, Arial, sans-serif' font-size='28'>${label}</text>` +
      `</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const displayedCount = Math.min(Math.max(1, visibleCount), randomImages.length);
  const visibleImages = randomImages.slice(0, displayedCount);

  return (
    <div className='bg-white dark:bg-black px-4 py-4 min-h-[25vh] w-full relative'>
      <div className='w-full'>
        <div
          className='grid gap-4'
          style={{ gridTemplateColumns: `repeat(${Math.max(1, displayedCount)}, minmax(25vh, 1fr))` }}
        >
          {visibleImages.map((img) => (
            <div
              key={img.key}
              className='relative w-full aspect-square overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-900 shadow-sm hover:shadow-md transition'
              onClick={() => setModalIndex(allImages.findIndex(i => i.key === img.key))}
            >
              <Image
                alt={`Hotel gallery image ${img.key}`}
                className='object-cover w-full h-full'
                src={img.url || placeholderDataUrl()}
                fill
                sizes='25vh'
              />
            </div>
          ))}
        </div>
      </div>

      {modalIndex !== null && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80'
          onClick={() => setModalIndex(null)}
        >
          <button
            className='z-[10000] absolute left-4 text-white text-4xl px-2'
            onClick={(e) => {
              e.stopPropagation();
              setModalIndex((modalIndex - 1 + allImages.length) % allImages.length);
            }}
          >
            ‹
          </button>
          <div className='relative w-[90vw] max-w-4xl h-[80vh]'>
            <Image
              alt={`Hotel gallery large image ${allImages[modalIndex]?.key}`}
              className='object-contain'
              src={allImages[modalIndex]?.url || placeholderDataUrl()}
              fill
              sizes='90vw'
            />
          </div>
          <button
            className='z-[10000] absolute right-4 text-white text-4xl px-2'
            onClick={(e) => {
              e.stopPropagation();
              setModalIndex((modalIndex + 1) % allImages.length);
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
