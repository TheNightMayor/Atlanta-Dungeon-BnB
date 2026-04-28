'use client';

import useSWR from "swr";
import { MdOutlineCleaningServices } from "react-icons/md";
import { LiaFireExtinguisherSolid } from "react-icons/lia";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { GiSmokeBomb } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';

import { getInfoPageByInternalName } from "@/libs/apis";
import LoadingSpinner from "../../loading";
import HotelPhotoGallery from "@/components/HotelPhotoGallery/HotelPhotoGallery";
import { Room } from '@/models/room';
import BookRoomCta from "@/components/BookRoomCta/BookRoomCta";
import toast from "react-hot-toast";
import axios from "axios";
import { getStripe } from "@/libs/stripe";
// Room reviews removed from individual room pages; use combined reviews on home page
import { PortableText } from "next-sanity";
import { portableTextComponents } from '@/libs/portableTextComponents';

const RulesSection = () => {
    const [rulesInfo, setRulesInfo] = useState<null | { internalName: string; title: string; content: any[] }>(null);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const data = await getInfoPageByInternalName('rules');
                setRulesInfo(data);
            } catch (err) {
                console.error('Failed to load rules info page', err);
            }
        };
        fetchRules();
    }, []);

    if (!rulesInfo) return null;

    return (
        <div className="mb-11 border-2 border-tertiary-dark rounded-lg p-4">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-3 font-orbitron font-bold text-3xl mb-2"
                aria-expanded={isOpen}
            >
                <span>Rules</span>
                <span className="text-2xl" aria-hidden>{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen ? (
                <div>
                    <PortableText value={rulesInfo.content} components={portableTextComponents} />
                </div>
            ) : null}
        </div>
    );
};

// import RoomBooking from "@/components/RoomBooking/RoomBooking";

const RoomDetails = () => {
    const slug = useParams()?.slug as string | undefined;

    const [checkinDate, setCheckinDate] = useState<Date | null>(null);
    const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
    const [adults, setAdults] = useState(1);
    const [noOfChildren, setNoOfChildren] = useState(0);

    const fetchRoom = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch room');
        return res.json() as Promise<Room>;
    };

    const { data: room, error, isLoading } = useSWR<Room>(slug ? `/api/room/${slug}` : null, fetchRoom);

    if (!slug || !room) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-center text-red-600">Unable to load room details.</div>;
    }

    const calcMinCheckoutDate = () => {
        if (checkinDate) {
            const nextDay = new Date(checkinDate);
            nextDay.setDate(nextDay.getDate() + 1);
            return nextDay;
        }
        return undefined;
    };

    const handleBookNowClick = async (discountCode?: string | null) => {
        if (!checkinDate || (room.overnight && !checkoutDate))
            return toast.error("Please provide checkin" + (room.overnight ? " / checkout dates" : " date"));

        if (room.overnight && checkinDate && checkoutDate && checkinDate > checkoutDate)
            return toast.error("Please choose a valid checkin period");

        const numberOfDays = calcNumDays();

        const hotelRoomSlug = room.slug.current;

        const stripe = await getStripe();

        try {
            const { data: stripeSession } = await axios.post('/api/stripe', {
                checkinDate,
                checkoutDate,
                adults,
                children: noOfChildren,
                numberOfDays,
                hotelRoomSlug,
                price: room.price,
                flatFee: room.flatFee ?? 0,
                discount: room.discount,
                discountCode: discountCode ?? null,
            });

            if (stripe) {
                const result = await stripe.redirectToCheckout({
                    sessionId: stripeSession.id,

                });

                if (result.error) {
                    toast.error("Payment Failed");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("an error occurred");
        }
    };

    const calcNumDays = () => {
        if (!checkinDate) return;
        if (!room.overnight) return 1;
        if (!checkoutDate) return;
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        const noOfDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
        return noOfDays;
    }

    return (
        <div className="w-full overflow-x-hidden flex flex-col items-center">


            <div className="container mx-auto w-full px-4 py-4 md:px-10 md:py-8 mt-2 md:mt-20 rounded-2xl border-2 border-tertiary-dark md:w-3/4 flex flex-col items-center overflow-x-hidden">
                <div className="md:grid md:grid-cols-12 gap-10 px-3 w-full">
                    <div className="md:col-span-8 md:w-full">
                        <div>
                            <h2 className="font-orbitron font-bold text-left text-lg md:text-2xl break-words max-w-full">
                                {room.name}
                            </h2>
                            <HotelPhotoGallery photos={room.images} />
                            <div>
                                <PortableText value={room.description} components={portableTextComponents} />
                            </div>
                            <div className="mb-11">
                                <h3 className="font-orbitron font-bold text-xl mb-2 break-words max-w-full">
                                    Safety and Hygiene
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center my-1 md:my-0">
                                        <MdOutlineCleaningServices />
                                        <p className="ml-2 md:text-base text-xs break-words max-w-full">Daily Cleaning</p>
                                    </div>
                                    <div className="flex items-center my-1 md:my-0">
                                        <LiaFireExtinguisherSolid />
                                        <p className="ml-2 md:text-base text-xs break-words max-w-full">Fire Extinguisher</p>
                                    </div>
                                    <div className="flex items-center my-1 md:my-0">
                                        <AiOutlineMedicineBox />
                                        <p className="ml-2 md:text-base text-xs break-words max-w-full">First Aid Kit</p>
                                    </div>
                                    <div className="flex items-center my-1 md:my-0">
                                        <GiSmokeBomb />
                                        <p className="ml-2 md:text-base text-xs break-words max-w-full">Disinfection and Sterilization</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <RulesSection />
                    </div>
                    <div className="md:col-span-4 z-20 rounded-xl border-2 border-tertiary-dark md:sticky top-40 my-2 h-fit overflow-visible">
                        <BookRoomCta
                            discount={room.discount}
                            flatFee={room.flatFee ?? 0}
                            price={room.price}
                            specialNote={room.specialNote}
                            checkinDate={checkinDate}
                            setCheckinDate={setCheckinDate}
                            checkoutDate={checkoutDate}
                            setCheckoutDate={setCheckoutDate}
                            calcMinCheckoutDate={calcMinCheckoutDate}
                            adults={adults}
                            setAdults={setAdults}
                            noOfChildren={noOfChildren}
                            setNoOfChildren={setNoOfChildren}
                            overnight={room.overnight ?? true}
                            instantBook={room.instantBook}
                            roomName={room.name}
                            handleBookNowClick={handleBookNowClick}
                        />
                    </div>

                    <div className="col-span-12 md:col-start-1 md:col-span-12">
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 my-6 w-full">
                            {room.offeredAmenities.map(amenity => (
                                <div
                                    key={amenity._key}
                                    className="text-center px-2 md:px-0 h-20 md:h-40 bg-[#eff0f2] dark:bg-gray-800 rounded-lg grid place-content-center"
                                >
                                    <i className={`fa-solid ${amenity.icon} md:text-2xl`}></i>
                                    <p className="text-xs md:text-base pt-3 break-words max-w-full">
                                        {amenity.amenity}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Per-room reviews removed; combined reviews shown on home page */}
            </div>

        </div>
    );
};

export default RoomDetails 