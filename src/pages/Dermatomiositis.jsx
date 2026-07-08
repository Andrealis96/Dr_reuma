import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaRunning,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import dermatomiositis from "../assets/dermatomiositis.webp";

function Dermatomiositis() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Dermatomiositis en Neuquén | Síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para dermatomiositis. Evaluación de debilidad muscular, lesiones en piel, seguimiento y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaRunning className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">DERMATOMIOSITIS</span>
            </h1>

            <p className="diagnostico-subtitle">
              La dermatomiositis es una enfermedad inflamatoria autoinmune que
              puede afectar los músculos y la piel. Puede producir debilidad
              muscular, cansancio, dolor, dificultad para subir escaleras,
              levantarse de una silla o elevar los brazos, además de lesiones
              cutáneas características. En <strong>Dr. Reuma</strong> ofrecemos
              atención reumatológica en <strong> Neuquén Capital</strong>,
              orientada al diagnóstico, seguimiento y tratamiento personalizado.
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
              src={dermatomiositis}
              alt="Dermatomiositis"
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
                Controlar la inflamación muscular y ayudarte a recuperar fuerza
                física.
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
                Realizaremos controles clínicos y estudios de laboratorio para
                monitorear la enfermedad.
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
                Buscaremos mejorar los síntomas musculares y cutáneos mediante
                un tratamiento integral.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas debilidad muscular progresiva,
            dificultad para levantarte, subir escaleras o elevar los brazos,
            dolor muscular persistente, cansancio marcado, lesiones en la piel,
            manchas alrededor de los ojos, cambios en nudillos o sospecha de una
            enfermedad autoinmune.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con dermatomiositis?
          </h2>

          <p>
            Una evaluación reumatológica temprana puede ayudar a confirmar el
            diagnóstico, controlar la inflamación muscular y prevenir
            complicaciones.
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

export default Dermatomiositis;
