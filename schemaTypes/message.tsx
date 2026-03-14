import { Any } from 'next-sanity';
import { FaPenSquare } from "react-icons/fa";
import { defineField } from "sanity";

const message = {
    name: "message",
    title: "message",
    icon: FaPenSquare,
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
            name: "email",
            title: "Email",
            type: "email",
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "topic",
            title: "Topic",
            type: "string",
            validation: Rule =>Rule.required(),
        }),
        defineField({
            name: "text",
            title: "Text",
            type: "string",
            validation: Rule =>Rule.required(),
        }),
    ],
    preview: {
        select: {
            user: 'user.name',
            email: 'email',
            topic: 'topic',
        },
        prepare(selection: Any) {
            const { user, email, topic } = selection
            return {
                title: `${topic}`,
                subtitle: `${user ? user : 'unknown'} - ${email ? email : 'unknown'}`,
            }
        }
    }
}

export default message;