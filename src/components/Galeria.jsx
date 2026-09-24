import "../styles/App.css";

import {
  FaChevronLeft,
  FaChevronRight,
  FaPlayCircle,
  FaImages
} from "react-icons/fa";

import { useRef } from "react";

/* IMÁGENES DE ENFERMEDADES */
import esclerodermiaImg from "../assets/esclerodermiaa.webp";
import rodillaImg from "../assets/rodilla.webp";
import dermatomiositisImg from "../assets/dermatomiositiss.webp";
import lupusImg from "../assets/lupuss.webp";
import protesisImg from "../assets/protesis.webp";
import gotaImg from "../assets/gotaa.webp";
import osteoporosisImg from "../assets/osteoporosiss.webp";
import fibromialgiaImg from "../assets/fibromialgiaa.webp";

/* IMÁGENES CON PACIENTES */
import paciente1 from "../assets/paciente1.webp";
import paciente2 from "../assets/paciente2.webp";
import paciente3 from "../assets/paciente3.webp";
import paciente4 from "../assets/paciente4.webp";
import paciente5 from "../assets/paciente5.webp";

/* VIDEOS */
import gotavideo from "../assets/gotavideo.mp4";
import esclerodermiavideo from "../assets/esclerodermiavideo.mp4";
import artritisvideo from "../assets/artritisreumavideo.mp4";

