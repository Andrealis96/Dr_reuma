import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaBolt,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import hormigueo from "../assets/hormigueo.webp";

function Hormigueo() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          Hormigueo y adormecimiento en Neuquén | Diagnóstico y tratamiento | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para hormigueo, electricidad y adormecimiento. Evaluación de causas, seguimiento y tratamiento con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaBolt className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">HORMIGUEO</span>
              <span className="subtitle-negro"> ADORMECIMIENTO</span>
            </h1>

            <p className="diagnostico-subtitle">
              La sensación de hormigueo, electricidad, adormecimiento o
              pinchazos puede tener distintas causas, como alteraciones
              neurológicas, inflamatorias, musculares, articulares o enfermedades
              autoinmunes. En <strong>Dr. Reuma</strong> ofrecemos atención
              reumatológica en <strong> Neuquén Capital</strong>, orientada a
              estudiar el origen de estos síntomas, solicitar estudios si son
              necesarios y acompañar el tratamiento de forma personalizada.
              Brindamos atención <strong>presencial y online</strong>. Puedes
              solicitar turnos desde la página web o comunicarte por WhatsApp.
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
              src={hormigueo}
              alt="Hormigueo, electricidad y adormecimiento"
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
                Estudiar la causa de estos síntomas y ayudarte a aliviar las
                molestias lo antes posible.
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
                Realizaremos estudios y controles para encontrar un diagnóstico
                preciso y oportuno.
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
                Indicaremos medidas y tratamientos orientados a mejorar tu calidad
                de vida y prevenir nuevos episodios.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si presentas hormigueo persistente,
            sensación de electricidad, adormecimiento, dolor asociado,
            debilidad, síntomas en manos o pies, molestias que se repiten o si
            estos síntomas aparecen junto con dolor articular, cansancio o
            inflamación.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿Tienes hormigueo, electricidad o adormecimiento?
          </h2>

          <p>
            Una evaluación médica puede ayudar a identificar la causa de tus
            síntomas, orientar los estudios necesarios y definir un tratamiento
            adecuado para tu caso.
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

export default Hormigueo;
