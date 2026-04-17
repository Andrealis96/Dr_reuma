import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
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

const solutions = [
    {
        title: "Artritis Rematoide",
        image: artritis,
        items: ["Mi objetivo es tratar la inflamación y el daño a tus articulaciones así evitamos que se deformen y se desvíen tus manitos y tus pies.",
                "Control continuo: Esta es una enfermedad que no es solo artritis , puede afectarte los pulmones y otros órganos importantes.", 
                "Elegir bien tus medicamentos ,hay fármacos disminuyen la inflamación pero  que si no se vigilan pueden terminar perjudicando tu salud tambien.",
                "Evitar la discapacidad: Que puedas realizar  todas tus actividades de tu vida diaria sin limitaciones a la medida  desde que te lavantas hasta que te acuestas." 
                ],
    },
    {
        title: "Artrosis (Desgaste Articular)",
        image: artrosis,
        items: ["Mi objetivo es disminuir el dolor y la rigidez, para que moverte no sea un sufrimiento diario.", 
                "Proteger tus articulaciones, retrasando el desgaste de tus articulaciones  y evitando que se desvíen tus dedos. ", 
                "Fortalecer tus huesos y tus articulaciones consjeos ejercicios adecuado y la actividad física correcta  evita que progrese tu artrosis",
                "Evitar la pérdida de independencia, evitar cirugías de remplazos de cadera rodilla ayudándote a seguir con tus actividades cotidianas sin depender de otros."],
    },
    {
        title: "Fibromialgia",
        image: fibromialgia,
        items: ["Mi objetivo es bajar el dolor y esa electricidad ( hormigueo , adormecimiento ) en almenos un 70% .", 
                "Tratarte el sueño y el descanso, porque dormir mal empeora todo y vamos a tratar  ese cansancio juntos.", 
                "Escuchar tus síntomas con atención , esta es una enfermedad que tiene un componente emocional importante ( pasas del llanto a la risa , a la angustia , al enojo , a la incertidumbre y a las ganas de dejar todo).",
                "Tips para sobrellevar la enfermedad ( se lo que sientes  ) así que hay conductas y hábitos importantes que te voy a recomendar."
                ],
    },
    {
        title: "Lupus",
        image: lupus,
        items: ["Mi objetivo es controlar tus anticuerpos para evitar que ataque tus propios órganos.", 
                "Vigilancia continua, esta es una enfermedad muy destructiva que si no la controlamos : afectará a la piel , los riñones, pulmones, sangre, cerebro y articulaciones.", 
                "Elegir los medicamentos seguros , ya que está es uña enfermedad que llegó para quedarse , así que solo te indicaré las medicaciones necesarios.",
                "Esta enfermedad es por épocas , días bien o días mal . Pero si la seguimos juntos podriamos mantenerla en remisión por muchos años ( mantenerla dormida ) y que tengas una vida normal.",
                "Ayudarte a que puedas tener una vida social normal , vida sexual normal , una pareja , hijos y una familia."
                ],
    },
    {
        title: "Esclerodermia",
        image: esclerodermia,
        items: ["Mi objetivo es controlar la actividad de la enfermedad, para frenar y ablandar el endurecimiento de tu piel y tus órganos internos.", 
                "Cuidar tus manos , tus   pulmones, corazón y aparato digestivo mediante exámenes complementarios y tratar lo que se afecte lo más rápido posible.", 
                "Mejorar la circulación y el funcionamiento de tus manos especialmente cuando se te ponen azules o blancas (fenómeno de Raynaud) lo sé es terrible con el frío o la humedad."
                ],
    },
    {
        title: "Gota (Ácido Úrico Elevado)",
        image: gota,
        items: [
                "Mi objetivo es bajar la inflamación y el dolor de los ataques en los dedos , para que puedas caminar, dormir y trabajar sin crisis que te frenen la vida.",
                "Controlar el ácido úrico en sangre, porque la gota no es solo un dedo inflamado: puede afectar riñones provocando insuficiencia renal de forma permanente si no se trata.",
                "Elegir el tratamiento adecuado a largo plazo, no se trata de tomar la colchicina o alopurinol toda la vida , sino de escoger la medicación y  correcta al tiempo que sea necesario.",
                "Consejos nutricionales , el paciente con gota puede comer todos los alimentos en la porción adecuada inclusive hay alimentos que previenen nuevos ataques de Gota."
                ],
    },
    {
        title: "Dolor columna y de cadera",
        image: dolorcolumna,
        items: ["Mi objetivo es disminuir el dolor en almenos un 50% y que puedas hacer tus actividades de la vida diaria.", 
                "Proponerte el inicio de medicamentos que te ayuden aliviar el dolor de espalda ( existe un gran arsenal de medicamentos pero lo decidiremos juntos que fármaco tomar ).", 
                "Quedarte quieto es lo peor así te indicare actividades físicas que te ayuden a tu columna y tu cadera  : ej natación , yoga.",
                "Se que ya pasaste por varios tratamientos y por varios médicos si llegaste hasta aquí . Y quiero que sepas que hay muchas formas de ayudarte con tu dolor."
                ],
    },
    {
        title: "Osteoporosis",
        image: osteoporosis,
        items: ["Mi objetivo es fortalecer tus huesos por que están blandos aunque no lo sientas , hay mucho riesgo de fractura  ( la fractura de una vértebra o de la cadera = silla de ruedas).", 
                "La osteoporosis es reversible si la diagnosticamos y la tratamos a tiempo.", 
                "Te medicaré de la manera adecuada ( hay tratamiento que solo son de 1 píldora al mes ) el resto del tratamiento es la dieta.",
                "No te eliminaré ninguna comida de tu dieta , agregaré alimentos que fortalezcan tus huesos."
                ],
    },
    {
        title: "Artritis Psoriásica",
        image: artritispsoriasica,
        items: ["Mi objetivo es tratar la psoriasis no es solo piel y cabello . Lastimosamente afecta también las articulaciones de la mano ,  los tendones , la columna , los ojos , el intestino.", 
                "Te ayudare a que no se te inflamen las manos y que no te duelan los pies ( si te empezó a doler la columna también consulta lo más rápido  ya que la psoriasis puede atacar ahí  también ).", 
                "El tratamiento para la inflamación de las manos por lo general es el mismo que el de la piel así que puedo indicarte medicaciónes que te ayuden a limpiar la piel, el cabello y te mejoren las uñas."
                ],
    },
    {
        title: "Dolor en rodillas",
        image: dolorrodillas,
        items: ["Mi objetivo es determinar cuáles son las causas por que hay muchas : Artrosis , Artritis , Depósitos de cristales , problemas de meniscos ) por accidentes.", 
                "Te enviaré exámenes complementaris para un diagnóstico preciso sin vueltas.", 
                "El tratamiento que te ofrecere sería  escalonado  ( no te meteré miedo con cirugías )  podemos intentar muchas cosas antes  y todo sería charlable  : hay fármacos , podríamos hacer infiltraciones , kinesioterapia y rehabilitación de tus rodillas.",
                ],
    },
    {
        title: "Hormigueo - electricidad - adormecimiento ",
        image: hormigueo,
        items: ["Mi objetivo es estudiar este síntoma por qué puede ser que el cuerpo está avisando la posibilidad de una enfermedad ", 
                "Primero intentar sacarte esas molestias para que puedas seguir con tu vida cotidiana normalmente.", 
                "Buscar un diagnóstico preciso y oportuno  , solicitando exámenes o estudios complementarios que me ayuden a determinar de qué enfermedad  tienes o de qué déficit vitamínico careces que causen tus hormigueos o adormecimientos.",
                "Mejorarte tu estilo de vida para que este hormigueo no vuelva aparecer o almenos que  aparezca muy poco .",
            ],
    },
    {
        title: "Dermatomiositis",
        image: dermatomiositis,
        items: ["Mi objetivo es tratar esta enfermedad difícil de diagnóstica y difícil de tratar pero no imposible ", 
                "Recuperar tu fuerza muscular al 100% ", 
                "Que tú piel tenga la mismo apariencia hermosa de antes  , sin lesiones o enrojecimiento.",
                "Seguimiento de tu enfermedad con exámenes de laboratorio y estudios importantes y necesarios ( sin asustarte con los años esta enfermedad se puede asociar al cancer ",
                ],
    },
    {
        title: "No sé, solo me duele",
        items: ["Te realizaré una evaluación completa", 
                "Necesitamos hablarlo", 
                "Consúltanos por whatsapp, no lo pienses más.....!!!",
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

<div className="container solutions-container">

<h3 className="subtitle-general mb-5 ">
<span className="subtitle-celeste"> ¿YA SABES TU</span>
<span className="subtitle-negro"> DIAGNÓSTICO?</span>
</h3>

<div className="row g-4">

{solutions.map((sol, index) => (

<div className="col-md-4" key={index}>

<div className="solutions-card">

<button
className="solutions-header"
onClick={() => toggleItem(index)}
>

{sol.title}

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