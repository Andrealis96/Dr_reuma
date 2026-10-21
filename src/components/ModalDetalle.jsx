import { Modal, Button } from "react-bootstrap";

import {
  FaWhatsapp,
  FaUser,
  FaIdCard,
  FaUserClock,
  FaCalendarAlt,
  FaClock,
  FaLaptopMedical,
  FaBirthdayCake,
  FaShieldAlt,
  FaVenusMars,
  FaStethoscope
} from "react-icons/fa";

function ModalDetalle({
  show,
  onHide,
  cita,
  estadoTexto,
  estadoClase,
  textoVez,
  claseVez,
  onWhatsapp,
  onConfirmar,
  onEditar,
  onEliminar
}) {
  
const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const partes = String(fecha).trim().split(/[-/]/);
  if (partes.length !== 3) return String(fecha);

  let anio, mes, dia;

  if (partes[0].length === 4) {
    [anio, mes, dia] = partes;
  } else {
    [dia, mes, anio] = partes;
  }

  return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anio}`;
};


  const limpiarTelefono10 = (telefono = "") => {
    let numero = telefono.toString().replace(/\D/g, "");

    if (!numero) return "";

    if (numero.startsWith("549") && numero.length >= 13) {
      numero = numero.slice(3);
    }

    if (numero.startsWith("54") && numero.length >= 12) {
      numero = numero.slice(2);
    }

    if (numero.length > 10) {
      numero = numero.slice(-10);
    }

    return numero;
  };


  
const calcularEdad = (valor) => {
  if (!valor) return "—";

  const partes = String(valor).split(/[-/]/);
  if (partes.length !== 3) return "—";

  let anio, mes, dia;

  if (partes[0].length === 4) {
    [anio, mes, dia] = partes.map(Number);
  } else if (partes[2].length === 4) {
    [dia, mes, anio] = partes.map(Number);
  } else {
    return "—";
  }

  const nacimiento = new Date(anio, mes - 1, dia);

  if (
    nacimiento.getFullYear() !== anio ||
    nacimiento.getMonth() !== mes - 1 ||
    nacimiento.getDate() !== dia
  ) return "—";

  const hoy = new Date();

  let edad = hoy.getFullYear() - anio;

  if (
    hoy.getMonth() < mes - 1 ||
    (hoy.getMonth() === mes - 1 && hoy.getDate() < dia)
  ) {
    edad--;
  }

  return edad >= 0 && edad <= 120 ? edad : "—";
};


  const citaYaAsistio =
    cita?.estadoCita === "asistio" ||
    cita?.estadoAsistencia === "asistio";

  return (
    <Modal
  show={show}
  onHide={onHide}
  centered
  className="dr-detalle-modal"
>

      <Modal.Header
  className="cabecera-detallecita"
  closeButton
  closeVariant="white"
>
        <Modal.Title className="titulo-detallecita">
          <FaCalendarAlt className="me-2" />
          DETALLE DE LA CITA
        </Modal.Title>
      </Modal.Header>

      
<Modal.Body className="dr-detalle-body">

  {/* PACIENTE */}
  <div className="dr-detalle-identidad">
    <div>
      <small>DATOS DEL PACIENTE</small>
      <h5>
        {String(cita?.nombre || "Paciente")
          .toLocaleUpperCase("es-AR")}
      </h5>
    </div>

    <span className={
      cita?.tipo === "virtual"
        ? "dr-tipo dr-tipo-virtual"
        : "dr-tipo dr-tipo-presencial"
    }>
      {cita?.tipo === "virtual" ? "Virtual" : "Presencial"}
    </span>
  </div>

  {/* CONTACTO */}
  <div className="dr-detalle-contacto">
    <div>
      <FaWhatsapp />
      <span>
        {cita?.telefono
          ? limpiarTelefono10(cita.telefono)
          : "Sin teléfono"}
      </span>
    </div>

    <button
      type="button"
      disabled={!cita?.telefono}
      onClick={() => onWhatsapp?.(cita)}
      className="dr-detalle-chat"
      title="Abrir conversación de WhatsApp"
    >
      <FaWhatsapp />
      Abrir chat
    </button>
  </div>

  {/* INFORMACIÓN PRINCIPAL */}
  <div className="dr-detalle-grid">

    <div className="dr-detalle-dato">
      <span>Edad</span>
      <strong>
        {calcularEdad(cita?.fechaNacimiento) === "—"
          ? "Sin registrar"
          : `${calcularEdad(cita?.fechaNacimiento)} años`}
      </strong>
    </div>

    <div className="dr-detalle-dato">
      <span>Obra social</span>
      <strong>
        {String(cita?.obraSocial || "Sin registrar")
          .toLocaleUpperCase("es-AR")}
      </strong>
    </div>

    <div className="dr-detalle-dato">
      <span>Fecha</span>
      <strong>{formatearFecha(cita?.fecha)}</strong>
    </div>

    <div className="dr-detalle-dato">
      <span>Hora</span>
      <strong>{cita?.hora || "—"} hs</strong>
    </div>

    <div className="dr-detalle-dato">
      <span>Número de consulta</span>
      {textoVez ? (
        <span className={`dr-detalle-vez ${claseVez || ""}`}>
          {textoVez}
        </span>
      ) : (
        <strong>Sin registrar</strong>
      )}
    </div>

  </div>

  {/* MOTIVO */}
  <div className="dr-detalle-motivo">
    <span>
      <FaStethoscope /> MOTIVO DE CONSULTA
    </span>
    <p>{cita?.motivoConsulta || "Sin motivo registrado"}</p>
  </div>

  {/* DATOS SECUNDARIOS */}
  <details className="dr-detalle-adicional">
    <summary>
      <FaIdCard />
      Datos de identificación
    </summary>

    <div className="dr-detalle-adicional-grid">
      <div>
        <small>DNI</small>
        <strong>{cita?.Dni || cita?.dni || "—"}</strong>
      </div>

      <div>
        <small>Fecha de nacimiento</small>
        <strong>
          {cita?.fechaNacimiento
            ? formatearFecha(cita.fechaNacimiento)
            : "—"}
        </strong>
      </div>

      <div>
        <small>Sexo</small>
        <strong>{cita?.sexo || "—"}</strong>
      </div>
    </div>
  </details>

</Modal.Body>


      <Modal.Footer>

        {citaYaAsistio ? (
          <span className="estado-cita-simple estado-asistio me-auto">
            Asistió
          </span>
        ) : (
          <button
            type="button"
            className={`btn-detalle-confirmar ${
              estadoTexto === "Confirmado"
                ? "btn-detalle-confirmado"
                : "btn-detalle-pendiente-confirmar"
            }`}
            onClick={() => onConfirmar(cita)}
            disabled={estadoTexto === "Confirmado"}
          >
            {estadoTexto === "Confirmado" ? "Confirmado" : "Confirmar"}
          </button>
                  )}

        <Button
          onClick={() => onEditar(cita)}
          className="btn-detalle-editar"
        >
          Editar
        </Button>

        <Button
          variant="danger"
          className="btn-detalle-eliminar"
          onClick={() => onEliminar(cita)}
        >
          Eliminar
        </Button>

      </Modal.Footer>

    </Modal>
  );
}

export default ModalDetalle;