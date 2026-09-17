import { FaTags } from 'react-icons/fa';
import { defineField, defineType } from 'sanity';

const discountCode = defineType({
  name: 'discountCode',
  title: 'Discount Code',
  type: 'document',
  icon: FaTags,
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      description: 'Code name (uppercase, alphanumeric, hyphens/underscores allowed)',
      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(20)
          .regex(/^[A-Z0-9_-]+$/, {
            name: 'uppercase alphanumeric',
            invert: false,
          })
          .error('Code must be uppercase alphanumeric characters (e.g. SUMMER2026)'),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage (%)', value: 'percentage' },
          { title: 'Fixed Total ($ off whole stay)', value: 'fixed_total' },
          { title: 'Fixed Per Night ($/night off)', value: 'fixed' },
        ],
      },
      initialValue: 'percentage',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'number',
      description: 'If percentage, enter 10 for 10% (0-100); if fixed total/nightly, enter dollar amount (e.g. 50 for $50 off)',
      validation: (Rule) =>
        Rule.required()
          .min(0)
          .custom((val, context) => {
            const doc = context.parent as { type?: string } | undefined;
            if (doc?.type === 'percentage' && typeof val === 'number' && val > 100) {
              return 'Percentage discount cannot exceed 100%';
            }
            return true;
          }),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'date',
    }),
    defineField({
      name: 'endDate',
      title: 'End date',
      type: 'date',
    }),
    defineField({
      name: 'maxUses',
      title: 'Maximum uses',
      type: 'number',
      description: 'Optional: how many times this code can be used in total',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'onePerUser',
      title: 'One use per user',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'appliesTo',
      title: 'Applies to (optional)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'hotelRoom' }],
        },
      ],
      description: 'Leave empty to allow this code on any accommodation, or select specific accommodations to restrict it',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      title: 'code',
      type: 'type',
      value: 'value',
      active: 'active',
    },
    prepare({ title, type, value, active }) {
      let typeLabel = `${value}% off`;
      if (type === 'fixed_total') {
        typeLabel = `$${value} total off`;
      } else if (type === 'fixed') {
        typeLabel = `$${value} off/night`;
      }
      return {
        title: title || 'Untitled Code',
        subtitle: `${typeLabel} — ${active ? 'Active' : 'Inactive'}`,
      };
    },
  },
});

export default discountCode;
