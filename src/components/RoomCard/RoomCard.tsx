import { Room } from "@/models/room"
import { FC } from "react"
import Image from "next/image";
import Link from "next/link";

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
        className='rounded-xl md:min-w-sm md:max-w-sm mb-10 mx-auto md:mx-2 overflow-hidden text-black'>
            <div className='h-60 overflow-hidden'>
                <Image
                    src={coverImage.url}
                    alt={name}
                    width={250}
                    height={250}
                    className="img scale-animation"
                />
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 dark:text-gray-100">
                <div className="flex text-xl font-semibold">
                    <p>{name} </p>
                    <p>&nbsp; $ {price}</p>
                </div>
                {/* <p className="pt-2 text-xs">{type} Room</p> */}

                <p className="pt-3 pb-6 text-sm">{description.slice(0,80)}...</p>

                <div 
                    className='bg-primary inline-block text-center w-full py-y rounded-xl text-white text-xl font-bold hover:-translate-y-2 hover:shadow-lg transition-all duration-500'
                >
                    {isBooked ? "More Info" : "Book Now"}
                 </div>
            </div>
        </Link>
    );
};

export default RoomCard