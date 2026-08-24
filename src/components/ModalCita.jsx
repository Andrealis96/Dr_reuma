import { Modal, Button } from "react-bootstrap";
import { InputGroup, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  FaSearch, 
  FaUserCheck,
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
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [sexo, setSexo] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);

  const [busquedaPacienteModal, setBusquedaPacienteModal] = useState("");
  const [citasPrevias, setCitasPrevias] = useState([]);

const limpiarTelefono10 = (telefono = "") => {
  let numero = telefono.toString().replace(/\D/g, "");

  if (!numero) return "";

  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }

  if (numero.startsWith("549") && numero.length >= 13) {
    numero = numero.slice(3);
  }

  if (numero.startsWith("54") && numero.length >= 12) {
    numero = numero.slice(2);
  }

  if (numero.startsWith("9") && numero.length === 11) {
    numero = numero.slice(1);
  }

  if (numero.startsWith("0") && numero.length === 11) {
    numero = numero.slice(1);
  }

  if (numero.length > 10) {
    numero = numero.slice(-10);
  }

  return numero;
};

const handleFechaChange = (e) => {
  const nuevaFecha = e.target.value;

  if (citaEditar && nuevaFecha !== citaEditar.fecha) {
    setHora("");
  }

  setFecha(nuevaFecha);
};

useEffect(() => {
  if (citaEditar) {
    setNombre(citaEditar.nombre || "");
    setTelefono(citaEditar.telefono || "");
    setDni(citaEditar.Dni || "");
    setFecha(citaEditar.fecha || "");
    setHora(citaEditar.hora || "");
    setTipo(citaEditar.tipo || "presencial");

    setFechaNacimiento(citaEditar.fechaNacimiento || "");
    setObraSocial(citaEditar.obraSocial || "");
    setSexo(citaEditar.sexo || "");
    setMotivoConsulta(citaEditar.motivoConsulta || "");
  } else {
    setNombre("");
    setTelefono("");
    setDni("");
    setHora("");
    setTipo("presencial");

    setFechaNacimiento("");
    setObraSocial("");
    setSexo("");
    setMotivoConsulta("");
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

      setFechaNacimiento("");
      setObraSocial("");
      setSexo("");
      setMotivoConsulta("");

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

useEffect(() => {
  const unsub = onSnapshot(collection(db, "citas"), (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    setCitasPrevias(data);
  });

  return () => unsub();
}, []);

const handleGuardar = async () => {
  if (!nombre || !fecha || !hora) return;

  const ok = await onGuardar({
    nombre,
    telefono,
    Dni,
    fecha,
    hora,
    tipo,
    fechaNacimiento,
    obraSocial: obraSocial.trim(),
    sexo,
    motivoConsulta: motivoConsulta.trim()
  });

  if (ok !== false) {
    onHide();
  }
};

  const normalizarTexto = (texto = "") =>
  texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const pacientesFiltradosModal =
  busquedaPacienteModal.trim() === ""
    ? []
    : citasPrevias
        .filter((c) => {
          const texto = normalizarTexto(busquedaPacienteModal);

          return (
            normalizarTexto(c.nombre).includes(texto) ||
            c.Dni?.toString().includes(busquedaPacienteModal.trim()) ||
            c.dni?.toString().includes(busquedaPacienteModal.trim())
          );
        })
        .sort((a, b) => {
          const fechaA = new Date(`${a.fecha}T${a.hora || "00:00"}`);
          const fechaB = new Date(`${b.fecha}T${b.hora || "00:00"}`);
          return fechaB - fechaA;
        })
        .slice(0, 6);

const seleccionarPacientePrevio = (cita) => {
  setNombre(cita.nombre || "");
  setTelefono(cita.telefono || "");
  setDni(cita.Dni || cita.dni || "");

  setFechaNacimiento(cita.fechaNacimiento || "");
  setObraSocial(cita.obraSocial || "");
  setSexo(cita.sexo || "");

  setBusquedaPacienteModal("");
};

  return (
    <Modal show={show} onHide={onHide} centered>

      <Modal.Header className="cabecera-detallecita" closeButton>
        <Modal.Title>
          {citaEditar ? "EDITAR CITA" : "NUEVA CITA"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {!citaEditar && (
  <div className="modal-paciente-buscador mb-3">
    <div className="modal-paciente-search">
      <FaSearch />

      <input
        type="text"
        className="form-control"
        placeholder="Buscar nombre de paciente ya registrado.."
        value={busquedaPacienteModal}
        onChange={(e) => setBusquedaPacienteModal(e.target.value)}
      />

      {busquedaPacienteModal && (
        <button
          type="button"
          onClick={() => setBusquedaPacienteModal("")}
        >
          ×
        </button>
      )}
    </div>

    {pacientesFiltradosModal.length > 0 && (
      <div className="modal-paciente-resultados">
        {pacientesFiltradosModal.map((cita) => (
          <button
            key={cita.id}
            type="button"
            className="modal-paciente-item"
            onClick={() => seleccionarPacientePrevio(cita)}
          >
            <div>
              <strong>{cita.nombre}</strong>

              <span>
                DNI: {cita.Dni || cita.dni || "Sin DNI"} · Tel: {cita.telefono || "Sin teléfono"}
              </span>

              <small>
                Última cita: {cita.fecha || "-"} · {cita.hora || "-"}
              </small>
            </div>

            <FaUserCheck />
          </button>
        ))}
      </div>
    )}

  </div>
)}

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
              inputMode="numeric"
              maxLength={10}
              value={telefono}
              onChange={(e) => setTelefono(limpiarTelefono10(e.target.value))}
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
            🎂
          </InputGroup.Text>

          <Form.Control
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </InputGroup>

        <InputGroup className="mb-2">
          <InputGroup.Text>
            🛡️
          </InputGroup.Text>

          <Form.Control
            placeholder="Obra social"
            value={obraSocial}
            onChange={(e) => setObraSocial(e.target.value)}
          />
        </InputGroup>

        <InputGroup className="mb-2">
          <InputGroup.Text>
            ⚧️
          </InputGroup.Text>

          <Form.Select
            value={sexo}
            onChange={(e) => setSexo(e.target.value)}
          >
            <option value="">Seleccione sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </Form.Select>
        </InputGroup>

        <InputGroup className="mb-2">
          <InputGroup.Text>
            📝
          </InputGroup.Text>

          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Motivo de consulta"
            value={motivoConsulta}
            onChange={(e) => setMotivoConsulta(e.target.value)}
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