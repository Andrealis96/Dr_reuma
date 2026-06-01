import { Helmet } from "react-helmet-async";
import Faq from "../components/Faq";

function FaqPage() {
  return (
    <>
        
        <Helmet>
        <title>
            Preguntas Frecuentes sobre Reumatología | Dr. Reuma
        </title>

        <meta
            name="description"
            content="Respuestas a las preguntas más frecuentes sobre artritis, lupus, fibromialgia, osteoporosis, enfermedades autoinmunes y consultas reumatológicas en Neuquén."
        />

        <meta
            name="keywords"
            content="qué hace un reumatólogo, síntomas de artritis, lupus, fibromialgia, osteoporosis, enfermedades autoinmunes, consulta reumatológica"
        />
        </Helmet>

        <Faq />
    </>
  );
}

export default FaqPage;