import "../styles/App.css";

import {
  FaChevronLeft,
  FaChevronRight,
  FaPlayCircle,
  FaImages
} from "react-icons/fa";

import { useRef } from "react";

import esclerodermiaImg from "../assets/esclerodermiaa.webp";
import rodillaImg from "../assets/rodilla.webp";
import dermatomiositisImg from "../assets/dermatomiositiss.webp";
import lupusImg from "../assets/lupuss.webp";
import protesisImg from "../assets/protesis.webp";
import gotaImg from "../assets/gotaa.webp";
import osteoporosisImg from "../assets/osteoporosiss.webp";
import fibromialgiaImg from "../assets/fibromialgiaa.webp";
import paciente1 from "../assets/paciente1.webp"
import paciente2 from "../assets/paciente2.webp"
import paciente3 from "../assets/paciente3.webp"
import paciente4 from "../assets/paciente4.webp"
import paciente5 from "../assets/paciente5.webp"

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
    <section className="galeria" id="galeriaa">
      <div className="container py-1">  
      <h2 className="subtitle-general mb-5">
        <span className="subtitle-celeste">GALERÍA DE </span>
        <span className="subtitle-negro">CASOS</span>
      </h2>

      {/* VIDEOS */}
      <div className="galeria-section">

        <div className="galeria-header">
          <h4 className="fw-bold">
            <span className="me-2 fs-2 galeria-icon">
              <FaPlayCircle />
            </span>
            VIDEOS DE CASOS
          </h4>

          <div className="galeria-buttons">
            <button onClick={() => scroll(videosRef, "left")}>
              <FaChevronLeft />
            </button>

            <button onClick={() => scroll(videosRef, "right")}>
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="galeria-slider" ref={videosRef}>

          {videos.map((video, index) => (
            <div className="video-card" key={index}>

              <video
                src={video.src}
                controls
                preload="metadata"
                muted
              />

              <p>{video.title}</p>

            </div>
          ))}

        </div>
      </div>



      {/* IMÁGENES */}
      <div className="galeria-section">

        <div className="galeria-header">
          <h4 className="fw-bold">
            <span className="me-2 fs-2 galeria-icon">
              <FaImages  />
            </span>
              IMÁGENES CON PACIENTES
          </h4>

          <div className="galeria-buttons">
            <button onClick={() => scroll(pacientesRef, "left")}>
              <FaChevronLeft />
            </button>

            <button onClick={() => scroll(pacientesRef, "right")}>
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="galeria-slider" ref={pacientesRef}>

          {imagenespacientes.map((img, index) => (
            <div className="image-card" key={index}>

              <img
                src={img.src}
                alt={img.title}
              />

              <p>{img.title}</p>

            </div>
          ))}

        </div>
      </div>
    
     {/* IMÁGENES */}
      <div className="galeria-section">

        <div className="galeria-header">
          <h4 className="fw-bold">
            <span className="me-2 fs-2 galeria-icon">
              <FaImages />
            </span>
            IMÁGENES DE ENFERMEDADES
          </h4>

          <div className="galeria-buttons">
            <button onClick={() => scroll(casosRef, "left")}>
              <FaChevronLeft />
            </button>

            <button onClick={() => scroll(casosRef, "right")}>
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="galeria-slider" ref={casosRef}>

          {imagenescasos.map((img, index) => (
            <div className="image-card" key={index}>

              <img
                src={img.src}
                alt={img.title}
              />

              <p>{img.title}</p>

            </div>
          ))}

        </div>
      </div>
    
      </div>
    </section>
  );
}

export default Galeria;