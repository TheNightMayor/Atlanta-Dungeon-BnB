"use client";

import React, { useEffect, useRef, useState } from 'react';

type Review = {
  _id: string;
  text: string;
  user: { name?: string } | null;
  userRating?: number;
  hotelRoom?: { name?: string } | null;
};

const displayMs = 5000; // 5s
const fadeMs = 1000; // 1s fade
const OUT_OFFSET = 248; // px slide out to right
const IN_OFFSET = 248; // px slide in from left

export default function CombinedReviewsRotator({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) return null;

  const [frontIndex, setFrontIndex] = useState(0);
  const [backIndex, setBackIndex] = useState(reviews.length > 1 ? 1 : 0);
  const [showFront, setShowFront] = useState(true);
  const [disableTransition, setDisableTransition] = useState(false);

  const ivRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const frontIndexRef = useRef(frontIndex);

  useEffect(() => {
    frontIndexRef.current = frontIndex;
  }, [frontIndex]);

  useEffect(() => {
    // reset indices if reviews length changes
    setFrontIndex(0);
    setBackIndex(reviews.length > 1 ? 1 : 0);
  }, [reviews.length]);

  useEffect(() => {
    const start = () => {
      const rotate = () => {
        const next = (frontIndexRef.current + 1) % reviews.length;
        // prepare back content
        setBackIndex(next);
        // trigger cross animation: front -> slide right & fade out; back -> slide from left & fade in
        // allow DOM to update then toggle
        requestAnimationFrame(() => setShowFront(false));

        // after animation completes, swap indices and reset positions without transition
        timeoutRef.current = window.setTimeout(() => {
          setDisableTransition(true);
          setFrontIndex(next);
          setBackIndex((next + 1) % reviews.length);
          // snap back to front visible (no animation)
          setShowFront(true);
          // re-enable transitions next frame
          requestAnimationFrame(() => {
            // small timeout to ensure the snap has applied
            window.setTimeout(() => setDisableTransition(false), 0);
          });
        }, fadeMs);
      };

      ivRef.current = window.setInterval(rotate, displayMs);
    };

    start();

    return () => {
      if (ivRef.current) window.clearInterval(ivRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // intentionally omit frontIndex from deps so we always use latest via setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length]);

  const front = reviews[frontIndex];
  const back = reviews[backIndex];

  const baseTransition = disableTransition ? 'none' : `opacity ${fadeMs}ms ease, transform ${fadeMs}ms ease`;

  const frontStyle: React.CSSProperties = {
    transition: baseTransition,
    opacity: showFront ? 1 : 0,
    transform: showFront ? 'translateX(0)' : `translateX(${OUT_OFFSET}px)`,
  };

  const backStyle: React.CSSProperties = {
    transition: baseTransition,
    opacity: showFront ? 0 : 1,
    transform: showFront ? `translateX(-${IN_OFFSET}px)` : 'translateX(0)',
  };

  return (
    <section className="container mx-auto my-8">
      <div className="p-6 rounded-lg border-2 border-tertiary-dark">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        <div className="mx-auto max-w-3xl relative h-auto">
          <div style={frontStyle} className="p-6 border rounded-lg bg-white dark:bg-black">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">{front.user?.name || 'Guest'}</div>
              <div className="text-sm text-yellow-500">{Array.from({ length: Math.round(front.userRating || 0) }).map((_, i) => '★').join('')}</div>
            </div>
            <p className="text-sm mb-2">{front.text}</p>
            <div className="text-xs text-gray-500">{front.hotelRoom?.name ?? ''}</div>
          </div>

          <div style={{ ...backStyle, position: 'absolute', inset: 0 }} className="p-6 border rounded-lg bg-white dark:bg-black">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">{back.user?.name || 'Guest'}</div>
              <div className="text-sm text-yellow-500">{Array.from({ length: Math.round(back.userRating || 0) }).map((_, i) => '★').join('')}</div>
            </div>
            <p className="text-sm mb-2">{back.text}</p>
            <div className="text-xs text-gray-500">{back.hotelRoom?.name ?? ''}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
