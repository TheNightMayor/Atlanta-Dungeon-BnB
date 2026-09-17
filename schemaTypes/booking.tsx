import React from 'react';
import { Any } from "next-sanity";
import { FaCalendarCheck } from "react-icons/fa";
import { defineField } from "sanity";
import ApproveBookingButton from '../studio/inputs/ApproveBookingButton';
import PriceBreakdownView from '../studio/inputs/PriceBreakdownView';
// import { PreviewProps } from "sanity";


const booking = {
    name: "booking",
    title: "Booking",
    icon: FaCalendarCheck,
    type: "document",
    fields: [
        // Checkout snapshot — captured at booking time; editing here does not
        // re-authorize payment, re-check availability, or resend emails.
        defineField({
            name: "user",
            title: "User",
            type: "reference",
            to: [{type: 'user' }],
            readOnly: true,
            fieldset: 'stay',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "hotelRoom",
            title: "Hotel Room",
            type: "reference",
            to: [{ type: "hotelRoom" }],
            readOnly: true,
            fieldset: 'stay',
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "checkinDate",
            title: "Check-in Date",
            type: "date",
            readOnly: true,
            fieldset: 'stay',
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "checkoutDate",
            title: "Check-out Date",
            type: "date",
            readOnly: true,
            fieldset: 'stay',
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "numberOfDays",
            title: "Number of Days",
            type: "number",
            initialValue: 1,
            readOnly: true,
            fieldset: 'stay',
            validation: Rule =>Rule.required().min(1),
        }),
        defineField({
            name: "discount",
            title: "Discount",
            type: "number",
            initialValue: 0,
            readOnly: true,
            fieldset: 'pricing',
            validation: Rule =>Rule.required().min(0),
        }),
        defineField({
            name: "discountCode",
            title: "Discount Code",
            type: "reference",
            to: [{ type: "discountCode" }],
            readOnly: true,
            fieldset: 'pricing',
            description: "The discount code applied to this booking",
        }),
        defineField({
            name: "adults",
            title: "Adults",
            type: "number",
            initialValue: 1,
            readOnly: true,
            fieldset: 'stay',
            validation: Rule =>Rule.required().min(1),
        }),
        defineField({
            name: "totalPrice",
            title: "Total Price",
            type: "number",
            readOnly: true,
            fieldset: 'pricing',
            description: "Amount to be charged to guest's card after applying all fees and discounts.",
            validation: Rule =>Rule.required().min(0),
        }),

        // Payment/lifecycle data — informational only, surfaced in the Approval panel below.
        defineField({
            name: "authorizedAmount",
            title: "Authorized Amount",
            type: "number",
            readOnly: true,
            hidden: true,
            description: "Amount authorized on the guest's card and awaiting capture.",
        }),
        defineField({
            name: "authorizedAt",
            title: "Authorized At",
            type: "datetime",
            readOnly: true,
            hidden: true,
            description: "When the guest's card was authorized at checkout.",
        }),
        defineField({
            name: "priceBreakdown",
            title: "Price Breakdown",
            type: "object",
            readOnly: true,
            fieldset: 'pricing',
            description: "Snapshot of the calculation used to determine the total price at checkout.",
            components: { input: PriceBreakdownView },
            fields: [
                defineField({ name: "baseRoomSubtotal", title: "Base Room Subtotal", type: "number" }),
                defineField({ name: "listingDiscounts", title: "Listing Discounts", type: "number" }),
                defineField({
                    name: "appliedListingDiscounts",
                    title: "Applied Listing Discounts",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            name: "appliedDiscount",
                            fields: [
                                { name: "title", title: "Title", type: "string" },
                                { name: "amount", title: "Amount", type: "number" },
                            ],
                        },
                    ],
                }),
                defineField({ name: "discountCodeSavings", title: "Discount Code Savings", type: "number" }),
                defineField({ name: "extraGuestCharge", title: "Extra Guest Charge", type: "number" }),
                defineField({ name: "flatFee", title: "Flat Fee", type: "number" }),
                defineField({ name: "total", title: "Calculated Total", type: "number" }),
            ],
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
                    { title: "Pending payment", value: "pending payment" },
                    { title: "Pending approval", value: "pending approval" },
                    { title: "Approved", value: "approved" },
                        { title: "Rejected", value: "rejected" },
                        { title: "Cancelled", value: "cancelled" },
                ],
            },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "invoiceBooking",
            title: "Invoice booking",
            type: "boolean",
            readOnly: true,
            hidden: true,
            description: "Indicates that this booking was created by an admin invoice workflow.",
        }),
        defineField({
            name: "checkoutUrl",
            title: "Checkout URL",
            type: "url",
            readOnly: true,
            hidden: true,
            description: "Hosted Stripe Checkout link for an invoice booking.",
        }),
        defineField({
            name: "checkoutExpiresAt",
            title: "Checkout Expires At",
            type: "datetime",
            readOnly: true,
            hidden: true,
            description: "When the hosted Stripe Checkout link expires.",
        }),
        defineField({
            name: 'studioApprove',
            title: 'Approval',
            type: 'string',
            components: { input: ApproveBookingButton },
        }),

        // Internal identifiers — never edited by hand, only read by API routes.
        defineField({
            name: "stripePaymentIntentId",
            title: "Stripe Payment Intent ID",
            type: "string",
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: "stripeSessionId",
            title: "Stripe Session ID",
            type: "string",
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: "customerEmail",
            title: "Customer Email",
            type: "string",
            readOnly: true,
            hidden: true,
        }),
        defineField({
            name: "customerName",
            title: "Customer Name",
            type: "string",
            readOnly: true,
            hidden: true,
        }),
    ],
    fieldsets: [
        { name: 'stay', title: 'Stay Details', options: { columns: 2 } },
        { name: 'pricing', title: 'Pricing Snapshot', options: { columns: 2, collapsible: true, collapsed: true } },
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
