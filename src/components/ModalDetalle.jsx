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
        <Modal.Title >📋 DETALLE DE CITA  </Modal.Title>
      </Modal.Header>

      <Modal.Body className="detalle-cita">

            <p>
                <FaUser className="me-2 celeste" />
                <strong className="me-2 celeste" >Paciente:</strong> {cita?.nombre}
            </p>

            <p>
                <FaWhatsapp className="me-2 celeste" />
                <strong className="me-2 celeste"  >Teléfono:</strong>{" "}
                {cita?.telefono ? (
                <a
                    href={`https://wa.me/${cita.telefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success text-decoration-none ms-1"
                >
                    {cita.telefono}
                </a>
                ) : (
                "-"
                )}
            </p>

            <p>
                <FaIdCard className="me-2 celeste" />
                <strong className="me-2 celeste" >DNI:</strong> {cita?.Dni}
            </p>

            <p>
                <FaCalendarAlt className="me-2 celeste" />
                <strong className="me-2 celeste" >Fecha:</strong> {cita?.fecha}
            </p>

            <p>
                <FaClock className="me-2 celeste" />
                <strong className="me-2 celeste" >Hora:</strong> {cita?.hora}
            </p>

            <p>
                <FaLaptopMedical className="me-2 celeste" />
                <strong className="me-2 celeste" >Tipo:</strong>{" "}
                {cita?.tipo === "presencial"
                ? "🟢 Presencial"
                : "🔵 Virtual"}
            </p>

            </Modal.Body>

      <Modal.Footer>

        <Button
          onClick={() => onEditar(cita)}
          className="btn-cita"
        >
          Editar
        </Button>

        <Button
          variant="danger"
          onClick={() => onEliminar(cita)}
        >
          Eliminar
        </Button>

      </Modal.Footer>

    </Modal>
  );
}

export default ModalDetalle;