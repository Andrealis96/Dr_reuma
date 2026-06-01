import { Helmet } from "react-helmet-async";
import Services from "../components/Services";

function ServiciosPage() {
  return (
    <>
        <Helmet>
            <title>
            Servicios Reumatológicos en Neuquén | Consulta Presencial y Online
            </title>

            <meta
            name="description"
            content="Consultas reumatológicas presenciales en Neuquén Capital y atención online. Diagnóstico y tratamiento de artritis, lupus, fibromialgia, osteoporosis, dolor articular y enfermedades autoinmunes."
            />

            <meta
            name="keywords"
            content="reumatólogo Neuquén, consulta reumatológica, artritis, lupus, fibromialgia, osteoporosis, enfermedades autoinmunes, dolor articular, consulta online reumatología"
            />
        </Helmet>

      <Services />
    </>
  );
}

export default ServiciosPage;