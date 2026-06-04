import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaStethoscope
} from "react-icons/fa";
function ModalCita({
  show,
  onHide,
  onGuardar,
  citaEditar,
  fechaSeleccionada,
  horariosDisponibles,
  obtenerHorariosDisponibles
}) 
{
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("presencial");
  const [horarios, setHorarios] = useState([]);

useEffect(() => {
  if (fechaSeleccionada) {
    setFecha(fechaSeleccionada);
  }
}, [fechaSeleccionada]);

useEffect(() => {
  if (show) {
    setNombre("");
    setTelefono("");
    setHora("");
    setTipo("presencial");

    if (fechaSeleccionada) {
      setFecha(fechaSeleccionada);
    } else {
      setFecha("");
    }
  }
}, [show, fechaSeleccionada]);

useEffect(() => {
  const cargarHorarios = async () => {
    if (!fecha) {
      setHorarios([]);
      return;
    }

    const disponibles =
      await obtenerHorariosDisponibles(fecha);

    setHorarios(disponibles);
  };

  cargarHorarios();
}, [fecha, obtenerHorariosDisponibles]);


useEffect(() => {

  if (citaEditar) {

    setNombre(citaEditar.nombre || "");
    setTelefono(citaEditar.telefono || "");
    setFecha(citaEditar.fecha || "");
    setHora(citaEditar.hora || "");
    setTipo(citaEditar.tipo || "presencial");

  }

}, [citaEditar]);

const handleGuardar = () => {

  if (!nombre || !fecha || !hora) {
    alert("Completa los campos obligatorios");
    return;
  }

  // 🔥 VALIDACIÓN 2: hora obligatoria en formato correcto
  if (!hora.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
    alert("Hora inválida");
    return;
  }

  onGuardar({ nombre, telefono, fecha, hora, tipo });

  setNombre("");
  setTelefono("");
  setHora("");
  setTipo("presencial");

  onHide();
};

  return (
    <Modal  show={show} onHide={onHide} centered>
      <Modal.Header className="celeste" closeButton>
        <Modal.Title>
            {citaEditar ? (
                <>
                <FaUser className="me-2 celeste " />
                EDITAR CITA
                </>
            ) : (
                <>
                <FaCalendarAlt className="me-2 celeste" />
                NUEVA CITA
                </>
            )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>
            <FaUser className="me-2 celeste " />
            <span className="fw-bold celeste">| Nombre</span>
            </Form.Label>
          <Form.Control
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            <FaPhone className="me-2 celeste" />
            <span className="fw-bold celeste">| Teléfono</span>
            </Form.Label>
          <Form.Control
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
           <Form.Label>
            <FaCalendarAlt className="me-2 celeste" />
            <span className="fw-bold celeste">| Fecha</span>
            </Form.Label>
            <Form.Control
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    />
        </Form.Group>

        <Form.Group className="mb-3">
           <Form.Label>
            <FaClock className="me-2 celeste" />
            <span className="fw-bold celeste">| Hora</span>
            </Form.Label>
            <Form.Select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    >
                    <option value="">
                        Selecciona hora
                    </option>

                    {horarios.map((h, i) => (
                        <option key={i} value={h}>
                        {h}
                        </option>
                    ))}
                    </Form.Select>
        </Form.Group>

        <Form.Group>
           <Form.Label>
            <FaStethoscope className="me-2 celeste" />
            <span className="fw-bold celeste">| Tipo de consulta</span>
            </Form.Label>
          <Form.Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="presencial">🟢 Presencial</option>
            <option value="virtual">🔵 Virtual</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>

        <Button className="btn-cita" onClick={handleGuardar}>
            {citaEditar ? "Actualizar cita" : "Guardar cita"}
            </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalCita;