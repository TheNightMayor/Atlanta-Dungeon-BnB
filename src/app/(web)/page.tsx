import FeaturedRoom from "@/components/FeaturedRoom/FeaturedRoom";
import Gallery from "@/components/Gallery/Gallery";
import HeroSection from "@/components/HeroSection/HeroSection";
import CombinedReviews from '@/components/Reviews/CombinedReviews';
import CombinedReviewsRotator from '@/components/Reviews/CombinedReviewsRotator';
import { getFeaturedRoom, getRandomReviews } from "@/libs/apis";

const Home = async () => {
  const featuredRoom = await getFeaturedRoom();
  const reviews = await getRandomReviews(6);

  return (
    <>
   <HeroSection />
   {/* <PageSearch /> */}
   <FeaturedRoom featuredRoom={featuredRoom} />
  <Gallery />
  <CombinedReviewsRotator reviews={reviews} />
   {/* <NewsLetter /> */}
   </>
  )
};

export default Home