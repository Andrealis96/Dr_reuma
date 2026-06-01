import React, { useState } from "react";
import "../styles/App.css";
import { FaPlus, FaMinus } from "react-icons/fa";
import { faqData } from "../data/faqData";

function Faq() {

  const [openIndex, setOpenIndex] = useState(null);

  const preguntas = faqData;

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