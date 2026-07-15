import { Link } from "react-router-dom";
import artritis from "../assets/artritis.webp";
import artrosis from "../assets/artrosis.webp";
import fibromialgia from "../assets/fibromialgia.webp";
import esclerodermia from "../assets/esclerodermia.webp";
import gota from "../assets/gota.webp";
import dolorcolumna from "../assets/dolorcolumna.webp";
import osteoporosis from "../assets/osteoporosis.webp";
import artritispsoriasica from "../assets/artritispsoriasica.webp";
import dolorrodillas from "../assets/dolorrodillas.webp";
import hormigueo from "../assets/hormigueo.webp";
import dermatomiositis from "../assets/dermatomiositis.webp";
import lupus from "../assets/lupus.webp";
import { Helmet } from "react-helmet-async";
import {
  FaHandHoldingMedical,
  FaBone,
  FaSyringe,
  FaVirus,
  FaProcedures,
  FaWalking,
  FaBrain,
  FaHeartbeat,
  FaWheelchair,
  FaQuestionCircle,
  FaRunning,
  FaTint,
  FaBolt
} from "react-icons/fa";

const solutions = [
    {
        title: "Artritis Reumatoide",
        slug: "artritis-reumatoide",
        image: artritis,
        icon: <FaHandHoldingMedical />,
    },
    {
        title: "Artrosis (Desgaste Articular)",
        slug: "artrosis",
        image: artrosis,
        icon: <FaBone />,
    },
    {
        title: "Fibromialgia",
        slug: "fibromialgia",
        image: fibromialgia,
        icon: <FaBrain />,
    },
    {
        title: "Lupus",
        slug: "lupus",
        image: lupus,
        icon: <FaVirus />,
    },
    {
        title: "Esclerodermia",
        slug: "esclerodermia",
        image: esclerodermia,
        icon: <FaProcedures />,
    },
    {
        title: "Gota (Ácido Úrico Elevado)",
        slug: "gota",
        image: gota,
        icon: <FaTint />,
    },
    {
        title: "Dolor columna y de cadera",
        slug: "dolor-columna-cadera",
        image: dolorcolumna,
        icon: <FaWalking />,
    },
    {
        title: "Osteoporosis",
        slug: "osteoporosis",
        image: osteoporosis,
        icon: <FaBone />,
    },
    {
        title: "Artritis Psoriásica",
        slug: "artritis-psoriasica",
        image: artritispsoriasica,
        icon: < FaHandHoldingMedical />,
    },
    {
        title: "Dolor en rodillas",
        slug: "dolor-rodillas",
        image: dolorrodillas,
        icon: <FaWheelchair />,
    },
    {
        title: "Hormigueo - electricidad - adormecimiento ",
        slug: "hormigueo-adormecimiento",
        image: hormigueo,
        icon: <FaBolt />,
    },
    {
        title: "Dermatomiositis",
        slug: "dermatomiositis",
        image: dermatomiositis,
        icon: <FaRunning />,
    },
    {
        title: "No sé, solo me duele",
        slug: "no-se-solo-me-duele",
        icon: <FaQuestionCircle />,
    },
    ];

    function Solutions() {
    return (
        <section className="solutions-section">
        <div className="container solutions-container py-5 ">

        <h3 className="subtitle-general mb-5 ">
        <span className="subtitle-celeste"> ¿QUÉ ENFERMEDAD REUMATOLÓGICA</span>
        <span className="subtitle-negro"> PODRÍAS TENER?</span>
        </h3>
        <p className="solutions-description  mb-5">

        El <span className="fw-bold">dolor articular</span>,
        la <span className="fw-bold">inflamación</span>,
        el <span className="fw-bold">cansancio </span>
        y la <span className="fw-bold">rigidez </span>
        pueden ser señales de una <span className="fw-bold"> enfermedad reumatológica </span>
        o <span className="fw-bold">autoinmune</span>.
        Conoce algunas de las patologías que diagnosticamos,
        tratamos y acompañamos en <span className="fw-bold celeste"> DR. REUMA </span>
        mediante una atención médica cercana, personalizada y enfocada en mejorar tu <span className="fw-bold"> calidad de vida</span>.

        </p>

        <div className="row g-4">

        {solutions.map((sol, index) => (

        <div className="col-md-4" key={index}>

<div className="solutions-card">

  <Link
    to={`/diagnosticos/${sol.slug}`}
    className="solutions-header text-uppercase fw-bold text-decoration-none"
  >

    <div className="d-flex align-items-center gap-2">
      <span className="fs-2 me-2">
        {sol.icon}
      </span>

      {sol.title}
    </div>

    <span className="arrow">
      →
    </span>

  </Link>

</div>

        </div>

        ))}

        </div>

        </div>

        </section>
);

}

export default Solutions;