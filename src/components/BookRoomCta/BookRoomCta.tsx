'use client';

import Link from "next/link";
import { useSession } from 'next-auth/react';
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import useRoomAvailability from '@/hooks/useRoomAvailability';
import DatePicker from "react-datepicker"
import { MdCancel } from "react-icons/md";
import { PortableText } from "next-sanity";
import { portableTextComponents } from '@/libs/portableTextComponents';
import { getInfoPageByInternalName } from "@/libs/apis";
import { ListingDiscount } from "@/models/room";
import { calculateListingDiscountsSavings } from "@/libs/discount";
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
    checkinDate: Date | null;
    setCheckinDate: Dispatch<SetStateAction<Date | null>>;
    checkoutDate: Date | null;
    setCheckoutDate: Dispatch<SetStateAction<Date | null>>;
    setAdults: Dispatch<SetStateAction<number>>;
    calcMinCheckoutDate: () => Date | undefined;
    price: number;
    discount?: number;
    discounts?: ListingDiscount[];
    adults: number;
    
    specialNote: string;
    flatFee: number;
    overnight?: boolean;
    instantBook: boolean;
    includedGuests?: number;
    extraGuestFee?: number;
    roomId: string;
    roomName?: string;
    handleBookNowClick: (discountCode?: string | null) => void
}

