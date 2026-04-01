import { FaInfoCircle } from "react-icons/fa";

const aboutPage = {
  name: "aboutPage",
  title: "About Page",
  icon: FaInfoCircle,
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
  },
};

export default aboutPage;
