import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaVirus,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import lupus from "../assets/lupus.webp";

function Lupus() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Lupus en Neuquén | Síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para lupus. Conoce síntomas, seguimiento y tratamiento del lupus con Dr. Reuma, especialista en enfermedades autoinmunes."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaVirus className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">LUPUS</span>
            </h1>

            <p className="diagnostico-subtitle">
              El lupus es una enfermedad autoinmune que puede afectar la piel,
              articulaciones, riñones, pulmones, sangre y otros órganos. En
              <strong> Dr. Reuma</strong> ofrecemos atención reumatológica en
              <strong> Neuquén Capital</strong>, orientada al diagnóstico,
              seguimiento y tratamiento personalizado de pacientes con lupus y
              otras enfermedades autoinmunes. Brindamos atención{" "}
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
              src={lupus}
              alt="Lupus"
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
                Controlar la actividad de la enfermedad y proteger órganos
                importantes como riñones, pulmones y articulaciones.
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
                Realizaremos controles clínicos y estudios periódicos para
                detectar cambios de manera temprana.
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
                Indicaremos tratamientos personalizados para mantener la
                enfermedad estable y mejorar tu calidad de vida.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas dolor articular persistente,
            cansancio marcado, lesiones en la piel, sensibilidad al sol, caída
            de cabello, fiebre sin causa clara, alteraciones en análisis de sangre
            u orina, o sospecha de una enfermedad autoinmune.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con lupus?
          </h2>

          <p>
            Una evaluación reumatológica temprana puede ayudar a confirmar el
            diagnóstico, controlar la enfermedad y prevenir complicaciones.
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

export default Lupus;