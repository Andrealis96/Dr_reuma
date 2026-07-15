import doctor from "../assets/doctor2.webp";
import expo1 from "../assets/expo1.webp";
import expo2 from "../assets/expo5.webp";
import expo3 from "../assets/expo6.webp";
import expo4 from "../assets/expo4.webp";
import { Helmet } from "react-helmet-async";
import {
  FaWhatsapp,
  FaUserMd,
  FaHeartbeat,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaHeart,
  FaGraduationCap,
  FaHospital,
  FaCertificate,
  FaStethoscope
} from "react-icons/fa";

import "../styles/App.css";

function About() {
  const message =
    "Hola, solicito una consulta con el Dr. Reuma. Escribo desde la página web. Mi nombre es ";

  const whatsappLink = `https://wa.me/5492994666559?text=${encodeURIComponent(message)}`;

  const congresos = [expo1, expo2, expo3, expo4];

  return (
    <>
      <Helmet>
        <title>
          Dr. Tony Vélez | Reumatólogo en Neuquén Capital
        </title>

        <meta
          name="description"
          content="Conoce al Dr. Tony Vélez, médico especialista en reumatología. Atención presencial en Neuquén Capital y consultas online para enfermedades reumatológicas y autoinmunes."
        />
      </Helmet>

      <section className="about-modern-section" id="nosotros">
        <div className="container py-5">

          {/* HERO */}
          <div className="about-modern-hero">

            <div className="row align-items-center g-5">

              {/* TEXTO */}
              <div className="col-lg-7">

                <div className="about-modern-badge mb-3">
                  <FaStethoscope />
                  Reumatólogo en Neuquén
                </div>

                <h1 className="about-modern-title">
                  Dr. Tony Vélez
                  <span> Dr. Reuma</span>
                </h1>

                <p className="about-modern-subtitle">
                  Médico especialista en reumatología, dedicado al diagnóstico,
                  tratamiento y seguimiento de enfermedades reumatológicas,
                  autoinmunes, articulares y musculoesqueléticas.
                </p>

                <div className="about-modern-location">
                  <FaMapMarkerAlt />
                  <div>
                    <strong>Neuquén Capital</strong>
                    <p>San Martín 1355 — Clínica San Agustín, Consultorios Externos</p>
                  </div>
                </div>

                <div className="about-modern-actions">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-modern-btn"
                  >
                    <FaWhatsapp />
                    Solicitar turno
                  </a>

                  <a
                    href="https://maps.app.goo.gl/iJ6E4Vr4gTCNvQXw8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-modern-btn-outline"
                  >
                    <FaMapMarkerAlt />
                    Ver ubicación
                  </a>
                </div>

              </div>

              {/* FOTO DOCTOR */}
              <div className="col-lg-5">

                <div className="about-modern-doctor-card">

                  <div className="about-modern-img-wrapper">
                    <img
                      src={doctor}
                      alt="Dr. Tony Vélez Reumatólogo en Neuquén"
                      className="about-modern-doctor-img"
                    />
                  </div>

                  <div className="about-modern-doctor-info">
                    <h3>Dr. Tony Vélez</h3>
                    <p>Médico Reumatólogo</p>

                    <div className="about-modern-mini-badge">
                      Atención presencial y online
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* STATS */}
          <div className="row g-3 mt-4">

            <div className="col-6 col-md-4">
              <div className="about-modern-stat">
                <h2>+5</h2>
                <p>Años de experiencia</p>
              </div>
            </div>

            <div className="col-6 col-md-4">
              <div className="about-modern-stat">
                <h2>+1000</h2>
                <p>Pacientes atendidos</p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="about-modern-stat">
                <h2>100%</h2>
                <p>Enfoque humano</p>
              </div>
            </div>

          </div>

          {/* ENFOQUE */}
          <div className="about-modern-block mt-5">

            <div className="text-center mb-4">
              <h2 className="subtitle-general">
                <span className="subtitle-celeste">MI</span>
                <span className="subtitle-negro"> ENFOQUE MÉDICO</span>
              </h2>

              <p className="about-modern-center-text">
                La consulta reumatológica busca entender el origen del dolor,
                detectar enfermedades a tiempo y acompañar al paciente durante
                todo el proceso.
              </p>
            </div>

            <div className="row g-4">

              <div className="col-md-6 col-lg-3">
                <div className="about-modern-feature">
                  <FaUserMd />
                  <h4>Diagnóstico temprano</h4>
                  <p>
                    Evaluación clínica orientada a detectar enfermedades
                    reumatológicas desde etapas iniciales.
                  </p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="about-modern-feature">
                  <FaHeartbeat />
                  <h4>Tratamiento personalizado</h4>
                  <p>
                    Cada paciente recibe un abordaje adaptado a sus síntomas,
                    estudios y enfermedad de base.
                  </p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="about-modern-feature">
                  <FaClipboardCheck />
                  <h4>Seguimiento continuo</h4>
                  <p>
                    Control clínico periódico para valorar respuesta,
                    ajustar tratamiento y prevenir complicaciones.
                  </p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="about-modern-feature">
                  <FaHeart />
                  <h4>Atención humana</h4>
                  <p>
                    Una consulta cercana, clara y enfocada en mejorar la calidad
                    de vida de cada paciente.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* FORMACIÓN */}
          <div className="about-modern-block mt-5">

            <div className="row g-4 align-items-center">

              <div className="col-lg-5">
                <h2 className="subtitle-general text-start">
                  <span className="subtitle-celeste">FORMACIÓN</span>
                  <span className="subtitle-negro"> Y TRAYECTORIA</span>
                </h2>

                <p className="about-modern-text">
                  Además de la práctica clínica, el Dr. Tony Vélez participa en
                  congresos, actualizaciones médicas y espacios académicos
                  vinculados a enfermedades reumatológicas, autoinmunes y dolor
                  articular.
                </p>
              </div>

              <div className="col-lg-7">

                <div className="about-modern-timeline">

                  <div className="about-modern-timeline-item">
                    <FaGraduationCap />
                    <div>
                      <h4>Universidad de Buenos Aires</h4>
                      <p>Formación médica y académica.</p>
                    </div>
                  </div>

                  <div className="about-modern-timeline-item">
                    <FaHospital />
                    <div>
                      <h4>Hospital Ramos Mejía</h4>
                      <p>Formación hospitalaria en reumatología.</p>
                    </div>
                  </div>

                  <div className="about-modern-timeline-item">
                    <FaCertificate />
                    <div>
                      <h4>Sociedades científicas</h4>
                      <p>
                        Sociedad Argentina de Reumatología y Sociedad
                        Ecuatoriana de Reumatología.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CONGRESOS */}
          <div className="about-modern-block mt-5">

            <div className="text-center mb-4">
              <h2 className="subtitle-general">
                <span className="subtitle-celeste">ACTUALIZACIÓN</span>
                <span className="subtitle-negro"> MÉDICA</span>
              </h2>

              <p className="about-modern-center-text">
                Congresos, formación continua y educación médica para brindar
                una atención actualizada.
              </p>
            </div>

            <div className="row g-3">

              {congresos.map((img, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <div className="about-modern-expo-img">
                    <img
                      src={img}
                      alt="Congreso médico Dr. Reuma"
                    />
                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>
      </section>
    </>
  );
}

export default About;