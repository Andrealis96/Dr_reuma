import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AssitenteDoctor from "../assets/AssitenteDoctor.svg";

import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaStethoscope,
  FaCalendarCheck,
  FaQuestionCircle,
  FaArrowLeft,
  FaTimes,
  FaLocationArrow,
  FaBone,
  FaHandHoldingMedical,
  FaInstagram,
  FaFacebookF,
  FaTiktok
} from "react-icons/fa";

export default function FloatingAssistant() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("start");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setTyping(true);

    const timer = setTimeout(() => {
      setTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [step]);

  const goWhatsApp = () => {
    const mensaje = encodeURIComponent(
      "Hola Dr. Reuma, quiero consultar disponibilidad para una consulta médica. Mi nombre es "
    );

    window.open(
      `https://wa.me/5492994666559?text=${mensaje}`,
      "_blank"
    );
  };

  const goMaps = () => {
    window.open(
      "https://maps.app.goo.gl/WgDkBRvfiKK3cP1y7",
      "_blank"
    );
  };

  const goInstagram = () => {
  window.open(
    "https://www.instagram.com/drreuma",
    "_blank"
  );
};

const goFacebook = () => {
  window.open(
    "https://www.facebook.com/profile.php?id=61585981370318",
    "_blank"
  );
};

const goTiktok = () => {
  window.open(
    "https://vt.tiktok.com/ZSXANC5gg/",
    "_blank"
  );
};

  const goServicios = () => {
    setOpen(false);
    navigate("/servicios");
  };

  const goDiagnosticos = () => {
    setOpen(false);
    navigate("/diagnosticos");
  };

  const OptionButton = ({ icon, text, onClick, variant = "" }) => (
    <button
      type="button"
      className={`assistant-option ${variant}`}
      onClick={onClick}
    >
      <span className="assistant-option-icon">
        {icon}
      </span>

      <span>
        {text}
      </span>
    </button>
  );

  const BackButton = () => (
    <button
      type="button"
      className="assistant-back-btn"
      onClick={() => setStep("start")}
    >
      <FaArrowLeft />
      Volver
    </button>
  );

  const renderBot = () => {
    if (typing) {
      return (
        <div className="assistant-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      );
    }

    switch (step) {
      case "start":
        return (
          <>
            <div className="assistant-message">
              <strong>Hola 👋 Soy el asistente médico de Dr. Reuma.</strong>
              <br />
              Puedo orientarte sobre consultas, enfermedades reumatológicas,
              dolor articular o ubicación del consultorio.
            </div>

            <div className="assistant-options">
              <OptionButton
                icon={<FaBone />}
                text="Tengo dolor articular"
                onClick={() => setStep("dolor")}
              />

              <OptionButton
                icon={<FaStethoscope />}
                text="Enfermedades que tratamos"
                onClick={() => setStep("enfermedades")}
              />

              <OptionButton
                icon={<FaCalendarCheck />}
                text="Turnos y consultas"
                onClick={() => setStep("turnos")}
              />

              <OptionButton
                icon={<FaMapMarkerAlt />}
                text="Ubicación del consultorio"
                onClick={() => setStep("ubicacion")}
              />

              <OptionButton
                icon={<FaInstagram />}
                text="Redes sociales"
                onClick={() => setStep("redes")}
              />
            </div>
          </>
        );

      case "dolor":
        return (
          <>
            <div className="assistant-message">
              <strong>El dolor articular no siempre es normal.</strong>
              <br />
              Puede aparecer por artrosis, artritis, gota, inflamación,
              lesiones o enfermedades autoinmunes.
            </div>

            <div className="assistant-list">
              <p>🦵 Dolor de rodilla</p>
              <p>✋ Dolor de manos o dedos</p>
              <p>🦴 Dolor de columna o cadera</p>
              <p>🔥 Inflamación o rigidez matinal</p>
            </div>

            <div className="assistant-options">
              <OptionButton
                icon={<FaWhatsapp />}
                text="Consultar por WhatsApp"
                onClick={goWhatsApp}
                variant="whatsapp"
              />

              <OptionButton
                icon={<FaCalendarCheck />}
                text="Agendar consulta"
                onClick={goServicios}
              />

              <BackButton />
            </div>
          </>
        );

      case "enfermedades":
        return (
          <>
            <div className="assistant-message">
              <strong>Estas son algunas enfermedades que tratamos:</strong>
            </div>

            <div className="assistant-list two-columns">
              <p>Artritis reumatoide</p>
              <p>Artritis psoriásica</p>
              <p>Artrosis</p>
              <p>Lupus</p>
              <p>Fibromialgia</p>
              <p>Esclerodermia</p>
              <p>Gota</p>
              <p>Osteoporosis</p>
              <p>Sjögren</p>
              <p>Dolor articular</p>
            </div>

            <div className="assistant-options">
              <OptionButton
                icon={<FaHandHoldingMedical />}
                text="Ver diagnósticos"
                onClick={goDiagnosticos}
              />

              <OptionButton
                icon={<FaWhatsapp />}
                text="Consultar por WhatsApp"
                onClick={goWhatsApp}
                variant="whatsapp"
              />

              <BackButton />
            </div>
          </>
        );

      case "turnos":
        return (
          <>
            <div className="assistant-message">
              <strong>Podés solicitar consulta presencial u online.</strong>
              <br />
              La atención presencial se realiza en Neuquén Capital.
            </div>

            <div className="assistant-list">
              <p>🏥 Consulta presencial en Clínica San Agustín</p>
              <p>💻 Consulta por videollamada</p>
              <p>📄 Recetas y certificados médicos</p>
            </div>

            <div className="assistant-options">
              <OptionButton
                icon={<FaCalendarCheck />}
                text="Agendar desde la web"
                onClick={goServicios}
              />

              <OptionButton
                icon={<FaWhatsapp />}
                text="Solicitar por WhatsApp"
                onClick={goWhatsApp}
                variant="whatsapp"
              />

              <BackButton />
            </div>
          </>
        );

      case "ubicacion":
        return (
          <>
            <div className="assistant-message">
              <strong>El consultorio se encuentra en:</strong>
              <br />
              Clínica San Agustín, San Martín 1355,
              Consultorios Externos, Neuquén Capital.
            </div>

            <div className="assistant-options">
              <OptionButton
                icon={<FaLocationArrow />}
                text="Ver ubicación en Google Maps"
                onClick={goMaps}
              />

              <OptionButton
                icon={<FaWhatsapp />}
                text="Solicitar consulta"
                onClick={goWhatsApp}
                variant="whatsapp"
              />

              <BackButton />
            </div>
          </>
        );

        case "redes":
  return (
    <>
      <div className="assistant-message">
        <strong>También puedes seguir a Dr. Reuma en redes sociales.</strong>
        <br />
        Compartimos tips, información médica sencilla, recomendaciones y
        contenido educativo sobre enfermedades reumatológicas, dolor articular,
        artritis, lupus, artrosis, fibromialgia, osteoporosis y salud autoinmune.
      </div>

      <div className="assistant-options">

        <OptionButton
          icon={<FaInstagram />}
          text="Instagram"
          onClick={goInstagram}
          variant="instagram"
        />

        <OptionButton
          icon={<FaFacebookF />}
          text="Facebook"
          onClick={goFacebook}
          variant="facebook"
        />

        <OptionButton
          icon={<FaTiktok />}
          text="TikTok"
          onClick={goTiktok}
          variant="tiktok"
        />

        <OptionButton
          icon={<FaWhatsapp />}
          text="Consultar por WhatsApp"
          onClick={goWhatsApp}
          variant="whatsapp"
        />

        <BackButton />

      </div>
    </>
  );

      default:
        return null;
    }
  };

  return (
    <>
      <button
        type="button"
        className={`floating-btn ${open ? "floating-btn-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Abrir asistente médico"
      >
        <img
          src={AssitenteDoctor}
          alt="Asistente Médico"
          className="assistant-logo"
        />
      </button>

      {open && (
        <div className="chat-box assistant-modern-box">
          <div className="assistant-modern-header">
            <div className="assistant-header-left">
              <img
                src={AssitenteDoctor}
                alt="Doctor"
                className="assistant-header-logo"
              />

              <div>
                <strong>Asistente Dr. Reuma</strong>
                <small>Respuesta rápida</small>
              </div>
            </div>

            <button
              type="button"
              className="assistant-close-btn"
              onClick={() => setOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="assistant-modern-body">
            {renderBot()}
          </div>

          <div className="assistant-modern-footer">
            <FaQuestionCircle />
            <span>
              Esta orientación no reemplaza una consulta médica.
            </span>
          </div>
        </div>
      )}
    </>
  );
}