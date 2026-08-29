import { useEffect, useMemo, useState, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "../firebase";
import { Link, useNavigate} from "react-router-dom";

import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaPencilAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaUserPlus,
  FaIdCard,
  FaBirthdayCake,
  FaShieldAlt,
  FaVenusMars,
  FaFolderOpen,
  FaTimes,
  FaUsers,
  FaStethoscope,
  FaCalendarAlt,
  FaUserCheck,
  FaClock,
FaWhatsapp
} from "react-icons/fa";

import maleAvatar from "../assets/user-male.png";
import femaleAvatar from "../assets/user-female.png";
import "../styles/App.css";

function HistoriasClinicas() {

  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [citasAgenda, setCitasAgenda] = useState([]);
  const [citaHoySeleccionadaId, setCitaHoySeleccionadaId] = useState(null);
  const nuevoPacienteRef = useRef(null);
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [sexo, setSexo] = useState("");

  const [busqueda, setBusqueda] = useState(() => {
  return sessionStorage.getItem("busquedaHistorias") || "";
}); 
const [pagina, setPagina] = useState(1);
const [cargandoPacientes, setCargandoPacientes] = useState(true); 
const [fechaTablaAgenda, setFechaTablaAgenda] = useState(() => {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
});
  const pacientesPorPagina = 6;

  const [editando, setEditando] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  useEffect(() => {
  sessionStorage.setItem("busquedaHistorias", busqueda);
}, [busqueda]);

  const limpiarFormulario = () => {
    setNombre("");
    setDni("");
    setFechaNacimiento("");
    setObraSocial("");
    setSexo("");
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    const f = new Date(`${fecha}T00:00:00`);
    return f.toLocaleDateString("es-AR");
  };

  const calcularEdad = (fecha) => {
    if (!fecha) return null;

    const nacimiento = new Date(`${fecha}T00:00:00`);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (
      mes < 0 ||
      (mes === 0 && hoy.getDate() < nacimiento.getDate())
    ) {
      edad--;
    }

    return edad;
  };

  const normalizarTexto = (texto = "") => {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const capitalizarNombre = (nombre = "") => {
  return nombre
    .toString()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
};

const convertirFechaFlexible = (valor, hora = "") => {
  if (!valor) return null;

  let fecha = null;

  // Firestore Timestamp
  if (valor?.toDate) {
    fecha = valor.toDate();
  }

  // Date normal
  else if (valor instanceof Date) {
    fecha = valor;
  }

  // Texto: 26/8/2026 o 26/08/2026 o 2026-08-26
  else if (typeof valor === "string") {
    const limpio = valor.trim();

    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(limpio)) {
      const [anio, mes, dia] = limpio.split("-").map(Number);
      fecha = new Date(anio, mes - 1, dia);
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(limpio)) {
      const [dia, mes, anio] = limpio.split("/").map(Number);
      fecha = new Date(anio, mes - 1, dia);
    } else {
      const fechaTemporal = new Date(limpio);

      if (!isNaN(fechaTemporal.getTime())) {
        fecha = fechaTemporal;
      }
    }
  }

  if (!fecha || isNaN(fecha.getTime())) return null;

  const horaLimpia = hora?.toString().trim();
  const matchHora = horaLimpia.match(/^(\d{1,2}):(\d{2})/);

  if (matchHora) {
    fecha.setHours(Number(matchHora[1]), Number(matchHora[2]), 0, 0);
  } else {
    fecha.setHours(12, 0, 0, 0);
  }

  return fecha;
};

const formatearFechaCorta = (fecha) => {
  return fecha
    .toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric"
    })
    .replace(",", "")
    .replace(/^./, (letra) => letra.toUpperCase());
};

const obtenerFechaHoraConsulta = (consulta) => {
  const fechaDate =
    convertirFechaFlexible(consulta.fecha, consulta.hora) ||
    convertirFechaFlexible(consulta.fechaConsulta, consulta.hora) ||
    convertirFechaFlexible(consulta.creado, consulta.hora) ||
    convertirFechaFlexible(consulta.createdAt, consulta.hora);

  return {
    fecha: fechaDate ? formatearFechaCorta(fechaDate) : "Sin fecha",
    hora: consulta.hora || "",
    fechaDate
  };
};

