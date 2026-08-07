import { Room } from "@/models/room"
import { FC } from "react"
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { portableTextComponents } from '@/libs/portableTextComponents';
import getImageUrl from '@/libs/imageUrl';

type Props = {
    room: Room;
};

const RoomCard: FC<Props> = props => {
    const {
        room: { coverImage, name, price, type, description, slug, instantBook },
    } = props;

    const baseUrl = getImageUrl(coverImage) || '/images/default-room.jpg';
    const assetRef = (coverImage as any)?.assetRef || (coverImage as any)?.image?.asset?._ref || (props as any)?.room?._updatedAt;
    const sep = baseUrl.includes('?') ? '&' : '?';
    const src = assetRef ? `${baseUrl}${sep}v=${encodeURIComponent(String(assetRef))}` : baseUrl;

    return (
        <Link
            href={`/rooms/${slug.current}`}
            className='block border-2 border-tertiary-dark rounded-xl w-full max-w-screen-sm my-3 md:my-4 mx-auto md:mx-2 overflow-hidden text-black'>
            <div className='h-40 md:h-60 overflow-hidden m-3 rounded-xl'>
                <Image
                    src={src}
                    alt={name}
                    width={250}
                    height={250}
                    className="img scale-animation"
                    loading="eager"
                />
            </div>
            <div className="p-3 bg-white dark:bg-black dark:text-gray-100">
                <div className="flex text-lg font-bold justify-between">
                    <p>{name} </p>
                    <p>&nbsp; $ {price}</p>
                </div>
                <div className="pt-2 pb-4 text-sm max-h-32 overflow-hidden relative">
                    <PortableText value={description} components={portableTextComponents} />
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-white dark:to-black" />
                </div>

                <span
                    className='bg-primary inline-block text-center w-full py-2 mb-1 rounded-xl text-white text-xl font-bold hover:text-black hover:bg-white dark:hover:text-white dark:hover:bg-black border-2 border-tertiary-dark shadow-sm shadow-primary transition-all duration-500'
                >
                    {instantBook ? "Book Now" : "More Info"}
                </span>
            </div>
        </Link>
    );
};

export default RoomCard