import { Room } from "@/models/room"
import { FC } from "react"
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";

type Props = {
    room: Room;
};

const RoomCard: FC<Props> = props => {
    const {
        room: { coverImage, name, price, type, description, slug, isBooked },
    } = props;

    return (
        <Link
        href={`/rooms/${slug.current}`} 
        className='border-2 border-tertiary-dark rounded-xl md:min-w-sm md:max-w-sm mb-10 mx-auto md:mx-2 overflow-hidden text-black min-h-96'>
            <div className='h-72 overflow-hidden m-4 rounded-xl'>
                <Image
                    src={coverImage.url}
                    alt={name}
                    width={250}
                    height={250}
                    className="img scale-animation"
                />
            </div>
            <div className="p-4 bg-gray-100 dark:bg-black dark:text-gray-100 h-64">
                <div className="flex text-lg font-semibold">
                    <p>{name} </p>
                    <p>&nbsp; $ {price}</p>
                </div>
                {/* <p className="pt-2 text-xs">{type} Room</p> */}

                <div className="pt-3 pb-6 text-sm font-medium h-36 overflow-hidden">
                  <PortableText value={description} />
                </div>

                <button 
                    className='bg-primary inline-block text-center w-full py-2 mb-2 rounded-xl text-white text-xl font-bold hover:-translate-y-2 hover:shadow-lg transition-all duration-500'
                >
                    {isBooked ? "More Info" : "Book Now"}
                 </button>
            </div>
        </Link>
    );
};

export default RoomCard