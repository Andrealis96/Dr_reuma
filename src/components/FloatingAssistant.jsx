import { useState, useEffect } from "react"
import AssitenteDoctor from "../assets/AssitenteDoctor.svg"

export default function FloatingAssistant() {

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState("start")
  const [typing, setTyping] = useState(false)

  /* EFECTO ESCRIBIENDO */

  useEffect(() => {
    setTyping(true)
    const timer = setTimeout(() => {
      setTyping(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [step])

  /* WHATSAPP */

  const goWhatsApp = () => {

    const mensaje = encodeURIComponent(
      "Hola, quiero consultar disponibilidad para una consulta médica."
    )

    window.open(
      `https://wa.me/5492994666559?text=${mensaje}`,
      "_blank"
    )

  }

  /* MAPS */

  const goMaps = () => {

    window.open(
      "https://maps.app.goo.gl/kMp4pKkqsouhkqsUA",
      "_blank"
    )

  }

  const renderBot = () => {

    if (typing) {
      return (
        <div className="typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )
    }

    switch (step) {

      case "start":
        return (
          <>
            <div className="bot-msg">
              Hola 👋 Soy el Asistente Médico del consultorio <span className="fw-semibold">Dr.Reuma</span>. <br />
              Puedo orientarte o ayudarte a solicitar una consulta.<span className="fw-semibold">  A continuación selecciona lo que deseas consultar:</span> 
            </div>

            <div className="options">

              <button onClick={() => setStep("dolor")}>
                👉 Dolor articular
              </button>

              <button onClick={() => setStep("enfermedades")}>
                👉 Enfermedades que tratamos
              </button>

              <button onClick={() => setStep("turnos")}>
                👉 Turnos y consultas
              </button>

              <button onClick={() => setStep("ubicacion")}>
                👉 Ubicación del consultorio
              </button>

            </div>
          </>
        )

      case "dolor":
        return (
          <>
            <div className="bot-msg">
              <span className="fw-semibold">El dolor articular puede aparecer en distintas zonas del cuerpo.</span> Para un diagnóstico correcto es importante una evaluación médica.
            </div>

            <div className="bot-msg">
              👉 Dolor de rodilla <br />
              👉 Dolor de manos o dedos <br />
              👉 Dolor de columna <br />
              👉 Dolor de cadera <br />
              👉 <span className="fw-semibold">Otras articulaciones ..... !!!!</span>
            </div>

            <div className="options">
              <button onClick={() => setStep("start")}>
                Volver
              </button>
            </div>
          </>
        )

      case "enfermedades":
        return (
          <>
            <div className="bot-msg">
              <span className="fw-semibold">Estas son algunas de las enfermedades que tratamos:</span>
            </div>

            <div className="bot-msg">
              👉 Artritis reumatoide <br />
              👉 Artritis psoriásica <br />
              👉 Artrosis <br />
              👉 Lupus <br />
              👉 Fibromialgia <br />
              👉 Esclerodermia <br />
              👉 Gota (ácido úrico elevado) <br />
              👉 Osteoporosis <br />
              👉 Dolor de columna <br />
              👉 Dolor de rodillas <br />
              👉 Dolor de cadera <br />
              👉 <span className="fw-semibold">OTRAS CONSULTAS</span>
            </div>

            <div className="options">
              <button onClick={() => setStep("start")}>
                Volver
              </button>
            </div>
          </>
        )

      case "turnos":
        return (
          <>
            <div className="bot-msg">
              <span className="fw-semibold">Podés solicitar distintos tipos de consulta:
            </span>
              
            </div>

            <div className="bot-msg">
              👉 Consulta presencial (Clinica San Agustin )<br />
              👉 Consulta por videollamada (Atención desde cualquier lugar del país) <br />
            </div>

            <div className="options">

              <button onClick={goWhatsApp}>
                Consultar por WhatsApp
              </button>

              <button onClick={() => setStep("start")}>
                Volver
              </button>

            </div>
          </>
        )

      case "ubicacion":
        return (
          <>
            <div className="bot-msg">
              <span className="fw-semibold">El consultorio se encuentra en:</span>
            </div>

            <div className="bot-msg">
              Clínica San Agustín <br />
              San Martiín 1355 - Consultorios Externos
              Neuquén Capital
            </div>

            <div className="options">

              <button onClick={goMaps}>
                📍 Ver ubicación
              </button>

              <button onClick={goWhatsApp}>
                👉 Solicitar consulta
              </button>

              <button onClick={() => setStep("start")}>
                Volver
              </button>

            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      <button
        type="button"
        className="floating-btn"
        onClick={() => setOpen(!open)}
      >
        <img
          src={AssitenteDoctor}
          alt="Asistente Médico"
          className="assistant-logo"
        />
      </button>

      {open && (

        <div className="chat-box">

          <div className="chat-header">

            <div className="header-left">

              <img
                src={AssitenteDoctor}
                alt="Doctor"
                className="header-logo"
              />

              <span>Asistente médico</span>

            </div>

            <span
              className="close-btn"
              onClick={() => setOpen(false)}
            >
              ✕
            </span>

          </div>

          <div className="chat-body">
            {renderBot()}
          </div>

        </div>

      )}
    </>
  )
}