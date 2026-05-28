import { motion } from "framer-motion";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaUserMd,
  FaClipboardCheck,
  FaPlayCircle
} from "react-icons/fa";

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

        <h5 className="subtitle text-center fw-bold">
          Tratamiento • Diagnóstico • Seguimiento
        </h5>

        {/* CONTENIDO PRINCIPAL */}
        <div className="row align-items-start">

          {/* IZQUIERDA */}
          <div className="col-lg-7 text-center text-md-start">

            <h4 className="title-negro fw-bold mb-4">
              <FaMapMarkerAlt className="fs-2 me-1 celeste" />
                (San Martín 1355 - Neuquén Capital)
            </h4>

            <p className="welcome-text">
            En <span className="fw-bold celeste">Dr. reuma</span> trabajamos para que vuelvas a moverte sin dolor
            y mejores tu calidad de vida mediante una atención
            médica cercana, humana y personalizada.
            Nos enfocamos en el diagnóstico temprano,
            tratamiento y seguimiento de enfermedades
            reumatológicas y autoinmunes.  <br />
            <span className="fw-bold celeste">
              Tratamos patologías como:<br />
            </span>
            Fibromialgia, artritis reumatoidea, artritis psoriásica, 
            lupus, artrosis, osteoporosis, dolor articular (rodilla, columnas, manos), Síndrome de Sjögren
            y entre otras.

              <br /><br />

              <span className="fw-bold text-uppercase">
                <FaHeart className="me-3 fs-2 celeste" />
                Acá no sos un número: sos una persona.
              </span>
            </p>

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