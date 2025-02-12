import { FaBed } from "react-icons/fa";
import { defineField } from "sanity";
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
  title: "Hotel Room",
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
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) =>
        Rule.required().min(100).error("Minimum 100 Characters"),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(100).error("Minimum $100"),
    }),
    defineField({
      name: "discount",
      title: "Discount",
      type: "number",
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
            { name: "url", type: "url", title: "URL" },
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
        { name: "url", type: "url", title: "URL" },
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
      name: "dimension",
      title: "Dimension",
      type: "string",
    }),
    defineField({
      name: "numberOfBeds",
      title: "Number of Beds",
      type: "number",
      validation: (Rule) => Rule.min(1),
      initialValue: 1,
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
            { name: "icon", title: "Icon", type: "string"},
          ],
        },
      ],
    }),
    defineField({
      name: "isBooked",
      title: "Is Booked",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isFeatured",
      title: "Is Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "reviews",
      title: "Reviews",
      type: "array",
      of: [{ type: "review" }],
    }),
  ],
};

export default hotelRoom;
