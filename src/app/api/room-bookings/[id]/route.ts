import { getRoomBookings } from "@/libs/apis";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: roomId } = await params;

  try {
    const bookings = await getRoomBookings(roomId);

    return NextResponse.json(bookings, {
      status: 200,
      statusText: "Succesful",
    });
  } catch (error) {
    console.log("Getting Booking Failed", error);
    return new NextResponse("Unable to fetch", { status: 400 });
  }
}
