import { Helmet } from "react-helmet-async";
import Testimonials from "../components/Testimonials";

function TestimoniosPage() {
  return (
    <>
        <Helmet>
            <title>
                Opiniones y Experiencias de Pacientes | Dr. Reuma
            </title>

            <meta
                name="description"
                content="Conoce las experiencias y opiniones de pacientes atendidos por el Dr. Tony Vélez, especialista en reumatología en Neuquén Capital."
            />

            <meta
                name="keywords"
                content="opiniones reumatólogo Neuquén, testimonios pacientes, Dr Reuma, artritis, lupus, enfermedades autoinmunes"
            />
        </Helmet>

      <Testimonials />
    </>
  );
}

export default TestimoniosPage;