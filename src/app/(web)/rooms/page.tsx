/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRooms } from "@/libs/apis";
import RoomsClient from "@/components/Rooms/RoomsClient";

export const metadata = {
  title: 'Browse Themed Rooms | Dungeon Next Door',
  description: 'Explore immersive Atlanta rooms with unique themes, flexible booking, and curated guest experiences.',
  openGraph: {
    title: 'Browse Themed Rooms | Dungeon Next Door',
    description: 'Explore immersive Atlanta rooms with unique themes, flexible booking, and curated guest experiences.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Themed Rooms | Dungeon Next Door',
    description: 'Explore immersive Atlanta rooms with unique themes, flexible booking, and curated guest experiences.',
  },
};

const Rooms = async () => {
  const rooms = await getRooms();

  return <RoomsClient rooms={rooms} />;
};

export default Rooms;
