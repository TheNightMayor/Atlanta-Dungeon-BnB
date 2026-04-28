import Gallery from "@/components/Gallery/Gallery";
import HeroSection from "@/components/HeroSection/HeroSection";
import CombinedReviewsRotator from '@/components/Reviews/CombinedReviewsRotator';
import { getInfoPageByInternalName, getRandomReviews } from "@/libs/apis";
import { PortableText } from 'next-sanity';
import { portableTextComponents } from '@/libs/portableTextComponents';
import Link from 'next/link';
import FrontPageCta from "@/components/FrontPageCta/FrontPageCta";

const AboutPage = async () => {
  const aboutInfo = await getInfoPageByInternalName('about');
  const reviews = await getRandomReviews(6);

  return (
    <>
      {aboutInfo ? (
        <section className="mx-auto pt-2 md:pt-2 px-4 md:px-0 z-10 relative bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert">
              <h1 className="text-3xl md:text-5xl font-orbitron mb-6">{aboutInfo.title}</h1>
              <PortableText value={aboutInfo.content} components={portableTextComponents} />
            </div>
          </div>
        </section>
      ) : null}
 <FrontPageCta />
    </>
  )
};

export default AboutPage;
