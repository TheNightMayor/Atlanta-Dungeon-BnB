'use client';

import { FC } from 'react';
import Image from 'next/image';

import { Room } from '@/models/room';
import Link from 'next/link';

type Props = {
  featuredRoom: Room;
};

const FeaturedRoom: FC<Props> = props => {
  const { featuredRoom } = props;

  return (
    <section className='z-10 bg-white dark:bg-black flex md:flex-row flex-col py-10 w-full mx-auto justify-center relative'>
      <div className='container flex justify-center gap-5'>
      <div className='md:grid gap-10 grid-cols-1 md:w-1/5 w-full'>
        <div className='rounded-2xl overflow-hidden mb-4 mt-4 h-72'>
          <Image
            src={featuredRoom.coverImage.url}
            alt={featuredRoom.name}
            width={200}
            height={300}
            className='img scale-animation'
          />
        </div>
        {/* <div className='grid grid-cols-2 gap-6 h-48'> */}
          {featuredRoom.images.toSpliced(2,(featuredRoom.images.length)).map(image => (
            <div key={image._key} className='rounded-2xl overflow-hidden mb-4 h-72'>
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

      <div className='md:py-10 md:w-1/2 text-left'>
        <h3 className='font-orbitron text-4xl mb-10'>{featuredRoom.name}</h3>

        <p className='font-medium w-auto'>{featuredRoom.description}</p>

        <div className='font-orbitron flex flex-col md:flex-row md:items-end justify-between mt-5 border-tertiary-dark px-10 py-5 mx-6 rounded-2xl border-2'>
          <div className='flex mb-3 md:mb-0'>
            <div className='flex gap-3 flex-col items-center justify-center mr-4'>
              <p className='text-s font-medium lg:text-xl text-center'>Start From</p>
              <p className='md:font-bold flex font-medium text-xl xl:text-5xl'>
                $ {featuredRoom.price}/Night
              </p>
            </div>
            {/* <div className='flex gap-3 flex-col items-center justify-center mr-4'>
              <p className='text-s lg:text-xl text-center'>Discount</p>
              <p className='md:font-bold flex font-medium text-xl xl:text-5xl'>
                $ {featuredRoom.discount}
              </p>
            </div> */}
          </div>

          <Link
            href={`/rooms/${featuredRoom.slug.current}`}
            className='border-2 h-fit w-full text-center border-tertiary-dark text-tertiary-dark px-2 py-3 lg:py-7 lg:px-7 rounded-2xl font-bold lg:text-xl'
          >
            More Details
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
};

export default FeaturedRoom;