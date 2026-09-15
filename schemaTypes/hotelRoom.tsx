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
      title: "Slug",
      type: "slug",
      fieldset: 'identity',
      options: {
        source: "name",
      },
      description: 'URL-friendly identifier generated from the name (used in public links).\n\n',
      validation: (Rule) =>
        Rule.required().custom(async (slug: any, context: any) => {
          if (!slug || !slug.current) return 'Slug is required.';
          const pat = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
          if (!pat.test(slug.current)) return 'Slug must use only lowercase letters, numbers and hyphens.';
          try {
            const client = context.getClient({ apiVersion: '2023-05-13' });
            const docId = context.document?._id || '';
            const existing = await client.fetch('*[_type == "hotelRoom" && slug.current == $slug && _id != $id][0]', { slug: slug.current, id: docId });
            if (existing) return 'Slug is already in use by another accommodation.';
          } catch (err) {
            // ignore fetch errors — don't block validation on client issues
          }
          return true;
        }),
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
      title: "Publicly Listed",
      type: "boolean",
      fieldset: 'visibility',
      description: "When ON (true), this listing appears publicly in search and on the rooms page. When OFF (false), it is unlisted and only accessible to users with the direct link.",
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
      description: 'Base nightly price.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'includedGuests',
      title: 'Included Guests',
      type: 'number',
      fieldset: 'pricing',
      description: 'Guests included in base price.',
      initialValue: 2,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'extraGuestFee',
      title: 'Extra Guest Fee',
      type: 'number',
      fieldset: 'pricing',
      description: 'Per-guest fee above included guests.',
      initialValue: 30,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "flatFee",
      title: "Flat Fee",
      type: "number",
      fieldset: 'pricing',
      description: "One-time flat fee per booking.",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discounts",
      title: "Listing Discounts",
      type: "array",
      fieldset: "pricing",
      description: "Add one or more stacking discounts applied directly to this room listing.",
      of: [
        {
          type: "object",
          name: "listingDiscount",
          title: "Discount",
          fields: [
            {
              name: "title",
              title: "Label / Name",
              type: "string",
              description: 'e.g. "Seasonal Discount", "Weekday Special"',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Percentage (%)", value: "percentage" },
                  { title: "Fixed Per Night ($/night off)", value: "fixed_nightly" },
                  { title: "Fixed Total ($ off stay)", value: "fixed_total" },
                ],
              },
              initialValue: "percentage",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "value",
              title: "Value",
              type: "number",
              description: "Enter 10 for 10%, or 25 for $25 off",
              validation: (Rule: any) =>
                Rule.required()
                  .min(0)
                  .custom((val: number, context: any) => {
                    const parent = context?.parent;
                    if (parent?.type === "percentage" && val > 100) {
                      return "Percentage discount cannot exceed 100%";
                    }
                    return true;
                  }),
            },
            {
              name: "active",
              title: "Active",
              type: "boolean",
              initialValue: true,
            },
          ],
          preview: {
            select: {
              title: "title",
              type: "type",
              value: "value",
              active: "active",
            },
            prepare({ title, type, value, active }: any) {
              let label = `${value ?? 0}% off`;
              if (type === "fixed_nightly") label = `$${value ?? 0}/night off`;
              if (type === "fixed_total") label = `$${value ?? 0} total off`;
              return {
                title: title || "Listing Discount",
                subtitle: `${label} — ${active ? "Active" : "Inactive"}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "discount",
      title: "Legacy Discount (%)",
      type: "number",
      fieldset: "pricing",
      description: "Legacy single discount percentage (0-100). Prefer using the 'Listing Discounts' list above.",
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(100),
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
      description: "Optional. If left empty, default showcase photos will be used automatically.",
      of: [
        {
          type: "object",
          fields: [
            { name: "image", type: "image", title: "Image" },
          ],
          preview: {select: {media: 'image', title: 'image.asset.originalFilename'}}
        },
      ],
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "object",
      fieldset: 'photos',
      description: "Optional. If left empty, a default cover photo will be used automatically.",
      fields: [
        { name: "image", type: "image", title: "Image" },
      ],
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
    { name: 'identity', title: 'Identity', options: { columns: 2 } },
    { name: 'visibility', title: 'Visibility & Booking', options: { columns: 3 } },
    { name: 'pricing', title: 'Pricing', options: { columns: 2 } },
    { name: 'description', title: 'Description & Notes', options: { columns: 1 } },
    { name: 'photos', title: 'Photos', options: { columns: 2 } },
    { name: 'amenities', title: 'Amenities', options: { columns: 1 } },
  ],
};

export default hotelRoom;
