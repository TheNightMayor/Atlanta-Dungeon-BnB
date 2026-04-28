import { Room } from "@/models/room"
import { FC } from "react"
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { portableTextComponents } from '@/libs/portableTextComponents';

type Props = {
    room: Room;
};

const RoomCard: FC<Props> = props => {
    const {
        room: { coverImage, name, price, type, description, slug, instantBook },
    } = props;

    return (
        <Link
            href={`/rooms/${slug.current}`}
            className='block border-2 border-tertiary-dark rounded-xl w-full max-w-screen-sm my-4 md:my-6 mx-auto md:mx-2 overflow-hidden text-black'>
            <div className='h-48 md:h-72 overflow-hidden m-4 rounded-xl'>
                <Image
                    src={coverImage.url}
                    alt={name}
                    width={250}
                    height={250}
                    className="img scale-animation"
                />
            </div>
            <div className="p-4 bg-white dark:bg-black dark:text-gray-100">
                <div className="flex text-lg font-bold justify-between">
                    <p>{name} </p>
                    <p>&nbsp; $ {price}</p>
                </div>
                <div className="pt-3 pb-6 text-sm max-h-36 overflow-hidden relative">
                    <PortableText value={description} components={portableTextComponents} />
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-white dark:to-black" />
                </div>

                <button
                    className='bg-primary inline-block text-center w-full py-2 mb-2 rounded-xl text-white text-xl font-bold hover:text-black hover:bg-white dark:hover:text-white dark:hover:bg-black border-2 border-tertiary-dark transition-all duration-500'
                >
                    {instantBook ? "Book Now" : "More Info"}
                </button>
            </div>
        </Link>
    );
};

export default RoomCard