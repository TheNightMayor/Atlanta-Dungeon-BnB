import React from "react";
import { FaBed } from "react-icons/fa";
import { defineField } from "sanity";
import IconGridPicker from "../studio/inputs/IconGridPicker";
import PublicUrlInput from "../studio/inputs/PublicUrlInput";
import ICONS from "../studio/inputs/iconList";
import AMENITY_ICON_MAP from "../studio/inputs/amenityIconMap";
const roomTypes = [
  { title: "Private", value: "private" },
  { title: "Content", value: "content" },
  { title: "Event", value: "event" },
];

const amenities = [
  {title: "Sunshine", value: "sunshine", icon: "GiSunbeams"},
  {title: "Haunted", value: "haunted"},
  {title: "Central Air Conditioning", value: "ac"},
  {title: "Central Heating", value: "heat"},
  {title: "WiFi", value: "wifi"},
  {title: "Kitchen", value: "kitchen"},
  {title: "Refrigerator", value: "fridge"},
  {title: "Microwave", value: "microwave"},
  {title: "Cooking Basics", value: "cooking"},
  {title: "Dishes and Silverware", value: "dishes"},
  {title: "Dishwasher", value: "dishwasher"},
  {title: "Stove", value: "stove"},
  {title: "Oven", value: "oven"},
  {title: "Keurig", value: "keurig"},
  {title: "Wine Glasses", value: "glasses"},
  {title: "Dining Table", value: "table"},
  {title: "Shared Backyard", value: "yard"},
  {title: "Fire Pit", value: "fire"},
  {title: "On-Site Parking", value: "onsiteparking"},
  {title: "Street Parking", value: "streetparking"},
  {title: "Self check-in", value: "selfcheckin"},
  {title: "Keypad", value: "keypad"},
  {title: "Outdoor Security Cameras", value: "cameras"},
  {title: "Smoke Alarm", value: "smokealarm"},
  {title: "Carbon Monoxide Alarm", value: "coalarm"},
  {title: "Fire Extinguisher", value: "fireextinguisher"},
  {title: "First Ait Kit", value: "firstaid"},
  {title: "Bed Linens", value: "linens"},
  {title: "Blackout Curtains", value: "curtains"},
  {title: "Hair Dryer", value: "hairdryer"},
  {title: "Hot Water", value: "hotwater"},
];

const hotelRoom = {
  name: "hotelRoom",
  title: "Accommodation",
  type: "document",
  icon: FaBed,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) =>
        Rule.required().max(50).error("Maximum 50 Characters"),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "name",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publicUrl',
      title: 'Public URL',
      type: 'url',
      description: 'Read-only link to the front-end page for this accommodation',
      readOnly: true,
      components: { input: PublicUrlInput },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required().min(1).error("Please provide a description."),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "discount",
      title: "Discount",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'discountCodes',
      title: 'Discount Codes',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'discountCode' }],
        },
      ],
      description: 'Reference discount codes that apply to this accommodation',
    }),
    defineField({
      name: "flatFee",
      title: "Flat Fee",
      type: "number",
      description: "One-time flat fee added to each booking (e.g. cleaning or service fee)",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
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
      fields: [
        { name: "image", type: "image", title: "Image" },
      ],
      validation: (Rule) => Rule.required().error("Cover Image is required"),
    }),
    defineField({
      name: "type",
      title: "Room Type",
      type: "string",
      options: {
        list: roomTypes,
      },
      validation: (Rule) => Rule.required(),
      initialValue: "basic",
    }),
    defineField({
      name: "specialNote",
      title: "Special Note",
      type: "text",
      validation: (Rule) => Rule.required(),
      initialValue:
        "Check-in time is noon, checkout is at midnight. If any items are left behind, contact management",
    }),
    
    defineField({
      name: "offeredAmenities",
      title: "Offered Amenities",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "amenity", title: "Amenity", type: "string", options: { list: amenities} },
            {
              name: "icon",
              title: "Icon",
              type: "string",
              components: { input: IconGridPicker },
            },
          ],
          preview: {
            select: { title: 'amenity', icon: 'icon' },
            prepare(selection: any) {
              const { title, icon } = selection;
              let iconValue = icon;
              if (!iconValue && title) {
                // try to map from amenity key (title may be the display value or key)
                const key = String(title).toLowerCase().replace(/\s+/g, '');
                iconValue = AMENITY_ICON_MAP[key] || iconValue;
              }
              const found = ICONS.find((c: any) => c.value === iconValue);
              const Media = found ? found.Icon : null;
              return {
                title: title || 'Amenity',
                media: Media ? <Media /> : null,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "instantBook",
      title: "Instant Book",
      type: "boolean",
      description: "Enable to allow users to instantly book this accommodation",
      initialValue: true,
    }),
    defineField({
      name: "visibleToUsers",
      title: "Visible to users",
      type: "boolean",
      description: "Controls whether this accommodation is visible to site users",
      initialValue: true,
    }),
    defineField({
      name: "overnight",
      title: "Overnight?",
      type: "boolean",
      description: "Indicates whether this accommodation allows overnight stays",
      initialValue: true,
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
};

export default hotelRoom;
