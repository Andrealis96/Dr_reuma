import Welcome from "../components/Welcome";
import Solutions from "../components/Solutions";
import Services from "../components/Services";
import HeroCarousel from "../components/HeroCarousel";
import Testimonials from "../components/Testimonials";
import Galeria from "../components/Galeria";
import Faq from "../components/Faq";
import { faqData } from "../data/faqData";

function Home() {

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.respuesta
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />

      <HeroCarousel />
      <Welcome />
      <Solutions />
      <Services />
      <Galeria />
      <Faq />
      <Testimonials />
    </>
  );
}

export default Home;