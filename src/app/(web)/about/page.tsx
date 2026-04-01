import { PortableText } from "next-sanity";
import { getAboutPage } from "@/libs/apis";

const AboutPage = async () => {
  const aboutData = await getAboutPage();

  if (!aboutData) {
    return (
      <section className="container mx-auto pt-28 md:pt-24 font-orbitron">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p>About page content is not available yet. Please check back soon.</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto pt-28 md:pt-24 px-4 md:px-0 font-orbitron">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{aboutData.title}</h1>
        <div className="prose prose-lg dark:prose-invert">
          <PortableText value={aboutData.content} />
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
