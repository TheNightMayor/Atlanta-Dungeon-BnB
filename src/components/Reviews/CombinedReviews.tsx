import React from 'react';

type Review = {
  _id: string;
  text: string;
  user: { name?: string } | null;
  userRating?: number;
  hotelRoom?: { _id?: string; name?: string; slug?: { current?: string } } | null;
};

const CombinedReviews: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="container mx-auto my-8">
      <div className="card-border p-6">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map(r => (
            <div key={r._id} className="p-4 border rounded-lg bg-white dark:bg-black">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">{r.user?.name || 'Guest'}</div>
                <div className="text-sm text-yellow-500">{Array.from({ length: Math.round(r.userRating || 0) }).map((_, i) => '★').join('')}</div>
              </div>
              <p className="text-sm mb-2">{r.text}</p>
              <div className="text-xs text-gray-500">{r.hotelRoom?.name ?? ''}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CombinedReviews;