useEffect(() => {
  const q = query(
    collection(db, "historiasClinicas"),
    orderBy("creado", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const datos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setPacientes(datos);
    setCargandoPacientes(false);
  });

  return () => unsubscribe();
}, []);


useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "citas"), (snapshot) => {
    const datos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setCitasAgenda(datos);
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  setPagina(1);
}, [busqueda]);

const mostrarMensajeGuardado = (texto) => {
  setMensajeConfirmacion(texto);
  setMostrarConfirmacion(true);

  setTimeout(() => {
    setMostrarConfirmacion(false);
  }, 1800);
};

const crearPaciente = async (e) => {
  e.preventDefault();

  const pacienteCreado = await addDoc(collection(db, "historiasClinicas"), {
    nombre: nombre.trim(),
    dni: dni.trim(),
    fechaNacimiento,
    obraSocial: obraSocial.trim(),
    sexo,
    creado: new Date()
  });

  if (citaHoySeleccionadaId) {
    await updateDoc(doc(db, "citas", citaHoySeleccionadaId), {
      estadoCita: "asistio",

      // Compatibilidad con lo anterior si ya lo habías agregado
      estadoAsistencia: "asistio",
      estadoConfirmacion: "confirmado",

      asistenciaActualizadaAt: new Date(),
      historiaClinicaId: pacienteCreado.id
    });

    setCitaHoySeleccionadaId(null);
  }

  limpiarFormulario();
  mostrarMensajeGuardado("Paciente guardado");
};

  const eliminarPaciente = async (id) => {
    if (window.confirm("¿Eliminar paciente?")) {
      await deleteDoc(doc(db, "historiasClinicas", id));
    }
  };

  const editarPaciente = (p) => {
    setEditando(p.id);

    setNombre(p.nombre || "");
    setDni(p.dni || "");
    setFechaNacimiento(p.fechaNacimiento || "");
    setObraSocial(p.obraSocial || "");
    setSexo(p.sexo || "");

    setTimeout(() => {
  nuevoPacienteRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}, 100);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();

    await updateDoc(doc(db, "historiasClinicas", editando), {
      nombre: nombre.trim(),
      dni: dni.trim(),
      fechaNacimiento,
      obraSocial: obraSocial.trim(),
      sexo
    });

    setEditando(null);
    limpiarFormulario();
    mostrarMensajeGuardado("Paciente actualizado");
  };

  const cancelarEdicion = () => {
    setEditando(null);
    limpiarFormulario();
  };

const obtenerCreadoPaciente = (p) => {
  if (p.creado?.toDate) {
    return p.creado.toDate().getTime();
  }

  if (p.creado instanceof Date) {
    return p.creado.getTime();
  }

  return 0;
};

const pacientesFiltrados = useMemo(() => {
  const textoPaciente = normalizarTexto(busqueda);

  return pacientes
    .filter((p) => {
      return (
        !textoPaciente ||
        normalizarTexto(p.nombre).includes(textoPaciente) ||
        p.dni?.toString().includes(busqueda.trim())
      );
    })
    .sort((a, b) => {
      const ultimaB = b.ultimaConsultaAtMillis || 0;
      const ultimaA = a.ultimaConsultaAtMillis || 0;

      if (ultimaB !== ultimaA) {
        return ultimaB - ultimaA;
      }

      return obtenerCreadoPaciente(b) - obtenerCreadoPaciente(a);
    });
}, [pacientes, busqueda]);

  const indiceFinal = pagina * pacientesPorPagina;
  const indiceInicial = indiceFinal - pacientesPorPagina;

  const pacientesPagina = pacientesFiltrados.slice(
    indiceInicial,
    indiceFinal
  );

  const totalPaginas =
    Math.ceil(pacientesFiltrados.length / pacientesPorPagina) || 1;

