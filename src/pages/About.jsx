import doctor from "../assets/doctor1.webp";
import expo1 from "../assets/expo1.webp";
import expo2 from "../assets/expo5.webp";
import expo3 from "../assets/expo6.webp";
import expo4 from "../assets/expo4.webp";

import {
  FaWhatsapp,
  FaUserMd,
  FaHeartbeat,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaHeart
} from "react-icons/fa";

import "../styles/App.css";

function About() {

  const message =
    "Hola, solicito una consulta con el Dr.Reuma escribo de la pagina web. Mi nombre es ";

  const whatsappLink = `https://wa.me/5492994666559?text=${encodeURIComponent(message)}`;

  return (

    <section className="container about-section py-5" id="nosotros">

      {/* HEADER */}
      <div className="text-center mb-5">

        <h2 className="subtitle-general">
          <span className="subtitle-celeste fw-bold">
            SOBRE
          </span>

          <span className="subtitle-negro fw-bold">
            {" "}EL ESPECIALISTA
          </span>
        </h2>

        <p className="text-muted fst-italic">
          Compromiso con el diagnóstico temprano y el tratamiento integral
          de enfermedades reumatológicas.
        </p>

      </div>

      {/* CONTENIDO */}
      <div className="row align-items-start g-5">

        {/* TEXTO */}
        <div className="col-lg-7">

          <h3 className="celeste fw-bold mb-4">
            EXPERIENCIA Y ENFOQUE MÉDICO
          </h3>

          <p className="about-text">
            El Dr. Tony Vélez conocido como
            <span className="doctor-credencial fw-bold">
              {" "}Dr. Reuma
            </span>
            , es médico especialista en reumatología dedicado al diagnóstico,
            tratamiento y seguimiento de enfermedades articulares,
            autoinmunes y musculoesqueléticas.
          </p>

          <p className="about-text">
            Actualmente atiende en
            <span className="doctor-credencial fw-bold">
              {" "}Clínica San Agustín 1355 (consultorios externos)
            </span>
            {" "}en Neuquén Capital.
          </p>

          <p className="about-text">
            Su enfoque se centra en brindar diagnósticos precisos,
            tratamientos personalizados y seguimiento médico continuo
            para mejorar la calidad de vida de cada paciente.
          </p>

          <p className="about-text">
            Además de su práctica clínica participa activamente en congresos,
            actualizaciones médicas y espacios académicos relacionados con
            enfermedades reumatológicas y dolor articular.
          </p>

          {/* BENEFICIOS */}
          <div className="row mt-4 g-3">

            <div className="col-md-6">
              <div className="feature-card">
                <FaUserMd className="feature-icon" />
                Diagnóstico temprano
              </div>
            </div>

            <div className="col-md-6">
              <div className="feature-card">
                <FaHeartbeat className="feature-icon" />
                Tratamientos personalizados
              </div>
            </div>

            <div className="col-md-6">
              <div className="feature-card">
                <FaClipboardCheck className="feature-icon" />
                Seguimiento continuo
              </div>
            </div>

            <div className="col-md-6">
              <div className="feature-card">
                <FaHeart className="feature-icon" />
                Atención humana y profesional
              </div>
            </div>

          </div>

          {/* UBICACION */}
          <div className="location-box mt-4">

            <FaMapMarkerAlt className="location-icon" />

            <div>
              <h6 className="fw-bold mb-1">
                NEUQUÉN CAPITAL
              </h6>

              <p className="mb-0">
                Clínica San Agustín 1355 — Consultorios externos
              </p>
            </div>

          </div>

          {/* BOTON */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="about-btn"
          >
            <FaWhatsapp />
            Solicitar turno por WhatsApp
          </a>

        </div>

        {/* CARD DOCTOR */}
        <div className="col-lg-5">

          <div className="doctor-card">

            <img
              src={doctor}
              alt="Dr Tony Vélez"
              className="doctor-img"
            />

            <div className="doctor-content">

              <h4 className="doctor-name">
                DR. TONY VÉLEZ
              </h4>

              <div className="doctor-badge">
                Médico Reumatólogo
              </div>

              <p className="doctor-info">
                • Universidad de Buenos Aires (UBA)
              </p>

              <p className="doctor-info">
                • Hospital Ramos Mejía
              </p>

              <p className="doctor-info">
                • Centro Gallego de Buenos Aires
              </p>

              <p className="doctor-info">
                • Sociedad Argentina de Reumatología
              </p>

              <p className="doctor-info">
                • Sociedad Ecuatoriana de Reumatología
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* EXPERIENCIA */}
      <div className="row text-center mt-5 g-4">

        <div className="col-md-4">

          <div className="trust-card">
            <h2 className="fw-bold celeste">+5</h2>
            <p>Años de experiencia</p>
          </div>

        </div>

        <div className="col-md-4">

          <div className="trust-card">
            <h2 className="fw-bold celeste">+1000</h2>
            <p>Pacientes atendidos</p>
          </div>

        </div>

        <div className="col-md-4">

          <div className="trust-card">
            <h2 className="fw-bold celeste">Actualización</h2>
            <p>Médica constante</p>
          </div>

        </div>

      </div>

      {/* CONGRESOS */}
      <div className="mt-5">

        <div className="text-center mb-4">

          <h4 className="celeste fw-bold">
            PARTICIPACIÓN EN ACTUALIZACIONES MÉDICAS
          </h4>

          <p className="text-muted">
            Congresos, formación continua y educación médica.
          </p>

        </div>

        <div className="row g-3">

          {[expo1, expo2, expo3, expo4].map((img, i) => (

            <div className="col-6 col-md-3" key={i}>

              <div className="expo-img">

                <img
                  src={img}
                  className="img-fluid"
                  alt="Congreso médico"
                />

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default About;