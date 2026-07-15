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

import osteoporosis from "../assets/osteoporosis.webp";

function Osteoporosis() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Osteoporosis en Neuquén | Diagnóstico y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para osteoporosis. Evaluación de salud ósea, prevención de fracturas, seguimiento y tratamiento con Dr. Reuma."
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
              <span className="subtitle-celeste">OSTEOPOROSIS</span>
            </h1>

            <p className="diagnostico-subtitle">
              La osteoporosis es una enfermedad que debilita los huesos y aumenta
              el riesgo de fracturas, especialmente en columna, cadera y muñeca.
              En <strong> Dr. Reuma</strong> ofrecemos atención reumatológica en
              <strong> Neuquén Capital</strong>, orientada a evaluar la salud ósea,
              prevenir fracturas y definir el tratamiento más adecuado para cada
              paciente. Brindamos atención <strong>presencial y online</strong>.
              Puedes solicitar turnos desde la página web o comunicarte por WhatsApp.
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
              src={osteoporosis}
              alt="Osteoporosis"
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
                Fortalecer tus huesos y disminuir el riesgo de fracturas.
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
                Realizaremos controles y estudios para evaluar la salud ósea y
                su evolución.
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
                Indicaremos medicación, alimentación y hábitos que ayuden a
                proteger tus huesos.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si tienes antecedentes de fracturas,
            menopausia, pérdida de estatura, dolor de espalda persistente,
            uso prolongado de corticoides, déficit de vitamina D, antecedentes
            familiares de osteoporosis o si necesitas evaluar tu riesgo de fractura.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Necesitas evaluar tu salud ósea?
          </h2>

          <p>
            Una evaluación médica permite conocer tu riesgo de osteoporosis,
            prevenir fracturas y definir un plan de tratamiento personalizado.
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

export default Osteoporosis;