const obtenerFechaHoyLocal = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();

  return new Date(ahora.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const obtenerEstadoCitaTexto = (cita) => {
  if (cita.estadoCita === "asistio" || cita.estadoAsistencia === "asistio") {
    return "Asistió";
  }

  if (cita.estadoCita === "confirmado" || cita.estadoConfirmacion === "confirmado") {
    return "Confirmado";
  }

  if (cita.fecha < obtenerFechaHoyLocal()) {
    return "No asistió";
  }

  return "Pendiente";
};

const obtenerEstadoCitaClase = (cita) => {
  const estado = obtenerEstadoCitaTexto(cita);

  if (estado === "Asistió") return "estado-asistio";
  if (estado === "No asistió") return "estado-no-asistio";
  if (estado === "Confirmado") return "estado-confirmado";

  return "estado-pendiente";
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

const limpiarDniCitaAgenda = (valor = "") => {
  return valor.toString().replace(/\D/g, "").trim();
};

const obtenerDniCitaAgenda = (cita = {}) => {
  return limpiarDniCitaAgenda(
    cita.Dni ||
    cita.dni ||
    cita.DNI ||
    cita.documento ||
    cita.numeroDocumento ||
    ""
  );
};

const normalizarNombreCitaAgenda = (valor = "") => {
  return normalizarTexto(valor)
    .replace(/\s+/g, " ")
    .trim();
};

const sonLaMismaPersonaAgenda = (citaA, citaB) => {
  const historiaA = citaA?.historiaClinicaId || citaA?.pacienteId || "";
  const historiaB = citaB?.historiaClinicaId || citaB?.pacienteId || "";

  if (historiaA && historiaB && historiaA === historiaB) {
    return true;
  }

  const dniA = obtenerDniCitaAgenda(citaA);
  const dniB = obtenerDniCitaAgenda(citaB);

  if (dniA && dniB && dniA === dniB) {
    return true;
  }

  const nombreA = normalizarNombreCitaAgenda(citaA?.nombre || "");
  const nombreB = normalizarNombreCitaAgenda(citaB?.nombre || "");

  return nombreA && nombreB && nombreA === nombreB;
};

const obtenerMillisCitaAgenda = (cita = {}) => {
  const fecha = cita.fecha || "1900-01-01";
  const hora = cita.hora || "00:00";

  const fechaDate = new Date(`${fecha}T${hora}`);

  return isNaN(fechaDate.getTime()) ? 0 : fechaDate.getTime();
};

const obtenerNumeroCitaPacienteAgenda = (cita) => {
  if (!cita) return 1;

  const citasPaciente = citasAgenda
    .filter((c) => sonLaMismaPersonaAgenda(c, cita))
    .sort((a, b) => obtenerMillisCitaAgenda(a) - obtenerMillisCitaAgenda(b));

  const posicion = citasPaciente.findIndex((c) => c.id === cita.id);

  return posicion === -1 ? 1 : posicion + 1;
};

const textoNumeroCitaPacienteAgenda = (numero) => {
  if (numero === 1) return "Primera vez";
  if (numero === 2) return "Segunda vez";
  if (numero === 3) return "Tercera vez";

  return `${numero}ª vez`;
};

const fechaISODesdeDate = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

const convertirISOADateLocal = (fechaISO) => {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
};

const cambiarDiaTablaAgenda = (dias) => {
  const fechaActual = convertirISOADateLocal(fechaTablaAgenda);
  fechaActual.setDate(fechaActual.getDate() + dias);

  setFechaTablaAgenda(fechaISODesdeDate(fechaActual));
  setCitaHoySeleccionadaId(null);
};

const irAHoyTablaAgenda = () => {
  setFechaTablaAgenda(obtenerFechaHoyLocal());
  setCitaHoySeleccionadaId(null);
};

const formatearFechaTablaAgenda = (fechaISO) => {
  return convertirISOADateLocal(fechaISO)
    .toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric"
    })
    .replace(",", "")
    .replace(/^./, (letra) => letra.toUpperCase());
};

const esTablaDeHoy = fechaTablaAgenda === obtenerFechaHoyLocal();

const tituloTablaAgenda = esTablaDeHoy
  ? "PACIENTES DE HOY"
  : `PACIENTES DEL ${formatearFechaTablaAgenda(fechaTablaAgenda).toUpperCase()}`;

const citasHoyAgenda = citasAgenda
  .filter((c) => c.fecha === fechaTablaAgenda)
  .sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

const buscarPacienteGuardadoPorCita = (cita) => {
  const dniCita = (cita?.Dni || cita?.dni || "")
    .toString()
    .replace(/\D/g, "");

  if (dniCita) {
    return pacientes.find(
      (p) => p.dni?.toString().replace(/\D/g, "") === dniCita
    );
  }

  return pacientes.find(
    (p) => normalizarTexto(p.nombre) === normalizarTexto(cita.nombre)
  );
};