const BookRoomCta: FC<Props> = props => {
    const {
        price,
        flatFee,
        discount,
        discounts,
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
    const { blockedDates: blockedKeys, isBlocked, loading: availabilityLoading } = useRoomAvailability(roomId);

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

    // build exclude list from room availability hook (keys are YYYY-MM-DD)
    const keyToDate = (key: string) => {
        const [y, m, d] = key.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const excludeCombinedDates = blockedKeys.map(k => keyToDate(k));

    useEffect(() => {
        document.body.style.overflow = isLiabilityModalOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isLiabilityModalOpen]);

    const calcNoOfDays = () => {
        if (!checkinDate) return 0;
        if (!overnight) return 1;
        if (!checkoutDate) return 0;
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        const noOfDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
        return noOfDays;
    }

    const nights = calcNoOfDays();
    const appliedPerNight = appliedDiscount ? Number(appliedDiscount.perNight || 0) : 0;
    const { totalSavings: listingSavings, breakdown: listingDiscountsBreakdown } = calculateListingDiscountsSavings(
        discounts,
        discount,
        price,
        nights > 0 ? nights : 1
    );

    const baseRoomSubtotal = price * (nights > 0 ? nights : 1);
    const promoCodeSavings = appliedPerNight * (nights > 0 ? nights : 1);
    const finalSubtotal = nights > 0 ? Math.max(0, baseRoomSubtotal - listingSavings - promoCodeSavings) : 0;

    const formatDisplayDate = (d: Date | null) => {
        if (!d) return 'desired dates';
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    };

    const { data: session } = useSession();
    const isAuthenticated = !!session?.user?.name;

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
                    {(() => {
                        const excludeCombined = excludeCombinedDates;
                        const excludeSet = new Set(blockedKeys);

                        const handleCheckinChange = (date: Date | null) => {
                            if (!date) return setCheckinDate(null);
                                const key = date.toISOString().split('T')[0];
                                if (excludeSet.has(key)) return;
                            setCheckinDate(date);
                        };

                        return (
                            <DatePicker
                                selected={checkinDate}
                                onChange={handleCheckinChange}
                                filterDate={(d) => {
                                    const key = d && d.toISOString().split('T')[0];
                                    return !excludeSet.has(key);
                                }}
                                
                                dateFormat={"MM/dd/yyyy"}
                                minDate={new Date()}
                                excludeDates={excludeCombined}
                                id="check-in-date"
                                className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                        );
                    })()}
                </div>
                {overnight && (
                    <div className="w1/2 pl-2">
                        <label
                            htmlFor="check-out-date"
                            className="block text-sm font-medium text-gray-900 dark:text-gray-400">
                            Check Out
                        </label>
                        {(() => {
                            const excludeCombined = excludeCombinedDates;
                            const excludeSet = new Set(blockedKeys);

                            const handleCheckoutChange = (date: Date | null) => {
                                if (!date) return setCheckoutDate(null);
                                const key = date.toISOString().split('T')[0];
                                if (excludeSet.has(key)) return;
                                setCheckoutDate(date);
                            };

                            return (
                                <DatePicker
                                    selected={checkoutDate}
                                    onChange={handleCheckoutChange}
                                    filterDate={(d) => {
                                        const key = d && d.toISOString().split('T')[0];
                                        return !excludeSet.has(key);
                                    }}
                                    
                                    dateFormat={"MM/dd/yyyy"}
                                    disabled={!checkinDate}
                                    minDate={calcMinCheckoutDate()}
                                    excludeDates={excludeCombined}
                                    id="check-out-date"
                                    className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                            );
                        })()}
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
                if (nights <= 0) return null;
                const included = props.includedGuests ?? 2;
                const perExtra = props.extraGuestFee ?? 30;
                const extraGuestCharge = adults > included ? (adults - included) * perExtra : 0;
                const totalPrice = finalSubtotal + extraGuestCharge + flatFee;
                const totalSavings = listingSavings + promoCodeSavings;

                return (
                    <div className="mt-3">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal ({nights} night{nights > 1 ? 's' : ''})</span>
                            <span>${finalSubtotal.toFixed(2)}</span>
                        </div>
                        {totalSavings > 0 && (
                            <details className="text-xs my-1 group">
                                <summary className="cursor-pointer text-green-600 dark:text-green-400 font-medium select-none hover:underline flex items-center justify-between">
                                    <span>Discounts applied</span>
                                    <span>- ${totalSavings.toFixed(2)} ▾</span>
                                </summary>
                                <div className="pl-2 mt-1 border-l-2 border-green-500/30 space-y-0.5 text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Base rate ({nights} night{nights > 1 ? 's' : ''} @ ${price})</span>
                                        <span>${baseRoomSubtotal.toFixed(2)}</span>
                                    </div>
                                    {listingDiscountsBreakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-green-600 dark:text-green-400">
                                            <span>{item.title}</span>
                                            <span>- ${item.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {promoCodeSavings > 0 && (
                                        <div className="flex justify-between text-green-600 dark:text-green-400">
                                            <span>Promo Code ({appliedDiscount?.code})</span>
                                            <span>- ${promoCodeSavings.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
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
                        <div className="flex justify-between font-bold mt-1 text-base border-t border-gray-300 dark:border-gray-600 pt-1">
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
                !isAuthenticated ? (
                    <Link
                        href="/auth"
                        className={`flex btn-primary w-full mt-6 justify-center whitespace-nowrap`}
                        aria-label="log in to book"
                    >
                        log in to book
                    </Link>
                ) : (
                    <button
                        onClick={() => setIsLiabilityModalOpen(true)}
                        disabled={isBookNowDisabled}
                        aria-disabled={isBookNowDisabled}
                        className={`flex btn-primary w-full mt-6 disabled:bg-gray-500 disabled:cursor-not-allowed justify-center whitespace-nowrap ${!isBookNowDisabled ? 'hover:scale-110' : ''}`}>
                        Book Now
                    </button>
                )
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

                                {instantBook && (
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                                            Discount / Promo Code
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            <input
                                                value={discountCodeInput}
                                                onChange={e => {
                                                    setDiscountCodeInput(e.target.value);
                                                    setApplyError(null);
                                                }}
                                                className="w-1/2 grow border border-gray-300 dark:border-gray-600 dark:bg-slate-800 rounded-lg p-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                                placeholder="Enter promo code"
                                            />
                                            <button
                                                type="button"
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
                                                            body: JSON.stringify({ code: discountCodeInput, price, numberOfDays: nights > 0 ? nights : 1 }),
                                                        });
                                                        const data = await res.json().catch(() => null);
                                                        if (!res.ok) {
                                                            setApplyError((data && data.error) ? data.error : 'Invalid code');
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
                                                className="btn-tertiary-solid text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                                disabled={isApplying}
                                            >
                                                {isApplying ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>

                                        {applyError && <p className="text-xs text-red-600 mt-1.5">{applyError}</p>}

                                        {appliedDiscount && (
                                            <div className="mt-2 flex items-center justify-between bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-2.5 py-1.5 rounded-lg">
                                                <div className="text-xs text-green-800 dark:text-green-300">
                                                    <span className="font-semibold">Applied:</span> {appliedDiscount.code}
                                                    {appliedDiscount.totalDiscount != null ? (
                                                        <span className="ml-1.5">(-${Number(appliedDiscount.totalDiscount).toFixed(2)} total)</span>
                                                    ) : appliedDiscount.perNight != null ? (
                                                        <span className="ml-1.5">(-${Number(appliedDiscount.perNight).toFixed(2)}/night)</span>
                                                    ) : null}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAppliedDiscount(null);
                                                        setDiscountCodeInput('');
                                                        setApplyError(null);
                                                    }}
                                                    className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}

                                        {(() => {
                                            if (nights <= 0) return null;
                                            const included = props.includedGuests ?? 2;
                                            const perExtra = props.extraGuestFee ?? 30;
                                            const extraGuestCharge = adults > included ? (adults - included) * perExtra : 0;
                                            const modalTotalPrice = finalSubtotal + extraGuestCharge + flatFee;

                                            return (
                                                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs space-y-1">
                                                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                                        <span>Room Rate ({nights} night{nights > 1 ? 's' : ''})</span>
                                                        <span>${finalSubtotal.toFixed(2)}</span>
                                                    </div>
                                                    {extraGuestCharge > 0 && (
                                                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                                            <span>Extra guests</span>
                                                            <span>${extraGuestCharge.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {flatFee > 0 && (
                                                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                                            <span>Flat fee</span>
                                                            <span>${flatFee.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-1 border-t border-gray-300 dark:border-gray-600">
                                                        <span>Total to charge</span>
                                                        <span>${modalTotalPrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {!instantBook ? (
                                    (() => {
                                        const dateStr = (checkinDate ? (overnight && checkoutDate ? `${formatDisplayDate(checkinDate)} to ${formatDisplayDate(checkoutDate)}` : formatDisplayDate(checkinDate)) : 'desired dates');
                                        const topic = `inquiry regarding ${roomName || 'accommodation'} on ${dateStr}`;
                                        return (
                                            <Link
                                                href={`/contact?topic=${encodeURIComponent(topic)}`}
                                                className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white text-center mt-2"
                                                aria-label="Contact us"
                                            >
                                                Contact Us
                                            </Link>
                                        );
                                    })()
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLiabilityModalOpen(false);
                                            if (hasReadStatement && isOver18) {
                                                handleBookNowClick(appliedDiscount?.code || discountCodeInput || null);
                                            }
                                        }}
                                        disabled={!hasReadStatement || !isOver18}
                                        className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400 mt-2"
                                    >
                                        Continue to payment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookRoomCta;
