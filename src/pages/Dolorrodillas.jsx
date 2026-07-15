import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaWheelchair,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import dolorrodillas from "../assets/dolorrodillas.webp";

function Dolorrodillas() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Dolor de rodillas en Neuquén | Diagnóstico y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para dolor de rodillas. Evaluación de causas, inflamación, artrosis, seguimiento y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaWheelchair className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">DOLOR EN</span>
              <span className="subtitle-negro"> RODILLAS</span>
            </h1>

            <p className="diagnostico-subtitle">
              El dolor de rodillas puede deberse a desgaste articular, inflamación,
              lesiones, sobrecarga o enfermedades reumatológicas. Puede afectar la
              marcha, subir escaleras, levantarse de una silla o realizar actividad
              física. En <strong>Dr. Reuma</strong> ofrecemos atención reumatológica
              en <strong> Neuquén Capital</strong>, orientada a encontrar la causa
              del dolor, indicar estudios si son necesarios y definir un tratamiento
              personalizado. Brindamos atención <strong>presencial y online</strong>.
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
              src={dolorrodillas}
              alt="Dolor en rodillas"
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
                Encontrar la causa del dolor para ayudarte a recuperar movilidad
                y disminuir molestias.
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
                Evaluaremos la evolución mediante controles y estudios
                complementarios si son necesarios.
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
                Existen distintas alternativas como medicación, infiltraciones y
                rehabilitación antes de pensar en cirugía.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas dolor de rodilla persistente,
            inflamación, rigidez, dificultad para caminar, dolor al subir o bajar
            escaleras, sensación de calor en la articulación, limitación para
            moverte o episodios repetidos de dolor.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes dolor de rodillas?
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

export default Dolorrodillas;
