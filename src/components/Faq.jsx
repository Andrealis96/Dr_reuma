import React, { useState } from "react";
import "../styles/App.css";
import { FaPlus, FaMinus } from "react-icons/fa";

function Faq() {

  const [openIndex, setOpenIndex] = useState(null);

  const preguntas = [
    {
      pregunta: "¿Cuándo debo consultar a un reumatólogo?",
      respuesta:
        "Si tienes dolor articular persistente, inflamación, rigidez o sospecha de una enfermedad autoinmune."
    },
    {
      pregunta: "¿Dónde se encuentra el consultorio?",
      respuesta: "Atendemos en los consultorios externos de la Clínica San Agustín en San Martín 1355 - Neuquén Capital. Nos puedes encontrar en google maps Dr. Reuma."
    },
    {
      pregunta: "¿Atienden pacientes de otras provincias?",
      respuesta:
        "Sí. Las consultas virtuales permiten atender pacientes de todo el país."
    },
    {
      pregunta: "¿Que síntomas indica una enfermedad reumatológica?",
      respuesta:
        "Dolor articular persistente, inflamación, rigidez matutina, cansancio excesivo, dolor muscular o síntomas autoinmunes."
    },
    {
      pregunta: "¿Atienden enfermedades autoinmunes?",
      respuesta:
        "Sí. Evaluamos y tratamos lupus, artritis reumatoide, vasculitis, síndrome de Sjögren y otras enfermedades autoinmunes."
    },
     {
      pregunta: "¿Aceptan obras sociales?",
      respuesta: "Por el momento no. Solo consultas privadas, tanto presenciales como virtuales."
    },
    {
      pregunta: "¿Necesito derivación médica para atenderme?",
      respuesta:
        "No. Puedes solicitar tu turno directamente desde la página web o por WhatsApp."
    },
    {
      pregunta: "¿Qué enfermedades atiende un reumatólogo?",
      respuesta:
        "Atendemos artritis, lupus, fibromialgia, osteoporosis, gota, vasculitis y otras enfermedades autoinmunes."
    },
    {
      pregunta: "¿Qué debo llevar a la consulta?",
      respuesta:
        "Es recomendable traer análisis, radiografías, resonancias y estudios previos."
    },
    {
      pregunta: "¿Los sábados hay atención presencial?",
      respuesta:
        "No. Los sábados únicamente realizamos consultas virtuales."
    },
    {
      pregunta: "¿Tenemos redes sociales?",
      respuesta:
        "Si, en Instagram nos pueden encontrar como (@dr.reuma) -  Facebook (Dr. Reuma Ec) - TikTok (Dr. Reuma)"
    },
];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section py-5">

      <div className="container">

        <h3 className="subtitle-general mb-5">
          <span className="subtitle-celeste">
            PREGUNTAS
          </span>

          <span className="subtitle-negro">
            FRECUENTES
          </span>
        </h3>

        <div className="faq-container">

          {preguntas.map((item, index) => (

            <div className="faq-card" key={index}>

              <button
                className="faq-question"
                onClick={() => toggleFaq(index)}
              >

                <span>{item.pregunta}</span>

                {openIndex === index
                  ? <FaMinus />
                  : <FaPlus />
                }

              </button>

              <div
                className={`faq-answer ${
                  openIndex === index
                    ? "open"
                    : ""
                }`}
              >
                <p>{item.respuesta}</p>
              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Faq;