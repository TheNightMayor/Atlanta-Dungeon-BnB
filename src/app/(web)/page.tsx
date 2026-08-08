import Gallery from "@/components/Gallery/Gallery";
import HeroSection from "@/components/HeroSection/HeroSection";
import CombinedReviewsRotator from '@/components/Reviews/CombinedReviewsRotator';
import { getInfoPageByTitle, getRandomReviews } from "@/libs/apis";
import { PortableText } from 'next-sanity';
import { portableTextComponents } from '@/libs/portableTextComponents';
import FrontPageCta from "@/components/FrontPageCta/FrontPageCta";
import { getBreadcrumbSchema, getLodgingBusinessSchema, siteUrl } from '@/libs/seo';

export const metadata = {
  title: 'Immersive Night Stays in Atlanta | Dungeon Next Door',
  description: 'Discover themed rooms, immersive stays, and easy booking at Dungeon Next Door in Atlanta.',
  openGraph: {
    title: 'Immersive Night Stays in Atlanta | Dungeon Next Door',
    description: 'Discover themed rooms, immersive stays, and easy booking at Dungeon Next Door in Atlanta.',
    url: `${siteUrl.origin}/`,
    siteName: 'Dungeon Next Door',
    type: 'website',
    images: [
      {
        url: `${siteUrl.origin}/images/hero-1.jpg`,
        width: 1200,
        height: 630,
        alt: 'Dungeon Next Door Atlanta immersive stay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immersive Night Stays in Atlanta | Dungeon Next Door',
    description: 'Discover themed rooms, immersive stays, and easy booking at Dungeon Next Door in Atlanta.',
    creator: '@DungeonNextDoor',
    images: [`${siteUrl.origin}/images/hero-1.jpg`],
  },
};

const Home = async () => {
  const frontInfo = await getInfoPageByTitle('Front Page');
  const reviews = await getRandomReviews(6);
  const schema = [
    getLodgingBusinessSchema(siteUrl.href),
    getBreadcrumbSchema([
      { name: 'Home', url: `${siteUrl.origin}/` },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <HeroSection />
      {frontInfo ? (
        <section className="mx-auto pt-2 md:pt-2 px-4 md:px-0 z-10 relative bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert">
              <PortableText value={frontInfo.content} components={portableTextComponents} />
            </div>
          </div>
        </section>
      ) : null}
      <FrontPageCta />
      <Gallery />
      <CombinedReviewsRotator reviews={reviews} />
    </>
  );
};

export default Home