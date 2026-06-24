import { Any } from "next-sanity";
import { FaCalendarCheck } from "react-icons/fa";
import { defineField } from "sanity";
// import { PreviewProps } from "sanity";


const booking = {
    name: "booking",
    title: "Booking",
    icon: FaCalendarCheck,
    type: "document",
    fields: [
        defineField({
            name: "user",
            title: "User",
            type: "reference",
            to: [{type: 'user' }],
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "hotelRoom",
            title: "Hotel Room",
            type: "reference",
            to: [{ type: "hotelRoom" }],
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "checkinDate",
            title: "Check-in Date",
            type: "date",
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "checkoutDate",
            title: "Check-out Date",
            type: "date",
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "numberOfDays",
            title: "Number of Days",
            type: "number",
            initialValue: 1,
            validation: Rule =>Rule.required().min(1),
        }),
        defineField({
            name: "discount",
            title: "Discount",
            type: "number",
            initialValue: 0,
            validation: Rule =>Rule.required().min(0),
        }),
        defineField({
            name: "adults",
            title: "Adults",
            type: "number",
            initialValue: 1,
            validation: Rule =>Rule.required().min(1),
        }),
        defineField({
            name: "totalPrice",
            title: "Total Price",
            type: "number",
            validation: Rule =>Rule.required().min(0),
        }),
        defineField({
            name: "status",
            title: "Booking status",
            type: "string",
            initialValue: "pending approval",
            options: {
                list: [
                    { title: "Pending approval", value: "pending approval" },
                    { title: "Approved", value: "approved" },
                    { title: "Rejected", value: "rejected" },
                ],
            },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "stripePaymentIntentId",
            title: "Stripe Payment Intent ID",
            type: "string",
            hidden: true,
        }),
        defineField({
            name: "stripeSessionId",
            title: "Stripe Session ID",
            type: "string",
            hidden: true,
        }),
        defineField({
            name: "customerEmail",
            title: "Customer Email",
            type: "string",
            hidden: true,
        }),
    ],
    preview: {
        select: {
            checkinDate: 'checkinDate',
            checkoutDate: 'checkoutDate',
            user: 'user.name',
            hotelRoom: 'hotelRoom.coverImage.image',
            type: 'hotelRoom.type',
        },
        prepare(value: Record<string, any>) {
            const { user, checkinDate, checkoutDate, hotelRoom, type } = value;
            return {
                title: `${checkinDate} - ${checkoutDate}`,
                subtitle: `${user ? user : 'unknown'} - ${type ? type : 'unknown'}`,
                media: hotelRoom,
            };
        }
    }
}

export default booking;
