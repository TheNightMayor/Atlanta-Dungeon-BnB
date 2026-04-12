import { Booking } from '@/models/booking';
import axios from 'axios';
import  { FC } from 'react'
import useSWR from 'swr';


const RoomBooking: FC<{ roomId: string }> = ({ roomId }) => {
    const fetchRoomBookings = async () => {
      const { data } = await axios.get<Booking[]>(`/api/room-bookings/${roomId}`);
      return data;
    };
  
    const {
      data: roomBookings,
      error,
      isLoading,
    } = useSWR('/api/room-bookings', fetchRoomBookings);
  
    if (error) throw new Error('Cannot fetch data');
    if (typeof roomBookings === 'undefined' && !isLoading)
      throw new Error('Cannot fetch data');
  
    // roomBookings loaded; removed debug logging

    return (
      <>
        {roomBookings &&
          roomBookings.map(booking => (
            <div
              className='bg-gray-100 dark:bg-gray-900 p-4 rounded-lg'
              key={booking._id}
            >
              <div className='font-semibold mb-2 flex'>
                {/* <p>{booking.hotelRoom.name}</p> */}
                <div className='ml-4 flex items-center text-tertiary-light text-lg'>
                  {/* <Rating rating={review.userRating} /> */}
                </div>
              </div>
  
              <p>{booking.checkinDate}</p>
              <p>{booking.checkoutDate}</p>
            </div>
          ))}
      </>
    );
  };
export default RoomBooking