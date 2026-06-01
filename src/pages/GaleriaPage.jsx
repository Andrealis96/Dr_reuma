import { Helmet } from "react-helmet-async";
import Galeria from "../components/Galeria";

function GaleriaPage() {
  return (
    <>
        <Helmet>
            <title>
                Casos Clínicos | Dr. Reuma Neuquén
            </title>

            <meta
                name="description"
                content="Galería de actividades médicas, educación en reumatología, contenido informativo sobre enfermedades autoinmunes, artritis, lupus y dolor articular."
            />

            <meta
                name="keywords"
                content="reumatología Neuquén, artritis, lupus, enfermedades autoinmunes, educación médica, dolor articular, Dr Reuma"
            />
            </Helmet>

      <Galeria />
    </>
  );
}

export default GaleriaPage;