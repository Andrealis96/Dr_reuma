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
  FaWhatsapp,
  FaClock
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

    {/* ACCESOS RÁPIDOS SOBRE EL HERO */}
    <div className="welcome-quick-wrap">

      <div className="welcome-quick-grid">

        {/* TURNOS */}
        <Link
          to="/servicios"
          className="welcome-quick-card welcome-quick-turnos"
        >
          <div className="welcome-quick-icon">
            <FaCalendarCheck />
          </div>

          <h3>Turnos</h3>

          <p>
            Lunes a viernes de 15 a 18 hs <br />
            Jueves de 10 a 12 hs <br />
            Sabados 10 a 12 hs
          </p>

          <span className="welcome-quick-button">
            Agendar turno →
          </span>
        </Link>

        {/* UBICACIÓN */}
        <a
          href="https://maps.app.goo.gl/iJ6E4Vr4gTCNvQXw8"
          target="_blank"
          rel="noopener noreferrer"
          className="welcome-quick-card welcome-quick-ubicacion"
        >
          <div className="welcome-quick-icon">
            <FaMapMarkerAlt />
          </div>

          <h3>Ubicación</h3>

          <p>
            Clínica San Agustín <br />
            Neuquén Capital <br />
            San Martín 1355

          </p>

          <span className="welcome-quick-button">
            Ver ubicación →
          </span>
        </a>

        {/* HORARIOS */}
        <div className="welcome-quick-card welcome-quick-horarios">

          <div className="welcome-quick-icon">
            <FaClock />
          </div>

          <h3>Atención</h3>

          <p>
            Enfermedades Reumatológicas y autoinmunes. <br />
            Infiltraciones , Capiloroscopia, antención de calidad. <br />
            
          </p>

          <Link
            to="/diagnosticos"
            className="welcome-quick-button"
          >
            Reumatología →
          </Link>

        </div>

        {/* WHATSAPP */}
        <a
          href="https://wa.me/5492995095471"
          target="_blank"
          rel="noopener noreferrer"
          className="welcome-quick-card welcome-quick-whatsapp"
        >
          <div className="welcome-quick-icon">
            <FaWhatsapp />
          </div>

          <h3>WhatsApp</h3>

          <p>
            Contacto directo Turnos y SobreTurnos
          </p>

          <span className="welcome-quick-button">
            Escribir ahora →
          </span>
        </a>

      </div>

    </div>

    <div className="container">

        {/* TITULO */}
        <h1 className="title-general welcome-title text-center py-3 ly-text text-uppercase">
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

  <span className="fw-bold celeste text-center d-flex align-items-center justify-content-center">
    <FaHeart className="fs-4 me-1 celeste" />
    Acá no sos un número: sos una persona.
  </span>
</p>

{/* BENEFICIOS */}
<motion.div
  className="welcome-benefits-inline"
  initial={{ opacity: 0, y: 25 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  <div className="benefits benefits-line">
    {benefits.map((item, index) => (
      <motion.div
        key={index}
        className="benefit-item benefit-item-line"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.12 }}
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