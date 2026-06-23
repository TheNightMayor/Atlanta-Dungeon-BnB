'use client';

import useSWR from "swr";
import { MdOutlineCleaningServices } from "react-icons/md";
import { LiaFireExtinguisherSolid } from "react-icons/lia";
import { AiOutlineMedicineBox, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
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
        <div className="card-border-p4">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-3 font-orbitron font-bold text-3xl mb-2"
                aria-expanded={isOpen}
            >
                <span>Rules</span>
                {isOpen ? (
                    <AiOutlineMinus className="text-3xl" aria-hidden="true" />
                ) : (
                    <AiOutlinePlus className="text-3xl" aria-hidden="true" />
                )}
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
        <div className="w-full overflow-x-hidden overflow-y-visible flex flex-col items-center pb-10">


            <div className="container mx-auto w-full px-4 py-4 md:px-10 md:py-8 mt-2 md:mt-20 rounded-2xl border-2 border-tertiary-dark md:w-3/4 flex flex-col items-center overflow-x-hidden overflow-y-visible pb-10">
                <div className="md:grid md:grid-cols-12 gap-10 px-3 w-full room-details-grid">
                    <div className="md:col-span-8 md:w-full room-main">
                        <div>
                            <h2 className="font-orbitron font-bold text-left text-lg md:text-2xl break-words max-w-full">
                                {room.name}
                            </h2>
                            <div className="desktop-portrait-cta-show hidden mb-6 portrait-cta-wrapper">
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
                    <div className="md:col-span-4 z-20 rounded-xl border-2 border-tertiary-dark md:fixed md:top-[224px] md:left-[70%] lg:left-[70%] xl:left-[65%] 2xl:left-[60%] w-[10rem] md:w-[13rem] lg:w-[16rem] xl:w-[24rem] 2xl:w-[28rem] self-start my-2 h-fit overflow-visible room-cta desktop-portrait-cta-hide">
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 my-6 w-full justify-items-center">
                            {room.offeredAmenities.map(amenity => (
                                <div
                                    key={amenity._key}
                                    className="text-center w-full max-w-[9rem] aspect-square bg-[#eff0f2] dark:bg-gray-800 rounded-lg grid place-content-center"
                                >
                                    <i className={`fa-solid ${amenity.icon} text-xl md:text-2xl`} />
                                    <p className="text-[12px] md:text-sm pt-2 break-words max-w-full leading-tight">
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