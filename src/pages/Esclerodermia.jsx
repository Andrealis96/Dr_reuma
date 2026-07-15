import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaProcedures,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import esclerodermia from "../assets/esclerodermia.webp";

function Esclerodermia() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Esclerodermia en Neuquén | Síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para esclerodermia. Conoce síntomas, seguimiento y tratamiento con Dr. Reuma, especialista en enfermedades autoinmunes."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaProcedures className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">ESCLERODERMIA</span>
            </h1>

            <p className="diagnostico-subtitle">
              La esclerodermia es una enfermedad autoinmune que puede afectar
              la piel, la circulación, los pulmones, el corazón y otros órganos.
              En <strong> Dr. Reuma</strong> ofrecemos atención reumatológica en
              <strong> Neuquén Capital</strong>, orientada al diagnóstico,
              seguimiento y tratamiento personalizado de pacientes con
              esclerodermia y otras enfermedades autoinmunes. Brindamos atención{" "}
              <strong>presencial y online</strong>. Puedes solicitar turnos
              desde la página web o comunicarte por WhatsApp.
            </p>

            <div className="diagnostico-badge mb-3">
              <FaMapMarkerAlt className="me-2 flex-shrink-0" />
              <span>
                Neuquén Capital - San Martín 1355, Consultorios Externos Clínica San Agustín
              </span>
            </div>

            <div className="diagnostico-btn-group mt-4">

  <Link
    to="/servicios"
    className="btn btn-info fw-bold text-white diagnostico-btn"
  >
    <FaCalendarCheck className="me-2" />
    Turnos
  </Link>

  <a
    href="https://wa.me/5492994666559"
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-verde fw-bold text-white diagnostico-btn"
  >
    <FaWhatsapp className="me-2" />
    WhatsApp
  </a>

  <a
    href="https://www.instagram.com/drreuma"
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-instagram fw-bold text-white diagnostico-btn diagnostico-btn-instagram"
  >
    <FaInstagram className="me-2" />
    Instagram
  </a>

</div>
          </div>

          <div className="col-12 col-lg-6 text-center">
            <img
              src={esclerodermia}
              alt="Esclerodermia"
              className="diagnostico-hero-img"
            />
          </div>

        </div>

        {/* BLOQUES DE INFORMACIÓN */}
        <div className="row g-4 mb-5">

          <div className="col-12 col-md-4">
            <div className="diagnostico-info-card h-100">
              <div className="diagnostico-card-icon">
                <FaCheckCircle />
              </div>

              <h3>Mi objetivo</h3>

              <p>
                Controlar la progresión de la enfermedad y aliviar los síntomas
                que afectan tu bienestar.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="diagnostico-info-card h-100">
              <div className="diagnostico-card-icon">
                <FaCheckCircle />
              </div>

              <h3>Seguimiento</h3>

              <p>
                Prestaremos atención a la piel, pulmones, corazón y circulación
                mediante controles específicos.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="diagnostico-info-card h-100">
              <div className="diagnostico-card-icon">
                <FaCheckCircle />
              </div>

              <h3>Tratamiento</h3>

              <p>
                Buscaremos mejorar la movilidad, la circulación y la calidad de
                vida con un abordaje integral.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas endurecimiento o engrosamiento
            de la piel, cambios de color en los dedos con el frío, dolor articular,
            dificultad para tragar, falta de aire, tos persistente o sospecha de
            una enfermedad autoinmune.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con esclerodermia?
          </h2>

          <p>
            Una evaluación reumatológica temprana puede ayudar a confirmar el
            diagnóstico, realizar controles específicos y definir el tratamiento
            más adecuado para tu caso.
          </p>

          <Link
            to="/servicios"
            className="btn btn-light fw-bold px-5 mt-2"
          >
            Agendar consulta
          </Link>

        </div>

      </div>

    </section>
  );
}

export default Esclerodermia;