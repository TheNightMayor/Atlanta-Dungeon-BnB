import React from "react";
import { FaBed } from "react-icons/fa";
import { defineField } from "sanity";
import IconGridPicker from "../studio/inputs/IconGridPicker";
import PublicUrlInput from "../studio/inputs/PublicUrlInput";
import ICONS from "../studio/inputs/iconList";
import AMENITY_ICON_MAP from "../studio/inputs/amenityIconMap";
import AmenityGridPicker from "../studio/inputs/AmenityGridPicker";
import OfferedAmenitiesPicker from "../studio/inputs/OfferedAmenitiesPicker";

// room type removed — visibility toggles now replace this field

// amenities list moved to studio/inputs/amenities.ts as AMENITIES

const hotelRoom = {
  name: "hotelRoom",
  title: "Accommodation",
  type: "document",
  icon: FaBed,
  fields: [
    // Identity section
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: 'Public display name for the accommodation (shown on listings and pages).',
      fieldset: 'identity',
      validation: (Rule) =>
        Rule.required().max(50).error("Maximum 50 Characters"),
    }),
    defineField({
      name: "slug",
      type: "slug",
      fieldset: 'identity',
      options: {
        source: "name",
      },
      description: 'URL-friendly identifier generated from the name (used in public links).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publicUrl',
      title: 'Public URL',
      type: 'url',
      fieldset: 'identity',
      description: 'Read-only link to the front-end page for this accommodation',
      readOnly: true,
      components: { input: PublicUrlInput },
    }),

    // Visibility / booking toggles
    defineField({
      name: "instantBook",
      title: "Instant Book",
      type: "boolean",
      fieldset: 'visibility',
      description: "Enable to allow users to instantly book this accommodation",
      initialValue: true,
    }),
    defineField({
      name: "visibleToUsers",
      title: "Visible to users",
      type: "boolean",
      fieldset: 'visibility',
      description: "Controls whether this accommodation is visible to site users",
      initialValue: true,
    }),
    defineField({
      name: "overnight",
      title: "Overnight?",
      type: "boolean",
      fieldset: 'visibility',
      description: "Indicates whether this accommodation allows overnight stays",
      initialValue: true,
    }),

    // Pricing section (placed above description)
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      fieldset: 'pricing',
      description: 'Base nightly price (in the site currency).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "flatFee",
      title: "Flat Fee",
      type: "number",
      fieldset: 'pricing',
      description: "One-time flat fee added to each booking (e.g. cleaning or service fee)",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discount",
      title: "Discount",
      type: "number",
      fieldset: 'pricing',
      description: 'Discount amount applied to bookings for this accommodation (absolute value).',
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'discountCodes',
      title: 'Discount Codes',
      type: 'array',
      fieldset: 'pricing',
      of: [
        {
          type: 'reference',
          to: [{ type: 'discountCode' }],
        },
      ],
      description: 'Reference discount codes that apply to this accommodation',
    }),

    // Description section
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      fieldset: 'description',
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required().min(1).error("Please provide a description."),
    }),
    // Photos section
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      fieldset: 'photos',
      of: [
        {
          type: "object",
          fields: [
            { name: "image", type: "image", title: "Image" },
          ],
          preview: {select: {media: 'image', title: 'image.asset.originalFilename'}}
        },
      ],
      validation: (Rule) =>
        Rule.required().min(3).error("Minimum of 3 images required"),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "object",
      fieldset: 'photos',
      fields: [
        { name: "image", type: "image", title: "Image" },
      ],
      validation: (Rule) => Rule.required().error("Cover Image is required"),
    }),
    // `type` field removed — use `instantBook`, `visibleToUsers`, and `overnight` instead
    defineField({
      name: "specialNote",
      title: "Special Note",
      type: "text",
      fieldset: 'description',
      description: 'Short note for staff or guests (check-in/check-out instructions, important notices).',
      validation: (Rule) => Rule.required(),
      initialValue:
        "Check-in time is noon, checkout is at midnight. If any items are left behind, contact management",
    }),
    
    // Amenities section
    defineField({
      name: "offeredAmenities",
      title: "Offered Amenities",
      type: "array",
      fieldset: 'amenities',
      components: { input: OfferedAmenitiesPicker },
      of: [
        {
          type: 'reference',
          to: [{ type: 'amenity' }],
        },
      ],
    }),
    defineField({
      name: "reviews",
      title: "Reviews",
      type: "array",
      of: [
        {
          type: "reference",
          to: [
            {
              type: 'review',
            },
          ],
          options: {
            filter: 'hotelRoom == $hotelRoom',
            filterParams: {hotelRoom: 'hotelRoom'}
          }
         },
        ],
    }),
  ],
  fieldsets: [
    { name: 'identity', title: 'Identity', options: { columns: 1 } },
    { name: 'visibility', title: 'Visibility & Booking', options: { columns: 3 } },
    { name: 'pricing', title: 'Pricing', options: { columns: 2 } },
    { name: 'description', title: 'Description & Notes', options: { columns: 1 } },
    { name: 'photos', title: 'Photos', options: { columns: 2 } },
    { name: 'amenities', title: 'Amenities', options: { columns: 1 } },
  ],
};

export default hotelRoom;
