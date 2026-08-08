'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getRooms } from '@/libs/apis';
import { Room } from '@/models/room';
import getImageUrl from '@/libs/imageUrl';

const Gallery = () => {
  type GalleryImage = { url: string; key: string; isCover: boolean };
  const [allImages, setAllImages] = useState<Array<GalleryImage>>([]);
  const [loading, setLoading] = useState(true);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const normalizeImageUrl = (url: string) => {
    const normalized = url?.trim();
    if (!normalized) return normalized;

    try {
      const parsed = new URL(normalized, 'http://localhost');
      parsed.hash = '';
      parsed.search = '';
      const pathname = parsed.pathname.replace(/\/+$|^\/+/, '/');
      return `${parsed.protocol}//${parsed.host}${pathname}`;
    } catch {
      return normalized;
    }
  };

  const getDedupKey = (url: string, imageObj: any) => {
    const ref = imageObj?.image?.asset?._ref || imageObj?.asset?._ref || imageObj?._ref;
    if (ref) return ref;
    return normalizeImageUrl(url);
  };

  useEffect(() => {
    async function fetchRoomImages() {
      try {
        const rooms = await getRooms();
        const images: Array<GalleryImage> = [];
        const seenKeys = new Set<string>();

        const addImage = (url: string, key: string, isCover: boolean, imageObj: any) => {
          if (!url) return;
          const dedupKey = getDedupKey(url, imageObj);
          if (seenKeys.has(dedupKey)) return;
          seenKeys.add(dedupKey);
          images.push({ url, key, isCover });
        };

        // Collect images from all rooms
        rooms.forEach((room: Room) => {
          // Add cover image first so it can be favored later
          const coverUrl = getImageUrl(room.coverImage);
          if (coverUrl) {
            addImage(coverUrl, `${room._id}-cover`, true, room.coverImage);
          }
          // Add room gallery images
          if (room.images && Array.isArray(room.images)) {
            room.images.forEach((img, idx) => {
              const imageUrl = getImageUrl(img);
              if (imageUrl) {
                addImage(imageUrl, `${room._id}-${idx}`, false, img);
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

  // Shuffle images and bias cover images upward in the order
  const randomImages = useMemo(() => {
    if (allImages.length === 0) return [];

    const coverImages = allImages.filter(img => img.isCover);
    const otherImages = allImages.filter(img => !img.isCover);

    const shuffleArray = (array: typeof allImages) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffledCoverImages = shuffleArray(coverImages);
    const shuffledOtherImages = shuffleArray(otherImages);

    // Put cover images first, but still keep the rest randomized.
    return [...shuffledCoverImages, ...shuffledOtherImages];
  }, [allImages]);

  // Determine how many tiles fit on one row given min tile size = 25vh
  useEffect(() => {
    const updateVisible = () => {
      const containerWidth = containerRef.current?.clientWidth ?? window.innerWidth;
      const vh = window.innerHeight;
      const minTile = vh * 0.25; // 25vh in px
      const gap = 16; // same as gap-4
      const count = Math.max(1, Math.floor((containerWidth + gap) / (minTile + gap)));
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
      <div ref={containerRef} className='w-full overflow-x-auto'>
        <div
          className='grid gap-4'
          style={{ gridAutoFlow: 'column', gridAutoColumns: 'minmax(min(25vh, 100%), 1fr)' }}
        >
          {visibleImages.map((img) => (
            <button
              key={img.key}
              type="button"
              className="relative w-full aspect-square overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition focus:outline-none bg-white dark:bg-gray-800 border-2 border-primary"
              onClick={() => setModalIndex(allImages.findIndex(i => i.key === img.key))}
              aria-label={`Open gallery image ${img.key}`}
            >
              <Image
                alt={`Hotel gallery image ${img.key}`}
                className='object-cover w-full h-full'
                src={img.url || placeholderDataUrl()}
                fill
                sizes='25vh'
              />
            </button>
          ))}
        </div>
      </div>

      {modalIndex !== null && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80'
          onClick={() => setModalIndex(null)}
          role="presentation"
        >
          <button
            type="button"
            className='z-[10000] absolute top-4 right-4 text-white text-4xl px-2'
            onClick={(e) => {
              e.stopPropagation();
              setModalIndex(null);
            }}
            aria-label='Close gallery modal'
          >
            ×
          </button>
          <button
            type="button"
            className='z-[10000] absolute left-4 text-white text-4xl px-2'
            onClick={(e) => {
              e.stopPropagation();
              setModalIndex((modalIndex - 1 + allImages.length) % allImages.length);
            }}
            aria-label='Previous image'
          >
            ‹
          </button>
          <div className='relative w-[90vw] max-w-4xl h-[80vh]' role="dialog" aria-modal="true" aria-label="Gallery image viewer">
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
