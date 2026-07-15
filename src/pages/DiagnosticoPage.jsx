import { Helmet } from "react-helmet-async";
import { FaInstagram } from "react-icons/fa";
import Solutions from "../components/Solutions";
import artritis from "../assets/artritis.webp";
import lupus from "../assets/lupus.webp";
import dolorrodillas from "../assets/dolorrodillas.webp";
import InstagramPreview from "../components/InstagramPreview";

function DiagnosticoPage() {
  return (
    <>
      <Helmet>
        <title>
          Diagnósticos Reumatológicos en Neuquén | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Información sobre artritis reumatoide, lupus, fibromialgia, osteoporosis, gota, artrosis, dolor articular y enfermedades autoinmunes. Atención reumatológica en Neuquén con Dr. Reuma."
        />

        <link
          rel="canonical"
          href="https://doctor-reuma.com.ar/diagnosticos"
        />
      </Helmet>

      <Solutions />
      <InstagramPreview />
    </>
  );
}

export default DiagnosticoPage;