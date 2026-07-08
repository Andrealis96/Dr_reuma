import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaBrain,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import fibromialgia from "../assets/fibromialgia.webp";

function Fibromialgia() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Fibromialgia en Neuquén | Síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para fibromialgia. Conoce síntomas como dolor generalizado, cansancio, mal descanso y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaBrain className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">FIBROMIALGIA</span>
            </h1>

            <p className="diagnostico-subtitle">
              La fibromialgia es una condición que puede producir dolor
              generalizado, cansancio, sueño no reparador, sensación de
              hormigueo, adormecimiento y dificultad para realizar actividades
              diarias. En <strong>Dr. Reuma</strong> ofrecemos atención
              reumatológica en <strong> Neuquén Capital</strong>, orientada a
              evaluar tus síntomas, descartar otras causas y acompañarte con un
              tratamiento personalizado. Brindamos atención{" "}
              <strong>presencial y online</strong>. Puedes solicitar turnos
              desde la página web o comunicarte por WhatsApp.
            </p>

            <div className="diagnostico-badge mb-3">
              <FaMapMarkerAlt className="me-2 flex-shrink-0" />
              <span>
                Neuquén Capital - San Martín 1355, Consultorios Externos Clínica San Agustín
              </span>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
              <Link
                to="/servicios"
                className="btn btn-info fw-bold text-white"
              >
                <FaCalendarCheck className="me-2" />
                Solicitar consulta
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

              <a
                href="https://www.instagram.com/drreuma"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-instagram fw-bold text-white"
              >
                <FaInstagram className="me-2" />
                Instagram
              </a>
            </div>

          </div>

          <div className="col-12 col-lg-6 text-center">
            <img
              src={fibromialgia}
              alt="Fibromialgia"
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
                Ayudarte a disminuir el dolor, el cansancio y la sensación de
                hormigueo o adormecimiento.
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
                Trabajaremos sobre el descanso, el sueño y el agotamiento físico
                mediante un acompañamiento cercano y personalizado.
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
                Buscaremos mejorar tu calidad de vida con medicación, hábitos
                saludables y estrategias adaptadas a tus síntomas.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas dolor generalizado persistente,
            cansancio intenso, sueño no reparador, rigidez, hormigueos,
            adormecimiento o dolor corporal que afecta tu calidad de vida.
            Una evaluación médica ayuda a descartar otras enfermedades y orientar
            el tratamiento adecuado.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con fibromialgia?
          </h2>

          <p>
            Una evaluación reumatológica puede ayudarte a comprender mejor tus
            síntomas, descartar otras causas y comenzar un plan de tratamiento
            personalizado.
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

export default Fibromialgia;