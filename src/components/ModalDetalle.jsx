import { Modal, Button } from "react-bootstrap";
import { FaWhatsapp } from "react-icons/fa";
import {
  FaUser,
  FaIdCard,
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
  onEditar,
  onEliminar,
  onWhatsapp 
}) {

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
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

  return (

    <Modal show={show} onHide={onHide} centered>
<Modal.Header className="cabecera-detallecita" closeButton>
  <Modal.Title className="titulo-detallecita">
    <FaCalendarAlt className="me-2" />
    DETALLE DE LA CITA
  </Modal.Title>
</Modal.Header>

<Modal.Body>

  <div className="detalle-card">

    <div className="detalle-linea">
      <FaUser className="detalle-icono" />
      <strong>Paciente:</strong>
      <span>{cita?.nombre}</span>
    </div>

    <div className="detalle-linea">
      <FaWhatsapp className="detalle-icono" />
      <strong>Teléfono:</strong>

 {cita?.telefono ? (
  <button
    type="button"
    className="telefono-link btn-recordatorio-detalle"
    onClick={() => onWhatsapp(cita)}
  >
    <FaWhatsapp />
    {limpiarTelefono10(cita.telefono)}
  </button>
) : (
  "-"
)}

    </div>

    <div className="detalle-linea">
      <FaIdCard className="detalle-icono" />
      <strong>DNI:</strong>
      <span>{cita?.Dni}</span>
    </div>

    <div className="detalle-linea">
  <FaBirthdayCake className="detalle-icono" />
  <strong>Fecha nacimiento:</strong>
  <span>{cita?.fechaNacimiento ? formatearFecha(cita.fechaNacimiento) : "Sin registrar"}</span>
</div>

<div className="detalle-linea">
  <FaShieldAlt className="detalle-icono" />
  <strong>Obra social:</strong>
  <span>{cita?.obraSocial || "Sin registrar"}</span>
</div>

<div className="detalle-linea">
  <FaVenusMars className="detalle-icono" />
  <strong>Sexo:</strong>
  <span>{cita?.sexo || "Sin registrar"}</span>
</div>

<div className="detalle-linea detalle-linea-motivo">
  <FaStethoscope className="detalle-icono" />
  <strong>Motivo:</strong>
  <span>{cita?.motivoConsulta || "Sin motivo registrado"}</span>
</div>

    <div className="detalle-linea">
      <FaCalendarAlt className="detalle-icono" />
      <strong>Fecha:</strong>
      <span>{formatearFecha(cita?.fecha)}</span>
    </div>

    <div className="detalle-linea">
      <FaClock className="detalle-icono" />
      <strong>Hora:</strong>
      <span>{cita?.hora}</span>
    </div>

    <div className="detalle-linea">
      <FaLaptopMedical className="detalle-icono" />
      <strong>Tipo:</strong>
      <span>
        {cita?.tipo === "presencial"
          ? "🟢 Presencial"
          : "🔵 Virtual"}
      </span>
    </div>

  </div>

</Modal.Body>
      <Modal.Footer>

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