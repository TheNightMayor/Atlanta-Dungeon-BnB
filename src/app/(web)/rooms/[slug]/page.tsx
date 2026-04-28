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
        <div className="flex flex-col items-center">


            <div className="p-10 container mx-auto mt-20 rounded-2xl border-2 border-tertiary-dark md:w-3/4 flex flex-col items-center">
                <div className="md:grid md:grid-cols-12 gap-10 px-3">
                    <div className="md:col-span-8 md:w-full">
                        <div>
                            <h2 className=" font-orbitron font-bold text-left text-lg md:text-2xl">
                                {room.name}
                            </h2>
                            <div className="flex my-11 justify-evenly ">
                                {room.offeredAmenities.map(amenity => (
                                    <div
                                        key={amenity._key}
                                        className="md:w-44 w-full text-center px-2 md:px-0 h-20 md:h-40 mr-3 bg-[#eff0f2] dark:bg-gray-800 rounded-lg grid place-content-center"
                                    >
                                        <i className={`fa-solid ${amenity.icon} md:text-2xl`}></i>
                                        <p className="text-xs md:text-base pt-3">
                                            {amenity.amenity}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mb-11">
                                <h2 className="font-orbitron font-bold text-3xl mb-2">
                                    Description
                                </h2>
                                <div>
                                    <PortableText value={room.description} components={portableTextComponents} />
                                </div>
                            </div>
                            <div className="mb-11">
                                <h2 className="font-orbitron font-bold text-3xl mb-2">
                                    Offered Amenities
                                </h2>
                                <div className="grid grid-cols-2">
                                    {room.offeredAmenities.map(amenity => (
                                        <div key={amenity._key}
                                            className="flex items-center md:my-0 my-1"
                                        >
                                            <i className={`fa-solid ${amenity.icon}`}
                                            ></i>
                                            <p className="text-xs md:text-base ml-2">
                                                {amenity.amenity}
                                            </p>

                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-11">
                                <h2 className="font-orbitron font-bold text-3xl mb-2">
                                    Safety and Hygiene
                                </h2>
                                <div className="grid grid-cols-2">
                                    <div className="flex items-center my-1 md:my-0">
                                        <MdOutlineCleaningServices />
                                        <p className="ml-2 md:text-base text-xs">Daily Cleaning</p>
                                    </div>
                                    <div className="flex items-center my-1 md:my-0">
                                        <LiaFireExtinguisherSolid />
                                        <p className="ml-2 md:text-base text-xs">Fire Extinguisher</p>
                                    </div>
                                    <div className="flex items-center my-1 md:my-0">
                                        <AiOutlineMedicineBox />
                                        <p className="ml-2 md:text-base text-xs">First Aid Kit</p>
                                    </div>
                                    <div className="flex items-center my-1 md:my-0">
                                        <GiSmokeBomb />
                                        <p className="ml-2 md:text-base text-xs">Disinfection and Sterilization</p>
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
                        <HotelPhotoGallery photos={room.images} />
                    </div>

                </div>

                {/* Per-room reviews removed; combined reviews shown on home page */}
            </div>

        </div>
    );
};

export default RoomDetails 