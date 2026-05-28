import { useState } from "react";
import { FaCheckCircle} from "react-icons/fa";
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
        image: artritis,
        icon: <FaHandHoldingMedical />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Controlar la inflamación y proteger tus articulaciones para evitar deformaciones y limitaciones en tu vida diaria. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Realizaremos controles periódicos ya que esta enfermedad también puede afectar pulmones y otros órganos importantes. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Elegiremos juntos la medicación más adecuada para aliviar el dolor y mejorar tu movilidad. </>

        ],
    },
    {
        title: "Artrosis (Desgaste Articular)",
        image: artrosis,
        icon: <FaBone />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Disminuir el dolor y la rigidez para que puedas volver a moverte con mayor comodidad. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Evaluaremos la evolución del desgaste articular y cómo afecta tus actividades diarias. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Indicaremos ejercicios, hábitos saludables y tratamientos orientados a proteger tus articulaciones. </>
        ],
    },
    {
        title: "Fibromialgia",
        image: fibromialgia,
        icon: <FaBrain />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Ayudarte a disminuir el dolor, el cansancio y la sensación de hormigueo o adormecimiento. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Trabajaremos sobre el descanso, el sueño y el agotamiento físico mediante un acompañamiento cercano y personalizado. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Buscaremos mejorar tu calidad de vida con medicación, hábitos saludables y estrategias adaptadas a tus síntomas. </>
        ],
    },
    {
        title: "Lupus",
        image: lupus,
        icon: <FaVirus />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Controlar la actividad de la enfermedad y proteger órganos importantes como riñones, pulmones y articulaciones. </>,
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Realizaremos controles clínicos y estudios periódicos para detectar cambios de manera temprana. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Indicaremos tratamientos personalizados para mantener la enfermedad estable y mejorar tu calidad de vida. </>
        ],
    },
    {
        title: "Esclerodermia",
        image: esclerodermia,
        icon: <FaProcedures />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Controlar la progresión de la enfermedad y aliviar los síntomas que afectan tu bienestar. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Prestaremos atención a la piel, pulmones, corazón y circulación mediante controles específicos. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Buscaremos mejorar la movilidad, la circulación y la calidad de vida con un abordaje integral. </>
        ],
    },
    {
        title: "Gota (Ácido Úrico Elevado)",
        image: gota,
        icon: <FaTint />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Disminuir el dolor y la inflamación provocados por el ácido úrico elevado. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Controlaremos los niveles de ácido úrico para prevenir nuevos ataques y complicaciones. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Combinaremos medicación, alimentación y hábitos saludables para mejorar la enfermedad. </>
        ],
    },
    {
        title: "Dolor columna y de cadera",
        image: dolorcolumna,
        icon: <FaWalking />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Ayudarte a disminuir el dolor y recuperar movilidad para mejorar tu vida diaria. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Evaluaremos cómo evoluciona el dolor y qué actividades pueden ayudarte a sentirte mejor. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Indicaremos ejercicios, medicación y estrategias adaptadas a tus necesidades. </>
        ],
    },
    {
        title: "Osteoporosis",
        image: osteoporosis,
        icon: <FaBone />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Fortalecer tus huesos y disminuir el riesgo de fracturas. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Realizaremos controles y estudios para evaluar la salud ósea y su evolución. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Indicaremos medicación, alimentación y hábitos que ayuden a proteger tus huesos. </>
        ],
    },
    {
        title: "Artritis Psoriásica",
        image: artritispsoriasica,
        icon: < FaHandHoldingMedical />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Controlar la inflamación articular y mejorar los síntomas en piel y uñas. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Evaluaremos la evolución de la enfermedad y su impacto sobre articulaciones, columna y tendones. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Indicaremos terapias orientadas a aliviar el dolor y prevenir daño articular a largo plazo. </>
        ],
    },
    {
        title: "Dolor en rodillas",
        image: dolorrodillas,
        icon: <FaWheelchair />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Encontrar la causa del dolor para ayudarte a recuperar movilidad y disminuir molestias. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Evaluaremos la evolución mediante controles y estudios complementarios si son necesarios. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Existen distintas alternativas como medicación, infiltraciones y rehabilitación antes de pensar en cirugía. </>
        ],
    },
    {
        title: "Hormigueo - electricidad - adormecimiento ",
        image: hormigueo,
        icon: <FaBolt />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Estudiar la causa de estos síntomas y ayudarte a aliviar las molestias lo antes posible. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Realizaremos estudios y controles para encontrar un diagnóstico preciso y oportuno. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Indicaremos medidas y tratamientos orientados a mejorar tu calidad de vida y prevenir nuevos episodios. </>
        ],
    },
    {
        title: "Dermatomiositis",
        image: dermatomiositis,
        icon: <FaRunning />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Controlar la inflamación muscular y ayudarte a recuperar fuerza física. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Realizaremos controles clínicos y estudios de laboratorio para monitorear la enfermedad. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Buscaremos mejorar los síntomas musculares y cutáneos mediante un tratamiento integral. </>
        ],
    },
    {
        title: "No sé, solo me duele",
        icon: <FaQuestionCircle />,
        items: [
            <> <span className="fw-bold celeste">Mi objetivo:</span>{" "} Escucharte y ayudarte a encontrar la causa de lo que estás sintiendo. </>, 
            <> <span className="fw-bold celeste">Seguimiento:</span>{" "} Realizaremos una evaluación médica completa y estudios que sean necesarios para determinar como se encuentra. </>, 
            <> <span className="fw-bold celeste">Tratamiento:</span>{" "} Muchas enfermedades reumatológicas pueden tratarse mejor cuando se diagnostican a tiempo. </>
        ],
    },
    ];

    function Solutions() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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

<button
className="solutions-header text-uppercase fw-bold"
onClick={() => toggleItem(index)}
>

<div className="d-flex align-items-center gap-2">
  <span className=" fs-2 me-2">
    {sol.icon}
  </span>
  {sol.title}
</div>

<span className={`arrow ${openIndex === index ? "open" : ""}`}>
▼
</span>

</button>

<div className={`solutions-body ${openIndex === index ? "show" : ""}`}>

{/* IMAGEN */}
{sol.image && (
<img
src={sol.image}
alt={sol.title}
className="solutions-image"
/>
)}

<ul>

{sol.items.map((item, i) => (

<li key={i}>
<FaCheckCircle className="icon" />
{item}
</li>

))}

</ul>

</div>

</div>

</div>

))}

</div>

</div>

</section>

);

}

export default Solutions;