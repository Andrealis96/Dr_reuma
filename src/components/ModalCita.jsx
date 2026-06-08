import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { InputGroup, Form } from "react-bootstrap";
import {
  FaUser,
  FaIdCard,
  FaCalendarAlt,
  FaWhatsapp,
  FaClock,
  FaLaptopMedical
} from "react-icons/fa";

function ModalCita({
  show,
  onHide,
  onGuardar,
  citaEditar,
  fechaSeleccionada,
  horaPreseleccionada,
  horariosDisponibles,
  obtenerHorariosDisponibles
}) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [Dni, setDni] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("presencial");
  const [horasDisponibles, setHorasDisponibles] = useState([]);

const handleFechaChange = (e) => {
  const nuevaFecha = e.target.value;

  if (citaEditar && nuevaFecha !== citaEditar.fecha) {
    setHora("");
  }

  setFecha(nuevaFecha);
};

  // cargar edición
useEffect(() => {
  if (citaEditar) {
    setNombre(citaEditar.nombre || "");
    setTelefono(citaEditar.telefono || "");
    setDni(citaEditar.Dni || "");
    setFecha(citaEditar.fecha || "");
    setHora(citaEditar.hora || "");
    setTipo(citaEditar.tipo || "presencial");
  } else {
    setNombre("");
    setTelefono("");
    setDni("");
    setHora("");
    setTipo("presencial");
  }
}, [citaEditar]);

  // fecha y hora seleccionada
useEffect(() => {
  if (fechaSeleccionada) setFecha(fechaSeleccionada);
}, [fechaSeleccionada]);

useEffect(() => {
  if (!show) return;

  if (citaEditar) return;

  setHora(horaPreseleccionada || "");
}, [show, horaPreseleccionada, citaEditar]);

useEffect(() => {
  if (show) {
    if (!citaEditar) {
      setNombre("");
      setTelefono("");
      setDni("");
      setTipo("presencial");

      // ❌ NO borres hora si viene preseleccionada
      if (!horaPreseleccionada) {
        setHora("");
      }
    }
  }
}, [show, citaEditar, horaPreseleccionada]);

useEffect(() => {
  const cargar = async () => {
    if (!fecha || !obtenerHorariosDisponibles) return;

    const horarios = await obtenerHorariosDisponibles(fecha);

    console.log("FECHA MODAL:", fecha);
    console.log("HORARIOS DISPONIBLES:", horarios);
    console.log("CITA EDITAR:", citaEditar);

    setHorasDisponibles(horarios);
  };

  cargar();
}, [fecha, obtenerHorariosDisponibles]);

  const handleGuardar = () => {
    if (!nombre || !fecha || !hora) return;

    onGuardar({ nombre, telefono, Dni, fecha, hora, tipo });

    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>

      <Modal.Header className="cabecera-detallecita" closeButton>
        <Modal.Title>
          {citaEditar ? "EDITAR CITA" : "NUEVA CITA"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        <InputGroup className="mb-2 celeste">
            <InputGroup.Text>
                <FaUser className="celeste" />
            </InputGroup.Text>

            <Form.Control
                placeholder="Nombres Completos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
        </InputGroup>

        <InputGroup className="mb-2 celeste">
            <InputGroup.Text>
                <FaWhatsapp  className="celeste"/>
            </InputGroup.Text>

            <Form.Control
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
            />
        </InputGroup>

        <InputGroup className="mb-2">
            <InputGroup.Text>
                <FaIdCard  className="celeste"/>
            </InputGroup.Text>

            <Form.Control
                placeholder="DNI"
                value={Dni}
                onChange={(e) => setDni(e.target.value)}
            />
        </InputGroup>

        <InputGroup className="mb-2">
            <InputGroup.Text>
                <FaCalendarAlt  className="celeste"/>
            </InputGroup.Text>

            <Form.Control
              type="date"
              value={fecha}
              onChange={handleFechaChange}
            />
            </InputGroup>

        <InputGroup className="mb-2">
            <InputGroup.Text>
                <FaClock className="celeste"/>
            </InputGroup.Text>

            <Form.Select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
            >
                <option value="">Selecciona hora</option>

                {citaEditar &&
                fecha === citaEditar.fecha &&
                !horasDisponibles.includes(citaEditar.hora) && (
                    <option value={citaEditar.hora}>
                      {citaEditar.hora}
                    </option>
                )}

                {horasDisponibles.map((h, i) => (
                  <option key={i} value={h}>
                    {h}
                  </option>
                ))}
            </Form.Select>
            </InputGroup>

        <InputGroup className="mb-2">
        <InputGroup.Text>
            <FaLaptopMedical  className="celeste"/>
        </InputGroup.Text>

        <Form.Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
        >
            <option value="presencial">🟢 Presencial</option>
            <option value="virtual">🔵 Virtual</option>
        </Form.Select>
        </InputGroup>

      </Modal.Body>

      <Modal.Footer>

        <Button variant="secondary" onClick={onHide}>
          CANCELAR
        </Button>

        <Button 
            onClick={handleGuardar}>
          GUARDAR
        </Button>

      </Modal.Footer>

    </Modal>
  );
}

export default ModalCita;