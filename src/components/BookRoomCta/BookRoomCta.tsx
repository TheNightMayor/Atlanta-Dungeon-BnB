'use client'
import Link from "next/link";
import { Dispatch, FC, SetStateAction } from "react"
import DatePicker from "react-datepicker"
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
    isBooked: boolean;
    handleBookNowClick: () => void
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
        isBooked,
        handleBookNowClick
    } = props;

    const discountPrice = price - (price / 100) * discount;

    const calcNoOfDays = () => {
        if (!checkinDate || !checkoutDate) return 0;
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        const noOfDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
        return noOfDays;
    }

    return (
        <div className="px-7 py-6">
            <h3>
                <span className={`${discount ? "text-gray-400" : ""} font-bold text-xl`}
                >
                    $ {price}/night {flatFee > 0 ? `+ $${flatFee} flat fee` : ''}
                </span>
                {discount ? (
                    <span className="font-bold text-xl">
                        {' '}
                        | discount {discount}%. Now{' '}
                        <span className="text-tertiary-dark">$ {discountPrice}</span>
                    </span>
                ) : (
                    ''
                )}
            </h3>

            <div className="w-full border-b-2 border-b-primary my-2" />
            <h4 className="my-8">{specialNote}</h4>
            <div className="flex">
                <div className="w1/2 pr-2">
                    <label
                        htmlFor="check-in-date"
                        className="block text-sm font-medium text-gray-900 dark:text-gray-400">
                        Check In
                    </label>
                    <DatePicker
                        disabled={isBooked}
                        selected={checkinDate}
                        onChange={date => setCheckinDate(date)}
                        dateFormat={"dd/MM/yyyy"}
                        minDate={new Date()}
                        id="check-in-date"
                        className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                </div>
                <div className="w1/2 pl-2">
                    <label
                        htmlFor="check-out-date"
                        className="block text-sm font-medium text-gray-900 dark:text-gray-400">
                        Check Out
                    </label>
                    <DatePicker
                        selected={checkoutDate}
                        onChange={date => setCheckoutDate(date)}
                        dateFormat={"dd/MM/yyyy"}
                        disabled={!checkinDate}
                        minDate={calcMinCheckoutDate()}
                        id="check-out-date"
                        className="w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div className="flex mt-4">
                <div className="w-1/2 pr-2">
                    <label
                        htmlFor="adults"
                        className="block text-sm font-medium text-gray-900 dark:text-gray-400">
                        Adults
                    </label>
                    <input
                        disabled={isBooked}
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
                        <div className="flex justify-between font-bold mt-2">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                );
            })()}
            <button
                onClick={handleBookNowClick}
                disabled={isBooked}
                className="flex btn-primary w-full mt-6 disabled:bg-gray-500 disabled:cursor-none justify-center whitespace-nowrap">
                {isBooked
                    ? <Link
                        href="mailto:Atlantakbnb@yahoo.com"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="whitespace-nowrap"
                    >
                        Contact Us
                    </Link>
                    : "Book Now"}
            </button>
        </div>
    );
};

export default BookRoomCta