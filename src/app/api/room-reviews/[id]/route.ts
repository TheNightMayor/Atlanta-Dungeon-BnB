import { getRoomReviews } from "@/libs/apis";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: roomId } = await params;

  try {
    const roomReviews = await getRoomReviews(roomId);

    return NextResponse.json(roomReviews, {
      status: 200,
      statusText: "Succesful",
    });
  } catch (error) {
    console.log("Getting Review Failed", error);
    return new NextResponse("Unable to fetch", { status: 400 });
  }
}
