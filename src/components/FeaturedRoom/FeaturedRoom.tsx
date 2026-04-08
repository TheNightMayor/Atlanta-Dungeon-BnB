'use client';

import { FC, useEffect, useState } from 'react';
import Image from 'next/image';

import { PortableText } from 'next-sanity';

import { Room } from '@/models/room';
import Link from 'next/link';
import { MdCancel } from 'react-icons/md';

type Props = {
  featuredRoom: Room;
};

const FeaturedRoom: FC<Props> = props => {
  const { featuredRoom } = props;
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedImageIndex]);

  const allImages = [featuredRoom.coverImage, ...featuredRoom.images.toSpliced(2, featuredRoom.images.length)];

  return (
    <section className='bg-white dark:bg-black flex w-full mx-auto justify-center relative'>
      <div className='container flex flex-col-reverse justify-center gap-5 md:flex-row m-6'>
        <div className='md:grid gap-10 grid-cols-1 md:w-1/5 w-full'>
          <div className='rounded-2xl overflow-hidden mb-4 mt-4 h-72 cursor-pointer' onClick={() => setSelectedImageIndex(0)}>
            <Image
              src={featuredRoom.coverImage.url}
              alt={featuredRoom.name}
              width={200}
              height={300}
              className='img scale-animation'
            />
          </div>
          {/* <div className='grid grid-cols-2 gap-6 h-48'> */}
          {featuredRoom.images.toSpliced(2, (featuredRoom.images.length)).map((image, index) => (
            <div key={image._key} className='rounded-2xl overflow-hidden mb-4 h-72 cursor-pointer' onClick={() => setSelectedImageIndex(index + 1)}>
              <Image
                src={image.url}
                alt={image._key}
                width={200}
                height={300}
                className='img scale-animation'
              />
            </div>
          ))}
          {/* </div> */}
        </div>

        <div className='md:w-1/2 text-left'>
          <h3 className='font-orbitron text-4xl mb-2 border-b-2 border-tertiary-dark'>{featuredRoom.name}</h3>

          <div className='w-auto'>
            <PortableText value={featuredRoom.description} />
          </div>

          <div className='font-orbitron flex flex-col md:flex-row md:items-end justify-between mt-5 border-tertiary-dark px-10 py-5 mx-6 rounded-2xl border-2'>
            <div className='flex mb-3 md:my-2 justify-center'>
              <div className='flex gap-3 md:flex-col items-center justify-center mr-4'>
                <p className='text-s font-medium lg:text-xl text-center'>Start From</p>
                <p className='md:font-bold flex font-medium text-xl xl:text-3xl'>
                  ${featuredRoom.price}/Night
                </p>
              </div>
            </div>

            <Link
              href={`/rooms/${featuredRoom.slug.current}`}
              className='bg-primary text-center w-full py-6 my-2 rounded-xl text-black dark:text-white text-xl font-bold hover:bg-white hover:dark:bg-black border-2 border-tertiary-dark transition-all duration-500 items-center justify-center'
            >
              More Details
            </Link>
          </div>
        </div>
      </div>

      {selectedImageIndex !== null && (
        <div
          className='fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-90 z-[55]'
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className='relative w-[90vw] h-[90vh]'>
            <Image
              src={allImages[selectedImageIndex].url}
              alt='Featured room image'
              fill
              className='object-contain'
            />
            <button
              className='absolute top-4 right-4 text-white z-10'
              onClick={() => setSelectedImageIndex(null)}
            >
              <MdCancel className='text-3xl' />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedRoom;