import { motion } from "framer-motion";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaUserMd,
  FaClipboardCheck,
  FaPlayCircle, 
  FaCalendarCheck,
  FaStethoscope,
  FaWhatsapp
} from "react-icons/fa";

import { Link } from "react-router-dom";
import paciente1 from "../assets/paciente1.webp";
import paciente2 from "../assets/paciente2.webp";
import paciente3 from "../assets/paciente3.webp";
import paciente4 from "../assets/paciente4.webp";
import paciente5 from "../assets/paciente5.webp";

import doctorVideo from "../assets/videoDoctor.mp4";

import "../styles/App.css";

const benefits = [
  { icon: <FaUserMd />, text: "ATENCIÓN PERSONALIZADA" },
  { icon: <FaClipboardCheck />, text: "DIAGNÓSTICO PRECISO" },
  { icon: <FaHeartbeat />, text: "SEGUIMIENTO CONTINUO" }
];

const images = [
  paciente1,
  paciente2,
  paciente3,
  paciente4,
  paciente5
];

function Welcome() {
  return (
    <section className="welcome-section">

      <div className="container">

        {/* TITULO */}
        <h1 className="title-general text-center py-3 ly-text text-uppercase">
          <span className="title-celeste"> Reumatólogo en Neuquén |</span>
          <span className="title-negro"> DR.REUMA</span>
        </h1>

        {/* CONTENIDO PRINCIPAL */}
        <div className="row align-items-start">

          {/* IZQUIERDA */}
          <div className="col-lg-7 text-md-start">

          
            <p className="welcome-text">
  En <span className="fw-bold celeste">Dr. Reuma</span> ofrecemos atención
  reumatológica en <strong>Neuquén Capital</strong>, con un enfoque cercano,
  humano y personalizado para pacientes con dolor articular, inflamación,
  rigidez, cansancio o sospecha de enfermedades autoinmunes.

  <br /><br />

  Nos enfocamos en el diagnóstico temprano, tratamiento y seguimiento de
  enfermedades reumatológicas como artritis reumatoide, artritis psoriásica,
  lupus, artrosis, osteoporosis, gota, fibromialgia, síndrome de Sjögren,
  dolor de columna, dolor de rodillas y otras enfermedades autoinmunes.

  <br /><br />

  <span className="title-negro fw-bold mb-4">
    <FaMapMarkerAlt className="fs-2 me-3 celeste" />
    SAN MARTÍN 1355 - NEUQUÉN CAPITAL
  </span>

  <br />

  <span className="fw-bold text-uppercase">
    <FaHeart className="me-3 fs-2 celeste" />
    Acá no sos un número: sos una persona.
  </span>
</p>

<div className="d-flex flex-column flex-sm-row gap-3 mt-4 mb-4">

  <Link to="/servicios" className="btn btn-info fw-bold text-white">
    <FaCalendarCheck className="me-2" />
    Solicitar turno con reumatólogo
  </Link>

  <Link to="/diagnosticos" className="btn btn-dark fw-bold text-white">
    <FaStethoscope className="me-2" />
    Ver enfermedades reumatológicas
  </Link>

  <a
    href="https://wa.me/5492994666559"
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-verde fw-bold text-white"
  >
    <FaWhatsapp className="me-2" />
    WhatsApp
  </a>

</div>

            {/* BENEFICIOS */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >

              <div className="benefits mt-4">

                {benefits.map((item, index) => (

                  <motion.div
                    key={index}
                    className="benefit-item"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    viewport={{ once: true }}
                  >

                    <span className="benefit-icon">
                      {item.icon}
                    </span>

                    <span>{item.text}</span>

                  </motion.div>

                ))}

              </div>

            </motion.div>

          </div>

          {/* VIDEO */}
          <div className="col-lg-5 d-flex justify-content-center mt-4 mt-lg-0">

            <div className="doctor-video-container">

              <div className="video-badge">
                <FaPlayCircle />
                <span>MENSAJE DEL DR.REUMA</span>
              </div>

              <video
                className="doctor-video"
                src={doctorVideo}
                controls
                autoPlay
                muted
                loop
                playsInline
              />

            </div>

          </div>

        </div>

        {/* SLIDER PACIENTES */}
        <div className="row mt-5">

          <div className="col-12">

            <div className="image-slider">

              <div className="slider-track">

                {[...images, ...images].map((img, i) => (

                  <div className="slide" key={i}>

                    <img
                      src={img}
                      alt="Paciente Dr Reuma"
                      loading="lazy"
                    />

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Welcome;