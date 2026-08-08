import { FaBan } from 'react-icons/fa';
import { defineField } from 'sanity';

const blockedDate = {
  name: 'blockedDate',
  title: 'Blocked Date',
  icon: FaBan,
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'string',
    })
  ],
  preview: {
    select: { date: 'date', reason: 'reason' },
    prepare({ date, reason }: Record<string, any>) {
      return { title: date, subtitle: reason || 'blocked' };
    }
  }
};

export default blockedDate;
