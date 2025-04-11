import { FaCalendarCheck } from "react-icons/fa";
import { defineField } from "sanity";

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
            name: "children",
            title: "Children",
            type: "number",
            initialValue: 0,
            validation: Rule =>Rule.required().min(0),
        }),
        defineField({
            name: "totalPrice",
            title: "Total Price",
            type: "number",
            validation: Rule =>Rule.required().min(0),
        }),
    ],
    preview: {
        select: {
            user: 'user.name',
            checkinDate: 'checkinDate',
            checkoutDate: 'checkoutDate',
            // hotelRoom: 'hotelRoom.coverImage.image',
        },
        prepare(selection: {checkinDate: "date"; checkoutDate: "date"; user: "string" }) {
            const {checkinDate, checkoutDate, user} = selection
            return {
                title: `${user}`,
                subtitle: `${checkinDate} - ${checkoutDate}`,
                // media: hotelRoom,
            }
        }
    }
}

export default booking;
