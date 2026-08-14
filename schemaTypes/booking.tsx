import React from 'react';
import { Any } from "next-sanity";
import { FaCalendarCheck } from "react-icons/fa";
import { defineField } from "sanity";
import ApproveBookingButton from '../studio/inputs/ApproveBookingButton';
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
            name: 'amountPaid',
            title: 'Amount Paid',
            type: 'number',
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: 'paymentReceivedAt',
            title: 'Payment Received At',
            type: 'datetime',
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: 'refundedAmount',
            title: 'Refunded Amount',
            type: 'number',
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: 'refundedAt',
            title: 'Refunded At',
            type: 'datetime',
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: "status",
            title: "Booking status",
            type: "string",
            initialValue: "pending approval",
            readOnly: true,
            hidden: true,
            options: {
                list: [
                    { title: "Pending approval", value: "pending approval" },
                    { title: "Approved", value: "approved" },
                        { title: "Rejected", value: "rejected" },
                        { title: "Cancelled", value: "cancelled" },
                ],
            },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'studioApprove',
            title: 'Approval',
            type: 'string',
            components: { input: ApproveBookingButton },
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
        defineField({
            name: "customerName",
            title: "Customer Name",
            type: "string",
            hidden: true,
        }),
    ],
    preview: {
        select: {
            checkinDate: 'checkinDate',
            checkoutDate: 'checkoutDate',
            user: 'user.name',
            status: 'status',
            hotelRoomName: 'hotelRoom.name',
        },
        prepare(value: Record<string, any>) {
            const { user, checkinDate, checkoutDate, hotelRoomImageUrl, hotelRoomImageAssetUrl, hotelRoomName, status } = value;

            // Small React component that renders a colored status dot for preview (no photo).
            const StatusDot = ({ status }: { status?: string }) => {
                const colorMap: Record<string, string> = {
                    approved: '#16a34a',
                    'pending approval': '#f59e0b',
                    rejected: '#dc2626',
                    cancelled: '#ef4444',
                    refunded: '#0ea5e9',
                    deleted: '#6b7280',
                };
                const bg = status ? colorMap[status] ?? '#9ca3af' : '#9ca3af';
                return (
                    <div style={{ width: 22, height: 22, borderRadius: 9999, background: bg, boxShadow: '0 0 0 2px rgba(255,255,255,0.8)' }} />
                );
            };

            return {
                title: `${checkinDate} - ${checkoutDate}`,
                subtitle: `${user ? user : 'unknown'} — ${hotelRoomName ? hotelRoomName : 'unknown'}`,
                media: <StatusDot status={status} />,
            };
        }
    }
}

export default booking;
