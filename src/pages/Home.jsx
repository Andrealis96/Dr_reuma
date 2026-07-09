import { Helmet } from "react-helmet-async";

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

  const physicianSchema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: "Dr. Reuma - Dr. Tony Vélez",
    alternateName: "Dr Reuma",
    description:
      "Reumatólogo en Neuquén Capital. Atención presencial y online para enfermedades reumatológicas, autoinmunes y dolor articular.",
    medicalSpecialty: "Rheumatology",
    url: "https://doctor-reuma.com.ar",
    telephone: "+54 9 299 466 6559",
    image: "https://doctor-reuma.com.ar/DrReumaLogo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "San Martín 1355",
      addressLocality: "Neuquén Capital",
      addressRegion: "Neuquén",
      addressCountry: "AR"
    },
    areaServed: {
      "@type": "City",
      name: "Neuquén"
    },
    availableService: [
      {
        "@type": "MedicalTherapy",
        name: "Consulta reumatológica presencial en Neuquén"
      },
      {
        "@type": "MedicalTherapy",
        name: "Consulta reumatológica online"
      },
      {
        "@type": "MedicalTherapy",
        name: "Diagnóstico y tratamiento de artritis reumatoide"
      },
      {
        "@type": "MedicalTherapy",
        name: "Diagnóstico y tratamiento de lupus"
      },
      {
        "@type": "MedicalTherapy",
        name: "Diagnóstico y tratamiento de artrosis"
      },
      {
        "@type": "MedicalTherapy",
        name: "Diagnóstico y tratamiento de fibromialgia"
      },
      {
        "@type": "MedicalTherapy",
        name: "Diagnóstico y tratamiento de osteoporosis"
      },
      {
        "@type": "MedicalTherapy",
        name: "Diagnóstico y tratamiento de gota"
      }
    ],
    sameAs: [
      "https://www.instagram.com/drreuma",
      "https://doctor-reuma.com.ar"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dr. Reuma",
    url: "https://doctor-reuma.com.ar",
    description:
      "Sitio web de Dr. Reuma, reumatólogo en Neuquén Capital.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://doctor-reuma.com.ar/diagnosticos?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Helmet>
        <title>
          Reumatólogo en Neuquén | Dr. Reuma - Dr. Tony Vélez
        </title>

        <meta
          name="description"
          content="Reumatólogo en Neuquén Capital. Atención presencial y online para artritis reumatoide, lupus, artrosis, fibromialgia, gota, osteoporosis, dolor articular y enfermedades autoinmunes. Turnos con Dr. Reuma."
        />

        <meta
          name="keywords"
          content="reumatólogo en Neuquén, reumatologo Neuquen, Dr Reuma, Dr Tony Vélez, artritis reumatoide, lupus, artrosis, fibromialgia, osteoporosis, gota, dolor articular, enfermedades autoinmunes"
        />

        <meta property="og:title" content="Reumatólogo en Neuquén | Dr. Reuma" />

        <meta
          property="og:description"
          content="Atención reumatológica en Neuquén Capital. Consulta presencial y online para artritis, lupus, artrosis, fibromialgia, osteoporosis, gota y dolor articular."
        />

        <meta
          property="og:image"
          content="https://doctor-reuma.com.ar/DrReumaLogo.png"
        />

        <meta property="og:url" content="https://doctor-reuma.com.ar/" />

        <meta property="og:type" content="website" />

        <link
          rel="canonical"
          href="https://doctor-reuma.com.ar/"
        />

        <script type="application/ld+json">
          {JSON.stringify(physicianSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

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