import { Modal, Button } from "react-bootstrap";
import { FaWhatsapp } from "react-icons/fa";
import {
  FaUser,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaLaptopMedical
} from "react-icons/fa";

function ModalDetalle({
  show,
  onHide,
  cita,
  onEditar,
  onEliminar
}) {
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
        <a
href={`https://wa.me/${cita.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
`━━━━━━━━━━━━━━
RECORDATORIO DE CITA MÉDICA
━━━━━━━━━━━━━━

Hola ${cita.nombre}

• Especialidad: Reumatología
• Médico: Dr. Reuma (Dr. Tony Vélez)
• Fecha: ${cita.fecha}
• Hora: ${cita.hora}
• Lugar: San Martín 1355, Consultorios Externos Clínica San Agustín

Le esperamos.

Si presenta algún inconveniente para asistir, por favor avísenos con anticipación. Le agradecemos acudir puntualmente a la hora programada.

Muchas gracias.`
)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="telefono-link"
        >
          {cita.telefono}
        </a>
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
      <FaCalendarAlt className="detalle-icono" />
      <strong>Fecha:</strong>
      <span>{cita?.fecha}</span>
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