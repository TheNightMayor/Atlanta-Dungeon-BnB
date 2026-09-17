import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import BookingCalendarView from './src/studio/views/BookingCalendarView'
import InvoiceBookingView from './src/studio/views/InvoiceBookingView'
import { FaBed, FaCalendarAlt, FaListAlt, FaUsers } from 'react-icons/fa'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ija74i93'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'


const HIDDEN_DOC_TYPES = ['account', 'verification-token'];

const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Scheduling group: calendar, blocked dates, bookings
      S.listItem()
        .title('Scheduling')
        .icon(FaCalendarAlt)
        .child(
          S.list()
            .title('Scheduling')
            .items([
              S.listItem()
                .title('Booking Calendar')
                .icon(FaCalendarAlt)
                .child(S.component(BookingCalendarView).title('Booking Calendar')),
              S.listItem()
                .title('Create Listing Invoice')
                .child(S.component(InvoiceBookingView).title('Create Listing Invoice')),
              S.documentTypeListItem('blockedDate').title('Blocked Dates'),
              S.documentTypeListItem('booking').title('Bookings'),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Accommodations')
        .icon(FaBed)
        .child(
          S.list()
            .title('Accommodations')
            .items([
              S.documentTypeListItem('hotelRoom').title('All Accommodations'),
              S.documentTypeListItem('amenity').title('Amenities'),
              S.documentTypeListItem('discountCode').title('Discount Codes'),
            ])
        ),
      S.listItem()
        .title('Users')
        .icon(FaUsers)
        .child(
          S.list()
            .title('Users')
            .items([
              S.documentTypeListItem('user').title('All Users'),
              S.documentTypeListItem('userImage').title('User Images'),
              S.documentTypeListItem('review').title('Reviews'),
              S.documentTypeListItem('message').title('Messages'),
            ])
        ),
      S.listItem()
        .title('Content')
        .icon(FaListAlt)
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('infoPage').title('Info Pages'),
              S.documentTypeListItem('sanity.imageAsset').title('Images'),
              S.documentTypeListItem('sanity.fileAsset').title('Files'),
            ])
        ),
      ...S.documentTypeListItems().filter(
        (item: any) => !HIDDEN_DOC_TYPES.includes(item.getId()) &&
          !['blockedDate', 'booking', 'hotelRoom', 'amenity', 'discountCode', 'user', 'userImage', 'review', 'message', 'infoPage', 'sanity.imageAsset', 'sanity.fileAsset'].includes(item.getId())
      ),
    ])

export default defineConfig({
  name: 'default',
  title: 'bnb-management',

  projectId,
  dataset,

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
