import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaBone,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import artrosis from "../assets/artrosis.webp";

function Artrosis() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Artrosis en Neuquén | Desgaste articular, síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para artrosis y desgaste articular. Conoce síntomas, seguimiento y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaBone className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">ARTROSIS</span>
              <span className="subtitle-negro"> DESGASTE ARTICULAR</span>
            </h1>

            <p className="diagnostico-subtitle">
              La artrosis, también conocida como desgaste articular, puede causar
              dolor, rigidez y limitación para moverse con normalidad. En
              <strong> Dr. Reuma</strong> ofrecemos atención reumatológica en
              <strong> Neuquén Capital</strong>, orientada a evaluar el dolor
              articular, mejorar la movilidad y acompañar el tratamiento de forma
              personalizada. Brindamos atención <strong>presencial y online</strong>.
              Puedes solicitar turnos desde la página web o comunicarte por WhatsApp.
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
              src={artrosis}
              alt="Artrosis o desgaste articular"
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
                Disminuir el dolor y la rigidez para que puedas volver a moverte
                con mayor comodidad.
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
                Evaluaremos la evolución del desgaste articular y cómo afecta tus
                actividades diarias.
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
                Indicaremos ejercicios, hábitos saludables y tratamientos orientados
                a proteger tus articulaciones.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas dolor articular persistente,
            rigidez al iniciar el movimiento, dolor en rodillas, manos, cadera
            o columna, dificultad para caminar o limitación para realizar tus
            actividades habituales.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con artrosis?
          </h2>

          <p>
            Una evaluación médica puede ayudar a identificar la causa del dolor,
            mejorar la movilidad y definir el tratamiento más adecuado para tu caso.
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

export default Artrosis;