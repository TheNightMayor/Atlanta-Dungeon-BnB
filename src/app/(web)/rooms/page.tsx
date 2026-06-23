/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { getRooms } from "@/libs/apis";
import { Room } from "@/models/room";
// import Search from '@/components/Search/Search';
import RoomCard from "@/components/RoomCard/RoomCard";

const Rooms = () => {
    const [roomTypeFilter, setRoomTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        const searchQuery = searchParams.get('searchQuery');
        const roomType = searchParams.get('roomType');

        if (roomType) setRoomTypeFilter(roomType);
        if (searchQuery) setSearchQuery(searchQuery);
    }, [searchParams]);

    async function fetchData() {
        return getRooms();
    }

    const { data, error, isLoading } = useSWR('get/hotelRooms', fetchData);

    if(error) throw new Error('Cannot Fetch Data');
    if(typeof data === 'undefined' && !isLoading) 
        throw new Error('Cannot Fetch Data');

    const filterRooms = (rooms: Room[]) => {
        return rooms.filter(room => {
            // Apply room type filter

            if (
                roomTypeFilter &&
                roomTypeFilter.toLowerCase() !== "all" &&
                room.type.toLowerCase() !== roomTypeFilter.toLowerCase()
            ) {
                return false;
            }

            // Apply search query filter
            if (
                searchQuery &&
                !room.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false
            }

            return true;
        });
    };

    const filteredRooms = filterRooms(data || [])


    return (
    <div className="container mx-auto py-8 md:py-10">
        {/* <Search 
        roomTypeFilter={roomTypeFilter}
        searchQuery={searchQuery}
        setRoomTypeFilter={setRoomTypeFilter}
        setSearchQuery={setSearchQuery}
        /> */}

        <div className="grid grid-cols-1 gap-4 md:gap-5 md:grid-cols-3">
            {filteredRooms.map(room => (
                <RoomCard key={room._id} room={room}/>
            ))}
        </div>
    </div>
  )
}

export default Rooms;