function Galeria() {
  const videosRef = useRef(null);
  const pacientesRef = useRef(null);
  const casosRef = useRef(null);

  const scroll = (ref, direction) => {
    if (!ref.current) return;

    ref.current.scrollBy({
      left: direction === "left" ? -350 : 350,
      behavior: "smooth"
    });
  };

  /* ============================
     VIDEOS
  ============================ */

  const videos = [
    {
      src: gotavideo,
      title: "ARTROSIS SEVERA EN PIES"
    },
    {
      src: esclerodermiavideo,
      title: "ESCLERODERMIA"
    },
    {
      src: artritisvideo,
      title: "ARTRITIS REUMATOIDE"
    }
  ];

  /* ============================
     IMÁGENES CON PACIENTES
  ============================ */

  const imagenespacientes = [
    {
      src: paciente1,
      title: "EXAMEN FÍSICO"
    },
    {
      src: paciente2,
      title: "DOLOR EN ARTICULACIONES"
    },
    {
      src: paciente3,
      title: "DESCUBRIENDO MOLESTIAS"
    },
    {
      src: paciente4,
      title: "EXAMEN DE RUTINA"
    },
    {
      src: paciente5,
      title: "TOMANDO HISTORIA CLÍNICA"
    },
    {
      src: rodillaImg,
      title: "DOLOR DE RODILLA"
    }
  ];

  /* ============================
     IMÁGENES DE ENFERMEDADES
  ============================ */

  const imagenescasos = [
    {
      src: esclerodermiaImg,
      title: "ESCLERODERMIA"
    },
    {
      src: dermatomiositisImg,
      title: "DERMATOMIOSITIS"
    },
    {
      src: lupusImg,
      title: "LUPUS"
    },
    {
      src: gotaImg,
      title: "PIE DE GOTA"
    },
    {
      src: fibromialgiaImg,
      title: "FIBROMIALGIA"
    },
    {
      src: protesisImg,
      title: "ARTROSIS AVANZADA"
    },
    {
      src: osteoporosisImg,
      title: "OSTEOPOROSIS"
    }
  ];

  return (
    <section className="galeria galeria-modern-page" id="galeriaa">

      <div className="container ">

        {/* ===================================================
            CABECERA PRINCIPAL
        =================================================== */}

        <div className="galeria-public-hero">

          <div className="galeria-public-badge">
            <FaImages />
            Casos clínicos
          </div>

          <h2 className="galeria-public-title">
            <span className="title-celeste">
              GALERÍA DE
            </span>{" "}
            <span className="title-negro">
              CASOS
            </span>
          </h2>

          <p className="galeria-public-description">
            Conocé algunos casos, exploraciones físicas e imágenes de
            enfermedades reumatológicas atendidas en{" "}
            <strong className="celeste">
              Dr. Reuma
            </strong>.
          </p>

        </div>


        {/* ===================================================
            VIDEOS DE CASOS
        =================================================== */}

        <div className="galeria-modern-panel">

          <div className="galeria-modern-header">

            <div>

              <div className="galeria-modern-kicker">
                <FaPlayCircle />
                Videos clínicos
              </div>

              <h3>
                Videos de casos
              </h3>

              <p>
                Exploraciones, hallazgos y manifestaciones reumatológicas.
              </p>

            </div>


            <div className="galeria-modern-buttons">

              <button
                type="button"
                onClick={() => scroll(videosRef, "left")}
                aria-label="Video anterior"
                title="Anterior"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                onClick={() => scroll(videosRef, "right")}
                aria-label="Siguiente video"
                title="Siguiente"
              >
                <FaChevronRight />
              </button>

            </div>

          </div>


          <div
            className="galeria-modern-slider"
            ref={videosRef}
          >

            {videos.map((video, index) => (

              <article
                className="galeria-modern-card"
                key={index}
              >

                <div className="galeria-modern-media">

                  <video
                    src={video.src}
                    controls
                    preload="metadata"
                    muted
                    playsInline
                  />

                </div>

                <div className="galeria-modern-card-footer">

                  <span>
                    CASO CLÍNICO
                  </span>

                  <strong>
                    {video.title}
                  </strong>

                </div>

              </article>

            ))}

          </div>

        </div>


        {/* ===================================================
            IMÁGENES CON PACIENTES
        =================================================== */}

        <div className="galeria-modern-panel">

          <div className="galeria-modern-header">

            <div>

              <div className="galeria-modern-kicker">
                <FaImages />
                Atención médica
              </div>

              <h3>
                Evaluación de pacientes
              </h3>

              <p>
                Examen físico y valoración reumatológica en consultorio.
              </p>

            </div>


            <div className="galeria-modern-buttons">

              <button
                type="button"
                onClick={() => scroll(pacientesRef, "left")}
                aria-label="Imagen anterior"
                title="Anterior"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                onClick={() => scroll(pacientesRef, "right")}
                aria-label="Siguiente imagen"
                title="Siguiente"
              >
                <FaChevronRight />
              </button>

            </div>

          </div>


          <div
            className="galeria-modern-slider"
            ref={pacientesRef}
          >

            {imagenespacientes.map((img, index) => (

              <article
                className="galeria-modern-card"
                key={index}
              >

                <div className="galeria-modern-media">

                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                  />

                </div>

                <div className="galeria-modern-card-footer">

                  <span>
                    CONSULTORIO
                  </span>

                  <strong>
                    {img.title}
                  </strong>

                </div>

              </article>

            ))}

          </div>

        </div>


        {/* ===================================================
            IMÁGENES DE ENFERMEDADES
        =================================================== */}

        <div className="galeria-modern-panel">

          <div className="galeria-modern-header">

            <div>

              <div className="galeria-modern-kicker">
                <FaImages />
                Reumatología
              </div>

              <h3>
                Manifestaciones clínicas
              </h3>

              <p>
                Algunas enfermedades y hallazgos que pueden observarse
                en reumatología.
              </p>

            </div>


            <div className="galeria-modern-buttons">

              <button
                type="button"
                onClick={() => scroll(casosRef, "left")}
                aria-label="Caso anterior"
                title="Anterior"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                onClick={() => scroll(casosRef, "right")}
                aria-label="Siguiente caso"
                title="Siguiente"
              >
                <FaChevronRight />
              </button>

            </div>

          </div>


          <div
            className="galeria-modern-slider"
            ref={casosRef}
          >

            {imagenescasos.map((img, index) => (

              <article
                className="galeria-modern-card"
                key={index}
              >

                <div className="galeria-modern-media">

                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                  />

                </div>

                <div className="galeria-modern-card-footer">

                  <span>
                    ENFERMEDAD REUMATOLÓGICA
                  </span>

                  <strong>
                    {img.title}
                  </strong>

                </div>

              </article>

            ))}

          </div>

        </div>


        {/* ===================================================
            CIERRE
        =================================================== */}

        <div className="galeria-final-card">

          <strong>
            Atención presencial en Neuquén Capital y consultas online.
          </strong>

          <span>
            Tu calidad de vida es nuestra prioridad.
          </span>

        </div>

      </div>

    </section>
  );
}

export default Galeria;