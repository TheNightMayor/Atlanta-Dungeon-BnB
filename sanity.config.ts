import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import BookingCalendarView from './src/studio/views/BookingCalendarView'

const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('📅 Booking Calendar')
        .child(S.component(BookingCalendarView).title('Booking Calendar')),
      ...S.documentTypeListItems().filter(
        (item: any) => item.getId() !== 'booking'
      ),
    ])

export default defineConfig({
  name: 'default',
  title: 'bnb-management',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,

  basePath: "/studio",

  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
