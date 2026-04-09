import { FaUser } from "react-icons/fa";
import { defineField } from "sanity"

const user = {
    name: "user",
    title: "user",
    icon: FaUser,
    type: "document",
    fields: [
        defineField({
            name: "isAdmin",
            title: "Is Admin",
            type: "boolean",
            description: "Check if the user is an admin",
            initialValue: false,
            validation: (Rule) => Rule.required(),
            // readOnly: true,
            // hidden: true,
        }),
        defineField({
            name: 'idVerified',
            title: 'ID Verified',
            type: 'boolean',
            description: 'Toggle when the user\'s ID has been verified',
            initialValue: false,
        }),
        defineField({
            validation: (Rule) => Rule.required(),
            name: "name",
            title: "Name",
            type: "string",
            description: "Name of the user",
            readOnly: true,
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'idDocument',
            title: 'ID Document',
            type: 'image',
            description: 'Upload a photo of the user\'s driver\'s license or ID (private).',
            options: {
                hotspot: false,
            },
            // You may want to restrict visibility in Studio to admins only in the future
        }),
        defineField({
            name: "password",
            type: "string",
            // hidden: true,
        }),
        defineField({
            name: 'email',
            type: 'string',
            title: 'Email',
        }),
        defineField({
            name: 'emailVerified',
            type: 'datetime',
            hidden: true,
        }),
        defineField({
            name: "about",
            title: "About",
            type: "text",
            description: "a brief description about the user",
        })
    ],
    preview: {
        select: {
            name: 'name',
            media: 'image',
        },
        prepare(value: Record<string, any>) {
            return {
                title: value.name,
                media: value.media,
            };
        }
    }
};

export default user 