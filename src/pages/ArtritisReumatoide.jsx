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

import artritis from "../assets/artritis.webp";

function ArtritisReumatoide() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
        Artritis Reumatoide en Neuquén | Síntomas y tratamiento | Dr. Reuma
        </title>

        <meta
        name="description"
        content="Atención reumatológica en Neuquén para artritis reumatoide. Conoce síntomas, seguimiento y tratamiento con Dr. Reuma, especialista en enfermedades reumatológicas."
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

            <h1 className="subtitle-general mb-3 ">
        <span className="subtitle-celeste">ARTRITIS</span>
        <span className="subtitle-negro"> REUMATOIDE</span>
        </h1>

         <p className="diagnostico-subtitle">
            La artritis reumatoide es una enfermedad inflamatoria crónica
            que puede causar dolor, hinchazón y rigidez en las articulaciones.
            En <strong>Dr. Reuma</strong> ofrecemos atención reumatológica en
            <strong> Neuquén Capital</strong>, orientada al diagnóstico temprano,
            seguimiento y tratamiento personalizado de pacientes con enfermedades
            reumatológicas. Brindamos atención <strong>presencial y online</strong>.
            Puedes solicitar turnos desde la página web o comunicarte por WhatsApp.
            </p>

           <div className="diagnostico-badge mb-3">
            <FaMapMarkerAlt className="me-2 flex-shrink-0" />
            <span>
                Neuquén Capital - San Martín 1355, Consultorios Externos Clínica San Agustín
            </span>
            </div>
<div className="d-flex flex-column flex-sm-row gap-3 mt-4 ">
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
              src={artritis}
              alt="Artritis Reumatoide"
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
                Controlar la inflamación y proteger tus articulaciones para
                evitar deformaciones y limitaciones en tu vida diaria.
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
                Realizaremos controles periódicos, ya que esta enfermedad
                también puede afectar pulmones y otros órganos importantes.
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
                Elegiremos juntos la medicación más adecuada para aliviar el
                dolor, controlar la inflamación y mejorar tu movilidad.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas dolor articular persistente,
            inflamación en manos, muñecas, pies o rodillas, rigidez matinal,
            dificultad para moverte o cansancio asociado a dolor articular.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes síntomas compatibles con artritis reumatoide?
          </h2>

          <p>
            Una evaluación temprana puede ayudar a confirmar el diagnóstico,
            iniciar tratamiento y prevenir complicaciones.
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

export default ArtritisReumatoide;