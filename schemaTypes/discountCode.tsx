import { FaTags } from 'react-icons/fa';

const discountCode = {
  name: 'discountCode',
  title: 'Discount Code',
  type: 'document',
  icon: FaTags,
  fields: [
    {
      name: 'code',
      title: 'Code',
      type: 'string',
      validation: (Rule: any) => Rule.required().uppercase().min(3).max(20),
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: { list: [ { title: 'Percentage', value: 'percentage' }, { title: 'Fixed amount', value: 'fixed' } ] },
      initialValue: 'percentage',
    },
    {
      name: 'value',
      title: 'Value',
      type: 'number',
      description: 'If percentage, enter a number like 10 for 10%; if fixed, enter cents as a dollar amount',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'startDate',
      title: 'Start date',
      type: 'date',
    },
    {
      name: 'endDate',
      title: 'End date',
      type: 'date',
    },
    {
      name: 'maxUses',
      title: 'Maximum uses',
      type: 'number',
      description: 'Optional: how many times this code can be used in total',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'onePerUser',
      title: 'One use per user',
      type: 'boolean',
      initialValue: false,
    },
    {
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
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
};

export default discountCode;
