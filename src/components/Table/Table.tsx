'use client';

import { Dispatch, FC, SetStateAction } from "react";
import { useRouter } from "next/navigation";

import { Booking } from "@/models/booking";

type Props = {
    bookingDetails: Booking[];
    setRoomId: Dispatch<SetStateAction<string | null>>;
    toggleRatingModal: () => void
}
const Table: FC<Props> = ({ bookingDetails, setRoomId, toggleRatingModal }) => {
    const router = useRouter();

    return (
    <div className="overflow-x-auto max-w-[340px] rounded-lg mx-auto md:max-w-full sm:rounded-lg bg-white dark:bg-black border-gray-200 dark:border-tertiary-dark border-2">
        <table className="w-full text-sm text-left text-gray-500 dark:text-white">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-white dark:border-tertiary-dark">
                <tr>
                    <th className="px-6 py-3">Room Name</th>
                    {/* <th className="px-6 py-3">Unit Price</th> */}
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Check In Date</th>
                    <th className="px-6 py-3">Check Out Date</th>
                    <th className="px-6 py-3">Days Booked</th>
                    {/* <th className="px-6 py-3">Days Left</th> */}
                    <th className="px-6 py-3">{null}</th>
                </tr>
            </thead>
            <tbody>
                {bookingDetails.map(booking => (
                    <tr 
                    key={booking._id} 
                    className="bg-white border-b dark:border-2 hover:bg-gray-50 dark:bg-black dark:border-b dark:border-tertiary-dark dark:hover:bg-gray-900"
                >
                    <th 
                    onClick={() =>
                        router.push(`/rooms/${booking.hotelRoom.slug.current}`)
                    }
                    className="px-6 underline dark:text-tertiary-dark cursor-pointer py-4 font-medium whitespace-nowrap"
                    >
                        {booking.hotelRoom.name}
                    </th>
                    {/* <td className="px-6 py-4">{booking.hotelRoom.price}</td> */}
                    <td className="px-6 py-4">{booking.totalPrice}</td>
                    <td className="px-6 py-4">{booking.checkinDate}</td>
                    <td className="px-6 py-4">{booking.checkoutDate}</td>
                    {/* <td className="px-6 py-4">{booking.numberOfDays}</td> */}
                    <td className="px-6 py-4">0</td>
                    <td className="px-6 py-4">
                        <button
                        onClick={() =>{
                            setRoomId(booking.hotelRoom._id);
                            toggleRatingModal();
                        }}
                        className="font-medium text-blue-600 dark:text-tertiary-dark hover:underline"
                        >
                            Leave Review
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};

export default Table;