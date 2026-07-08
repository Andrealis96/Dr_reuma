import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaHandHoldingMedical,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import artritispsoriasica from "../assets/artritispsoriasica.webp";

function Artritispsoriasica() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Artritis Psoriásica en Neuquén | Síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para artritis psoriásica. Evaluación de dolor articular, psoriasis, tendones, columna y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaHandHoldingMedical className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">ARTRITIS</span>
              <span className="subtitle-negro"> PSORIÁSICA</span>
            </h1>

            <p className="diagnostico-subtitle">
              La artritis psoriásica es una enfermedad inflamatoria que puede
              afectar articulaciones, tendones, columna, piel y uñas. Puede
              presentarse en personas con psoriasis o antecedentes familiares de
              psoriasis. En <strong>Dr. Reuma</strong> ofrecemos atención
              reumatológica en <strong> Neuquén Capital</strong>, orientada al
              diagnóstico temprano, seguimiento y tratamiento personalizado.
              Brindamos atención <strong>presencial y online</strong>. Puedes
              solicitar turnos desde la página web o comunicarte por WhatsApp.
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
              src={artritispsoriasica}
              alt="Artritis Psoriásica"
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
                Controlar la inflamación articular y mejorar los síntomas en
                piel y uñas.
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
                Evaluaremos la evolución de la enfermedad y su impacto sobre
                articulaciones, columna y tendones.
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
                Indicaremos terapias orientadas a aliviar el dolor y prevenir
                daño articular a largo plazo.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si tienes psoriasis y presentas dolor o
            inflamación articular, rigidez matinal, dolor en talones, dedos
            hinchados, dolor lumbar inflamatorio, cambios en las uñas o
            limitación para realizar tus actividades habituales.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con artritis psoriásica?
          </h2>

          <p>
            Una evaluación reumatológica temprana puede ayudar a confirmar el
            diagnóstico, controlar la inflamación y prevenir daño articular.
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

export default Artritispsoriasica;