import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaCalendarCheck,
  FaQuestionCircle,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

function NoSeSoloMeDuele() {
  return (
    <section className="diagnostico-page-section">

      <Helmet>
        <title>
          No sé qué tengo, solo me duele | Reumatólogo en Neuquén | Dr. Reuma
        </title>

        <meta
          name="description"
          content="Atención reumatológica en Neuquén para dolor articular, inflamación, rigidez, cansancio o síntomas sin diagnóstico claro. Evaluación médica con Dr. Reuma."
        />
      </Helmet>

      <div className="container py-5">

        {/* HERO PRINCIPAL */}
        <div className="row align-items-center g-4 mb-5">

          <div className="col-12 col-lg-6">

            <div className="diagnostico-badge mb-3">
              <FaQuestionCircle className="me-2" />
              Reumatólogo - Dr. Reuma
            </div>

            <h1 className="subtitle-general mb-3">
              <span className="subtitle-celeste">NO SÉ,</span>
              <span className="subtitle-negro"> SOLO ME DUELE</span>
            </h1>

            <p className="diagnostico-subtitle">
              Muchas personas sienten dolor articular, inflamación, rigidez,
              cansancio, hormigueos o molestias persistentes sin saber exactamente
              qué enfermedad tienen. En <strong>Dr. Reuma</strong> ofrecemos
              atención reumatológica en <strong> Neuquén Capital</strong>,
              orientada a escuchar tus síntomas, evaluarte de forma completa y
              buscar la causa del dolor. Brindamos atención{" "}
              <strong>presencial y online</strong>. Puedes solicitar turnos desde
              la página web o comunicarte por WhatsApp.
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
            <div className="diagnostico-info-card h-100 d-flex flex-column align-items-center justify-content-center py-5">
              <div
                className="diagnostico-card-icon mb-3"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "38px",
                  borderRadius: "24px",
                }}
              >
                <FaQuestionCircle />
              </div>

              <h3 className="fw-bold text-center">
                Evaluación reumatológica integral
              </h3>

              <p className="text-center mb-0">
                Cuando el dolor persiste y no sabes la causa, una consulta puede
                ayudar a orientar el diagnóstico.
              </p>
            </div>
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
                Escucharte y ayudarte a encontrar la causa de lo que estás
                sintiendo.
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
                Realizaremos una evaluación médica completa y estudios que sean
                necesarios para determinar cómo te encuentras.
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
                Muchas enfermedades reumatológicas pueden tratarse mejor cuando
                se diagnostican a tiempo.
              </p>
            </div>
          </div>

        </div>

        {/* CUÁNDO CONSULTAR */}
        <div className="diagnostico-warning-card mb-5">

          <h2>¿Cuándo consultar con un reumatólogo?</h2>

          <p>
            Es recomendable consultar si tienes dolor persistente, inflamación,
            rigidez por la mañana, cansancio intenso, dolor en varias
            articulaciones, síntomas que se repiten o molestias que afectan tu
            vida diaria y aún no tienes un diagnóstico claro.
          </p>

        </div>

        {/* CTA FINAL */}
        <div className="diagnostico-cta text-center">

          <h2>
            ¿No sabes qué tienes, pero el dolor continúa?
          </h2>

          <p>
            Una evaluación reumatológica puede ayudarte a encontrar la causa,
            orientar los estudios necesarios y comenzar un tratamiento adecuado.
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

export default NoSeSoloMeDuele;
