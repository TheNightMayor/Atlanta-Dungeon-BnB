'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getRooms } from "@/libs/apis";
import { Room } from "@/models/room";
import RoomCard from "@/components/RoomCard/RoomCard";

type Props = {
  rooms: Room[];
};

const RoomsClient = ({ rooms }: Props) => {
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchQueryParam = searchParams.get('searchQuery');
    const roomType = searchParams.get('roomType');

    if (roomType) setRoomTypeFilter(roomType);
    if (searchQueryParam) setSearchQuery(searchQueryParam);
  }, [searchParams]);

  const filterRooms = (roomsToFilter: Room[]) => {
    return roomsToFilter.filter(room => {
      if (
        roomTypeFilter &&
        roomTypeFilter.toLowerCase() !== "all" &&
        room.type.toLowerCase() !== roomTypeFilter.toLowerCase()
      ) {
        return false;
      }

      if (
        searchQuery &&
        !room.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredRooms = filterRooms(rooms);

  return (
    <div className="container mx-auto py-8 md:py-10">
      <div className="grid grid-cols-1 gap-4 md:gap-5 md:grid-cols-3">
        {filteredRooms.map(room => (
          <RoomCard key={room._id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomsClient;
