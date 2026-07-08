import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaWalking,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import dolorcolumna from "../assets/dolorcolumna.webp";

function Dolorcolumna() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Dolor de columna y cadera en Neuquén | Diagnóstico y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para dolor de columna, dolor de cadera y problemas articulares. Evaluación, seguimiento y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaWalking className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">DOLOR DE COLUMNA</span>
              <span className="subtitle-negro"> Y CADERA</span>
            </h1>

            <p className="diagnostico-subtitle">
              El dolor de columna y cadera puede limitar la movilidad, dificultar
              la marcha y afectar las actividades diarias. Puede estar relacionado
              con problemas mecánicos, inflamatorios, articulares o enfermedades
              reumatológicas. En <strong>Dr. Reuma</strong> ofrecemos atención
              reumatológica en <strong> Neuquén Capital</strong>, orientada a
              evaluar la causa del dolor, indicar estudios cuando sean necesarios
              y acompañar el tratamiento de forma personalizada. Brindamos atención{" "}
              <strong>presencial y online</strong>. Puedes solicitar turnos desde
              la página web o comunicarte por WhatsApp.
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
              src={dolorcolumna}
              alt="Dolor de columna y cadera"
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
                Ayudarte a disminuir el dolor y recuperar movilidad para mejorar
                tu vida diaria.
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
                Evaluaremos cómo evoluciona el dolor y qué actividades pueden
                ayudarte a sentirte mejor.
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
                Indicaremos ejercicios, medicación y estrategias adaptadas a tus
                necesidades.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas dolor de columna o cadera
            persistente, rigidez al despertar, dolor que mejora con el movimiento,
            dificultad para caminar, dolor nocturno, inflamación articular o
            limitación para realizar tus actividades habituales.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes dolor de columna o cadera?
          </h2>

          <p>
            Una evaluación médica puede ayudar a identificar la causa del dolor,
            definir si existe un componente inflamatorio o articular y orientar
            el tratamiento adecuado.
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

export default Dolorcolumna;