import ContactClient from '@/components/Contact/ContactClient';

export const metadata = {
  title: 'Contact Dungeon Next Door | Atlanta Booking',
  description: 'Get in touch with Dungeon Next Door for booking questions, support, and special requests for Atlanta stays.',
  openGraph: {
    title: 'Contact Dungeon Next Door | Atlanta Booking',
    description: 'Get in touch with Dungeon Next Door for booking questions, support, and special requests for Atlanta stays.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Dungeon Next Door | Atlanta Booking',
    description: 'Get in touch with Dungeon Next Door for booking questions, support, and special requests for Atlanta stays.',
  },
};

const ContactPage = () => {
  return <ContactClient />;
};

export default ContactPage;