import FeaturedRoom from "@/components/FeaturedRoom/FeaturedRoom";
import Gallery from "@/components/Gallery/Gallery";
import HeroSection from "@/components/HeroSection/HeroSection";
import { getFeaturedRoom } from "@/libs/apis";

const Home = async () => {
  const featuredRoom = await getFeaturedRoom();

  return (
    <>
   <HeroSection />
   {/* <PageSearch /> */}
   <FeaturedRoom featuredRoom={featuredRoom} />
   <Gallery />
   {/* <NewsLetter /> */}
   </>
  )
};

export default Home