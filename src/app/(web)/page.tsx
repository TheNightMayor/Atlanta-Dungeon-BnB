import Gallery from "@/components/Gallery/Gallery";
import HeroSection from "@/components/HeroSection/HeroSection";
import CombinedReviewsRotator from '@/components/Reviews/CombinedReviewsRotator';
import { getInfoPageByTitle, getRandomReviews } from "@/libs/apis";
import { PortableText } from 'next-sanity';
import { portableTextComponents } from '@/libs/portableTextComponents';
import FrontPageCta from "@/components/FrontPageCta/FrontPageCta";

const Home = async () => {
  const frontInfo = await getInfoPageByTitle('Front Page');
  const reviews = await getRandomReviews(6);

  return (
    <>
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
  )
};

export default Home