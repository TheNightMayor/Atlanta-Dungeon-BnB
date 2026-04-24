import Gallery from "@/components/Gallery/Gallery";
import HeroSection from "@/components/HeroSection/HeroSection";
import CombinedReviewsRotator from '@/components/Reviews/CombinedReviewsRotator';
import { getInfoPageByTitle, getRandomReviews } from "@/libs/apis";
import { PortableText } from 'next-sanity';
import Link from 'next/link';

const portableComponents: any = {
  block: {
    h1: ({ children }: any) => <h1 className="py-4 text-2xl md:text-4xl font-orbitron">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-orbitron">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-orbitron">{children}</h3>,
    normal: ({ children }: any) => <p className="text-base leading-10 py-4">{children}</p>,
    hr: () => <hr className="my-6 border-gray-200" />,
  },
  marks: {
    link: ({ children, value }: any) => {
      const href = value?.href || '';
      const target = href.startsWith('http') ? '_blank' : undefined;
      return (
        <a href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} className="text-primary underline">
          {children}
        </a>
      );
    }
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-6">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-6">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="mb-1">{children}</li>,
    number: ({ children }: any) => <li className="mb-1">{children}</li>,
  }
};

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
           <PortableText value={frontInfo.content} components={portableComponents} />
         </div>
       </div>
     </section>
   ) : null}
   {/* Call To Action */}
   <section className="container mx-auto py-8 px-4 md:px-0 border-2 border-tertiary-dark rounded-lg ">
     <div className="max-w-4xl mx-auto text-center">
       <h3 className="text-2xl font-orbitron mb-4">Curious? Click here to begin your journey</h3>
       <Link href="/rooms" className="inline-block bg-primary text-white px-24 py-6 rounded-lg hover:bg-white dark:hover:bg-black text-xl font-bold transition border-2 border-tertiary-dark">Book Your Stay</Link>
     </div>
   </section>
  <Gallery />
  <CombinedReviewsRotator reviews={reviews} />
   </>
  )
};

export default Home