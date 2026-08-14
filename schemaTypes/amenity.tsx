import React from 'react';
import { defineType } from 'sanity';
import ICONS from '../studio/inputs/iconList';
import { FaRegPlusSquare } from 'react-icons/fa';

export default defineType({
  name: 'amenity',
  title: 'Amenity',
  type: 'document',
  icon: FaRegPlusSquare,
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'icon', title: 'Icon', type: 'string', description: 'Icon value matching iconList (e.g. fa-wifi)' },
  ],
  preview: {
    select: { title: 'title', icon: 'icon' },
    prepare({ title, icon }: any) {
      const found = (ICONS || []).find((c: any) => c.value === icon);
      const IconComp = found ? found.Icon : null;
      return { title, media: IconComp ? <IconComp /> : undefined };
    }
  }
});