const obtenerNumeroVezHistoriaClinica = (cita) => {
  const pacienteGuardado = buscarPacienteGuardadoPorCita(cita);

  if (!pacienteGuardado) {
    return obtenerNumeroCitaPacienteAgenda(cita);
  }

  const consultasRegistradas = Number(pacienteGuardado.cantidadConsultas || 0);
  const estado = obtenerEstadoCitaTexto(cita);

  if (estado === "Asistió") {
    return Math.max(consultasRegistradas, 1);
  }

  return consultasRegistradas + 1;
};

const cargarPacienteDesdeCitaHoy = (cita) => {
  setEditando(null);
  setCitaHoySeleccionadaId(cita.id);

  const pacienteGuardado = buscarPacienteGuardadoPorCita(cita);

  if (pacienteGuardado) {
    navigate(`/admin/historia/${pacienteGuardado.id}?citaId=${cita.id}`);
    return;
  }

  setNombre(cita.nombre || "");
  setDni(cita.Dni || cita.dni || "");
  setFechaNacimiento(cita.fechaNacimiento || "");
  setObraSocial(cita.obraSocial || "");
  setSexo(cita.sexo || "");

  setTimeout(() => {
    nuevoPacienteRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 100);
};

const fechaHoyHistoriasTexto = new Date()
  .toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })
  .replace(",", "")
  .replace(/^./, (letra) => letra.toUpperCase());

  return (
    <div className="container historias-modern-container py-4 mb-5">
      {mostrarConfirmacion && (
  <div className="paciente-save-overlay">
    <div className="paciente-save-card">

      <div className="paciente-save-icon">
        <FaUserCheck />
      </div>

      <h4>{mensajeConfirmacion}</h4>
    </div>
  </div>
)}

      {/* HEADER */}
      <div className="historias-hero mb-4">

        <div>
          <div className="historias-badge">
            <FaFolderOpen />
            Panel médico
          </div>

          <h2 className="subtitle-general mb-2">
            {editando ? (
              <>
                <span className="subtitle-celeste">EDITAR</span>{" "}
                <span className="subtitle-celeste">PACIENTE</span>
              </>
            ) : (
              <>
                <span className="subtitle-celeste">HISTORIAS</span>{" "}
                <span className="subtitle-celeste">CLÍNICAS</span>
              </>
            )}
          </h2>

          <div className="historias-fecha-hoy mb-2">
            {fechaHoyHistoriasTexto.toUpperCase()}
          </div>

          <p className="historias-hero-text">
            Registro de pacientes, búsqueda rápida y acceso directo a la historia clínica.
          </p>
        </div>

        <div className="historias-hero-actions">

  <Link
    to="/admin/citas"
    className="historias-agenda-btn"
  >
    <FaCalendarAlt />
    Agendar cita
  </Link>

  <div className="historias-total-resumen">
  <div className="historias-total-icon">
    <FaUsers />
  </div>

  <div className="historias-total-info">
    <span>Total de historias</span>
    <strong>{pacientes.length}</strong>
    <small>pacientes registrados</small>
  </div>
</div>

</div>

      </div>

      {/* TABLA PACIENTES DE HOY DESDE AGENDA */}
<div className="card shadow-sm mb-4 historias-tabla-hoy-card">

<div className="card-header text-center text-white fw-bold pacientes-dia-header">
  <button
    type="button"
    className="pacientes-dia-nav-btn"
    onClick={() => cambiarDiaTablaAgenda(-1)}
    title="Ver día anterior"
  >
    <FaChevronLeft />
  </button>

  <div className="pacientes-dia-title">
    <h3 className="mb-0">
      {tituloTablaAgenda}
    </h3>

    {!esTablaDeHoy && (
      <button
        type="button"
        className="pacientes-dia-hoy-btn"
        onClick={irAHoyTablaAgenda}
      >
        Volver a hoy
      </button>
    )}
  </div>

  <button
    type="button"
    className="pacientes-dia-nav-btn"
    onClick={() => cambiarDiaTablaAgenda(1)}
    title="Ver día siguiente"
  >
    <FaChevronRight />
  </button>
</div>

  <div className="card-body p-0 table-responsive">

    {citasHoyAgenda.length === 0 ? (
      <div className="p-3 text-center fw-bold">
        No hay citas programadas para esta fecha
      </div>
    ) : (
      <table className="table table-sm mb-0 tabla-pacientes-hoy">
        <thead>
          <tr className="text-center">
            <th>
              <FaClock className="me-1 celeste" /> <br />
              <span className="celeste">Hora</span>
            </th>

            <th>
              <FaUserCheck className="me-2 celeste" /> <br />
              <span className="celeste">Paciente</span>
            </th>

            <th>
              <FaIdCard className="me-2 celeste" /> <br />
              <span className="celeste">DNI</span>
            </th>

            <th>
              <FaWhatsapp className="me-2 celeste" /> <br />
              <span className="celeste">Teléfono</span>
            </th>

            <th>
              <FaUsers className="me-2 celeste" /> <br />
              <span className="celeste">Vez</span>
            </th>

            <th>
              <FaStethoscope className="me-2 celeste" /> <br />
              <span className="celeste">Motivo</span>
            </th>

            <th>
                                  <FaCheckCircle className="me-2 celeste" /> <br />
                                  <span className="celeste">
                                    Estado
                                  </span>
           </th>
          </tr>
        </thead>

        <tbody className="text-center">
          {citasHoyAgenda.map((c) => {
           const numeroCita = obtenerNumeroVezHistoriaClinica(c);

            return (
              <tr
                  key={c.id}
                  className={`fila-cita-historia ${
                    citaHoySeleccionadaId === c.id ? "fila-cita-seleccionada" : ""
                  }`}
                  title="Clic para cargar en Nuevo paciente"
                  onClick={() => cargarPacienteDesdeCitaHoy(c)}
                >
                
                <td>
                  {c.sinAgenda ? (
                    <span className="hora-sin-agenda">
                      Sin hora
                    </span>
                  ) : (
                    c.hora || "-"
                  )}
                </td>

                <td>
                  {capitalizarNombre(c.nombre || "")}
                </td>

                <td>
                  {c.Dni || c.dni || "-"}
                </td>

                <td>
                  {c.telefono ? (
                    <span className="telefono-tabla-hoy">
                      <FaWhatsapp />
                      {limpiarTelefono10(c.telefono)}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  <span
                    className={`badge-vez-paciente ${
                      numeroCita === 1 ? "badge-primera-vez" : "badge-repetido"
                    }`}
                  >
                    {textoNumeroCitaPacienteAgenda(numeroCita)}
                  </span>
                </td>

                <td>
                  <span
                    className="motivo-tabla-cita"
                    title={c.motivoConsulta || "Sin motivo"}
                  >
                    {c.motivoConsulta || "Sin motivo"}
                  </span>
                </td>

                <td>
                  <span className={`estado-cita-simple ${obtenerEstadoCitaClase(c)}`}>
                    {obtenerEstadoCitaTexto(c)}
                  </span>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    )}

  </div>
</div>

<br />

      {/* FORMULARIO */}
      <div ref={nuevoPacienteRef} className="historias-form-card mb-4">

        <div className="historias-form-title">
          <div className="historias-form-icon">
            <FaUserPlus />
          </div>

          <div>
            <h4>
              {editando ? "Editar paciente" : "Nuevo paciente"}
            </h4>

            <p>
              Completa los datos para la historia clínica.
            </p>
          </div>
        </div>

            <form onSubmit={editando ? guardarEdicion : crearPaciente}>


  <div className="row g-3">

            <div className="col-12 col-md-6">
              <label className="historias-label">
                Nombre completo
              </label>

              <input
                className="form-control historias-input"
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="historias-label">
                DNI
              </label>

              <input
                className="form-control historias-input"
                placeholder="Ej: 12345678"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="historias-label">
                Fecha de nacimiento
              </label>

              <input
                type="date"
                className="form-control historias-input"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="historias-label">
                Obra social
              </label>

              <input
                className="form-control historias-input"
                placeholder="Ej: ISSN / OSDE / Particular"
                value={obraSocial}
                onChange={(e) => setObraSocial(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="historias-label">
                Sexo
              </label>

              <select
                className="form-select historias-input"
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required
              >
                <option value="">Seleccione sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

          </div>

          <div className="historias-form-actions">

            <button className="historias-save-btn">
              {editando ? (
                <>
                  <FaCheckCircle />
                  Guardar cambios
                </>
              ) : (
                <>
                  <FaPlus />
                  Guardar paciente
                </>
              )}
            </button>

            {editando && (
              <button
                type="button"
                className="historias-cancel-btn"
                onClick={cancelarEdicion}
              >
                <FaTimes />
                Cancelar
              </button>
            )}

          </div>

        </form>

      </div>

{/* TÍTULO LISTADO DE PACIENTES */}
<div className="historias-listado-header">
  <h3>
    <span>HISTORIA CLÍNICA</span> REGISTRADAS
  </h3>

  <p>
    Historias clínicas de pacientes en el sistema. 
  </p>
</div>

      {/* BUSCADORES */}
<div className="historias-filtros-row mb-4">

  <div className="historias-search-card">

    <FaSearch className="historias-search-icon" />

    <input
      className="form-control historias-search-input"
      placeholder="Buscar por nombre o DNI..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
    />

    {busqueda && (
      <button
        type="button"
        className="historias-clear-search"
        onClick={() => setBusqueda("")}
      >
        <FaTimes />
      </button>
    )}

  </div>

</div>

{/* LISTADO */}
{cargandoPacientes ? (
  <div className="historias-empty">
    <FaSearch />
    <h5>Cargando historias clínicas...</h5>
    <p>Preparando los pacientes registrados.</p>
  </div>
) : pacientesPagina.length === 0 ? (
        <div className="historias-empty">
          <FaSearch />
          <h5>No se encontraron pacientes</h5>
          <p>
            Prueba con otro nombre o DNI.
          </p>
        </div>
      ) : (
        <div className="historias-list">

          {pacientesPagina.map((p) => {
            const sexoTexto = p.sexo?.toLowerCase() || "";

            const avatar =
              sexoTexto === "femenino" ? femaleAvatar : maleAvatar;

            const edad = calcularEdad(p.fechaNacimiento);
            const diagnosticosPaciente = p.diagnosticosResumen || [];
            const ultimaConsulta = p.ultimaConsultaTexto;
            const cantidadConsultas = p.cantidadConsultas || 0;

            return (
              <div key={p.id} className="historias-paciente-card">

                <div className="historias-consultas-badge-card">
                  <span>Consultas</span>
                  <strong>{cantidadConsultas}</strong>
                </div>

                <div className="historias-paciente-main">

                  <img
                    src={avatar}
                    alt={p.nombre}
                    className="historias-avatar"
                  />

                  <div className="historias-paciente-info">

                    <h4>{p.nombre}</h4>

                    <div className="historias-paciente-grid">

                      <span>
                        <FaIdCard />
                        DNI: {p.dni}
                      </span>

                      <span>
                        <FaBirthdayCake />
                        {formatearFecha(p.fechaNacimiento)}
                        {edad !== null && ` (${edad} años)`}
                      </span>

                      <span>
                        <FaShieldAlt />
                        {p.obraSocial}
                      </span>

                      <span>
                        <FaVenusMars />
                        {p.sexo}
                      </span>

                      <span>
                        <FaCalendarAlt />
                        Última consulta: {ultimaConsulta || "Sin consultas"}
                      </span>

                    </div>

                    {diagnosticosPaciente.length > 0 && (
                      <div className="historias-diag-chips">
                        {diagnosticosPaciente.map((diag) => (
                          <span key={diag}>
                            {diag}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

                <div className="historias-actions">

                  <Link
                    to={`/admin/historia/${p.id}`}
                    className="historias-action-btn historias-open"
                    title="Abrir historia"
                  >
                    <FaFolderOpen />
                  </Link>

                  <button
                    onClick={() => editarPaciente(p)}
                    className="historias-action-btn historias-edit"
                    title="Editar paciente"
                  >
                    <FaPencilAlt />
                  </button>

                  <button
                    onClick={() => eliminarPaciente(p.id)}
                    className="historias-action-btn historias-delete"
                    title="Eliminar paciente"
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="historias-pagination">

        <button
          className="historias-page-btn"
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
        >
          <FaChevronLeft />
        </button>

        <span>
          Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
        </span>

        <button
          className="historias-page-btn"
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          <FaChevronRight />
        </button>

      </div>

    </div>
  );
}

export default HistoriasClinicas;