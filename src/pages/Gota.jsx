import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaTint,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import gota from "../assets/gota.webp";

function Gota() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Gota en Neuquén | Ácido úrico elevado, síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para gota y ácido úrico elevado. Conoce síntomas, seguimiento y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaTint className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">GOTA</span>
              <span className="subtitle-negro"> ÁCIDO ÚRICO ELEVADO</span>
            </h1>

            <p className="diagnostico-subtitle">
              La gota es una enfermedad inflamatoria relacionada con el aumento
              del ácido úrico, que puede causar ataques de dolor intenso,
              hinchazón, enrojecimiento y calor en una articulación, especialmente
              en el pie, tobillo o rodilla. En <strong>Dr. Reuma</strong> ofrecemos
              atención reumatológica en <strong> Neuquén Capital</strong>, orientada
              al diagnóstico, seguimiento y tratamiento personalizado de pacientes
              con gota e hiperuricemia. Brindamos atención{" "}
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
              src={gota}
              alt="Gota o ácido úrico elevado"
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
                Disminuir el dolor y la inflamación provocados por el ácido
                úrico elevado.
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
                Controlaremos los niveles de ácido úrico para prevenir nuevos
                ataques y complicaciones.
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
                Combinaremos medicación, alimentación y hábitos saludables para
                mejorar la enfermedad.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas ataques de dolor intenso en
            una articulación, inflamación del dedo gordo del pie, tobillo o
            rodilla, ácido úrico elevado en análisis, episodios repetidos de
            inflamación articular o sospecha de gota.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con gota?
          </h2>

          <p>
            Una evaluación reumatológica puede ayudar a confirmar el diagnóstico,
            controlar el ácido úrico y prevenir nuevos ataques articulares.
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

export default Gota;