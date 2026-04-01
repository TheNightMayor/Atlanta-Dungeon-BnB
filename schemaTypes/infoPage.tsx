import { FaInfoCircle } from "react-icons/fa";

const infoPage = {
  name: "infoPage",
  title: "Info Page",
  icon: FaInfoCircle,
  type: "document",
  fields: [
    {
      name: "internalName",
      title: "Internal Name",
      type: "string",
      description: "Internal identifier for back-end or admin use (not shown to users).",
      validation: (Rule: any) => Rule.required(),
    },
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

export default infoPage;
