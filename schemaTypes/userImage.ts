export default {
  name: 'userImage',
  title: 'User Image',
  type: 'document',
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'owner',
      title: 'Owner',
      type: 'reference',
      to: [{ type: 'user' }],
    },
    {
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      options: {
        list: [
          { value: 'private', title: 'Private' },
          { value: 'public', title: 'Public' },
        ],
      },
      initialValue: 'private',
    },
    {
      name: 'note',
      title: 'Note',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'asset.asset.originalFilename',
      media: 'asset',
    },
  },
}
