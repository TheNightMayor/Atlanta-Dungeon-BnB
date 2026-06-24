'use client'
import Link from "next/link";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import { MdCancel } from "react-icons/md";
import { PortableText } from "next-sanity";
import { portableTextComponents } from '@/libs/portableTextComponents';
import { getInfoPageByInternalName } from "@/libs/apis";
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
    checkinDate: Date | null;
    setCheckinDate: Dispatch<SetStateAction<Date | null>>;
    checkoutDate: Date | null;
    setCheckoutDate: Dispatch<SetStateAction<Date | null>>;
    setAdults: Dispatch<SetStateAction<number>>;
    setNoOfChildren: Dispatch<SetStateAction<number>>;
    calcMinCheckoutDate: () => Date | undefined;
    price: number;
    discount: number;
    adults: number;
    noOfChildren: number;
    specialNote: string;
    flatFee: number;
    overnight?: boolean;
    instantBook: boolean;
    roomId: string;
    roomName?: string;
    handleBookNowClick: (discountCode?: string | null) => void
}

const BookRoomCta: FC<Props> = props => {
    const {
        price,
        flatFee,
        discount,
        specialNote,
        checkinDate,
        setCheckinDate,
        checkoutDate,
        setCheckoutDate,
        calcMinCheckoutDate,
        adults,
        setAdults,
        // noOfChildren,
        // setNoOfChildren,
        instantBook,
        roomId,
        roomName,
        handleBookNowClick
    } = props;
        const [discountCodeInput, setDiscountCodeInput] = useState<string>('');
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [applyError, setApplyError] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    // default to true (overnight allowed) when not provided
    const overnight = (props.overnight === undefined) ? true : props.overnight;

    const [liabilityPage, setLiabilityPage] = useState<null | { internalName: string; title: string; content: any[] }>(null);
    const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);
    const [hasReadStatement, setHasReadStatement] = useState(false);
    const [isOver18, setIsOver18] = useState(false);
    const [isLiabilityLoading, setIsLiabilityLoading] = useState(true);
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);

    const getDateRange = (startDate: Date, endDate: Date) => {
        const dates: Date[] = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    useEffect(() => {
        const fetchLiability = async () => {
            try {
                const data = await getInfoPageByInternalName("liability");
                setLiabilityPage(data);
            } catch (error) {
                console.error("Failed to load liability info page", error);
            } finally {
                setIsLiabilityLoading(false);
            }
        };

        fetchLiability();
    }, []);

    useEffect(() => {
        async function fetchBlocked() {
            try {
                const res = await fetch('/api/blocked-dates');
                if (!res.ok) return;
                const items: { date: string }[] = await res.json();
                const dates = (items || []).map(i => {
                    try {
                        const dstr = (i.date || '').split('T')[0];
                        const [y, m, d] = dstr.split('-').map(Number);
                        if (!y || !m || !d) return null;
                        return new Date(y, m - 1, d);
                    } catch {
                        const dt = new Date(i.date);
                        return isNaN(dt.getTime()) ? null : dt;
                    }
                }).filter((d: Date | null): d is Date => !!d);
                setBlockedDates(dates);
            } catch (err) {
                console.error('Failed to load blocked dates', err);
            }
        }

        async function fetchRoomBookings() {
            try {
                const res = await fetch(`/api/room-bookings/${roomId}`);
                if (!res.ok) return;
                const bookings: { checkinDate: string; checkoutDate: string }[] = await res.json();
                const dates: Date[] = [];

                bookings.forEach((booking) => {
                    const start = new Date(booking.checkinDate);
                    const end = new Date(booking.checkoutDate);
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
                    getDateRange(start, end).forEach((d) => dates.push(d));
                });

                setBookedDates(dates);
            } catch (err) {
                console.error('Failed to load room bookings', err);
            }
        }

        fetchBlocked();
        fetchRoomBookings();
    }, [roomId]);

    useEffect(() => {
        document.body.style.overflow = isLiabilityModalOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isLiabilityModalOpen]);

    const appliedPerNight = appliedDiscount ? Number(appliedDiscount.perNight || 0) : null;
    const discountPrice = appliedPerNight != null ? Math.max(0, price - appliedPerNight) : price - (price / 100) * discount;

    const formatDisplayDate = (d: Date | null) => {
        if (!d) return 'desired dates';
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    };

    const calcNoOfDays = () => {
        if (!checkinDate) return 0;
        if (!overnight) return 1;
        if (!checkoutDate) return 0;
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        const noOfDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
        return noOfDays;
    }

    const isBookNowDisabled = !instantBook || !checkinDate || (overnight && !checkoutDate) || adults < 1;

    return (
        <div className="px-7 py-4 bg-white dark:bg-slate-900 rounded-lg md:rounded-2xl shadow-[0_12px_30px_-16px_rgba(0,0,0,0.18)]">
            <h3>
                <span className="text-gray-400 font-bold text-xl">
                    $ {price}/night {flatFee > 0 ? `+ $${flatFee} flat fee` : ''}
                </span>
            </h3>

            <div className="w-full border-b-2 border-b-primary my-2" />
            <h4 className="my-6">{specialNote}</h4>
            <div className="flex">
                <div className={`${overnight ? 'w1/2 pr-2' : 'w-full pr-2'}`}>
                    <label
                        htmlFor="check-in-date"
                        className="block text-sm font-medium text-gray-900 dark:text-gray-400">
                        {instantBook ? 'Check In' : 'Desired date'}
                    </label>
                    <DatePicker
                        selected={checkinDate}
                        onChange={date => setCheckinDate(date)}
                        dateFormat={"MM/dd/yyyy"}
                        minDate={new Date()}
                        excludeDates={[...blockedDates, ...bookedDates]}
                        id="check-in-date"
                        className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                </div>
                {overnight && (
                    <div className="w1/2 pl-2">
                        <label
                            htmlFor="check-out-date"
                            className="block text-sm font-medium text-gray-900 dark:text-gray-400">
                            Check Out
                        </label>
                        <DatePicker
                            selected={checkoutDate}
                            onChange={date => setCheckoutDate(date)}
                            dateFormat={"MM/dd/yyyy"}
                            disabled={!checkinDate}
                            minDate={calcMinCheckoutDate()}
                            excludeDates={[...blockedDates, ...bookedDates]}
                            id="check-out-date"
                            className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                    </div>
                )}
            </div>
            <div className="flex mt-3">
                <div className="w-1/2 pr-2">
                    <label
                        htmlFor="adults"
                        className="block text-sm font-medium text-gray-900 dark:text-gray-400">
                        Adults
                    </label>
                    <input
                        
                        type="number"
                        id="adults"
                        value={adults}
                        onChange={(e) => setAdults(+e.target.value)}
                        min={1}
                        max={5}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                    />
                </div>
            </div>
            {(() => {
                const nights = calcNoOfDays();
                if (nights <= 0) return null;
                const subtotal = nights * discountPrice;
                const extraGuestCharge = adults > 2 ? (adults - 2) * 30 : 0;
                const totalPrice = subtotal + extraGuestCharge + flatFee;

                return (
                    <div className="mt-3">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal ({nights} night{nights > 1 ? 's' : ''})</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {extraGuestCharge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Extra guests</span>
                                <span>${extraGuestCharge.toFixed(2)}</span>
                            </div>
                        )}
                        {flatFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Flat fee</span>
                                <span>${flatFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold mt-1">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                );
            })()}
            {!instantBook ? (
                (() => {
                    const dateStr = (checkinDate ? (overnight && checkoutDate ? `${formatDisplayDate(checkinDate)} to ${formatDisplayDate(checkoutDate)}` : formatDisplayDate(checkinDate)) : 'desired dates');
                    const topic = `inquiry regarding ${roomName || 'accommodation'} on ${dateStr}`;
                    return (
                        <Link
                            href={`/contact?topic=${encodeURIComponent(topic)}`}
                            className="btn-tertiary-solid inline-flex w-full justify-center mt-4"
                            aria-label="Contact us"
                        >
                            Contact Us
                        </Link>
                    );
                })()
            ) : (
                <button
                    onClick={() => setIsLiabilityModalOpen(true)}
                    disabled={isBookNowDisabled}
                    aria-disabled={isBookNowDisabled}
                    className={`flex btn-primary w-full mt-6 disabled:bg-gray-500 disabled:cursor-not-allowed justify-center whitespace-nowrap ${!isBookNowDisabled ? 'hover:scale-110' : ''}`}>
                    Book Now
                </button>
            )}

            {isLiabilityModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/40 dark:bg-black/70 p-4"
                    onClick={() => setIsLiabilityModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 text-black dark:text-white w-full max-w-3xl rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[80vh] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsLiabilityModalOpen(false)}
                            aria-label="Close liability modal"
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <MdCancel className="text-2xl" />
                        </button>

                        <div className="mt-4 overflow-y-auto max-h-[62vh] pr-2 scrollbar-rounded">
                            {isLiabilityLoading ? (
                                <p className="mt-4">Loading liability statement...</p>
                            ) : liabilityPage ? (
                                <div className="space-y-4 text-gray-800 dark:text-gray-200">
                                    <p className="font-semibold">{liabilityPage.title}</p>
                                        <div className="prose prose-sm dark:prose-invert">
                                        <PortableText value={liabilityPage.content} components={portableTextComponents} />
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 text-red-600 dark:text-red-400">Liability statement not found.</p>
                            )}

                            <div className="mt-4 flex flex-col gap-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={hasReadStatement}
                                        onChange={e => setHasReadStatement(e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <span>I have read and understood this liability statement.</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isOver18}
                                        onChange={e => setIsOver18(e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <span>I confirm I am over 18 years old.</span>
                                </label>

                                {!instantBook ? (
                                    (() => {
                                        const dateStr = (checkinDate ? (overnight && checkoutDate ? `${formatDisplayDate(checkinDate)} to ${formatDisplayDate(checkoutDate)}` : formatDisplayDate(checkinDate)) : 'desired dates');
                                        const topic = `inquiry regarding ${roomName || 'accommodation'} on ${dateStr}`;
                                        return (
                                            <Link
                                                href={`/contact?topic=${encodeURIComponent(topic)}`}
                                                className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white text-center"
                                                aria-label="Contact us"
                                            >
                                                Contact Us
                                            </Link>
                                        );
                                    })()
                                ) : (
                                            <button
                                                onClick={() => {
                                                    setIsLiabilityModalOpen(false);
                                                    if (hasReadStatement && isOver18) {
                                                        handleBookNowClick(appliedDiscount?.code || discountCodeInput || null);
                                                    }
                                                }}
                                        disabled={!hasReadStatement || !isOver18}
                                        className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                    >
                                        Continue to payment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="mt-3 flex flex-col">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-400">Discount code</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                    <input
                        value={discountCodeInput}
                        onChange={e => {
                            setDiscountCodeInput(e.target.value);
                            setApplyError(null);
                        }}
                        className="w-1/2 grow border border-gray-300 rounded-lg p-2.5 text-gray-900 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Enter code"
                    />
                    <button
                        onClick={async () => {
                            setApplyError(null);
                            if (!discountCodeInput || discountCodeInput.trim().length === 0) {
                                setApplyError('Enter a code');
                                return;
                            }
                            setIsApplying(true);
                            try {
                                const res = await fetch('/api/discounts/validate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ code: discountCodeInput, price }),
                                });
                                const data = await res.json();
                                if (!res.ok) {
                                    setApplyError(data || 'Invalid code');
                                    setAppliedDiscount(null);
                                } else {
                                    setAppliedDiscount(data);
                                    setApplyError(null);
                                }
                            } catch (err) {
                                setApplyError('Validation failed');
                                setAppliedDiscount(null);
                            } finally {
                                setIsApplying(false);
                            }
                        }}
                        className="grow btn-tertiary-solid disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isApplying}
                    >
                        {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                </div>

                {applyError && <p className="text-sm text-red-600 mt-2">{applyError}</p>}

                {appliedDiscount && (
                    <div className="mt-2 flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <div className="text-sm">
                            <span className="font-semibold">Applied:</span> {appliedDiscount.code}
                            {appliedDiscount.perNight != null && (
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">- ${Number(appliedDiscount.perNight).toFixed(2)}/night</span>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setAppliedDiscount(null);
                                setDiscountCodeInput('');
                                setApplyError(null);
                            }}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookRoomCta