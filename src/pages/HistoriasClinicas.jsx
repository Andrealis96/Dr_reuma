import { useEffect, useState, useRef} from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  collectionGroup
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
  FaFileMedical,
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

  const [busqueda, setBusqueda] = useState("");
  const [filtroDiagnostico, setFiltroDiagnostico] = useState("");
  const [filtroSexo, setFiltroSexo] = useState("");
  const [diagnosticosPorPaciente, setDiagnosticosPorPaciente] = useState({});
  const [ultimaConsultaPorPaciente, setUltimaConsultaPorPaciente] = useState({});
  const [ultimaConsultaFechaPorPaciente, setUltimaConsultaFechaPorPaciente] = useState({});
  const [cantidadConsultasPorPaciente, setCantidadConsultasPorPaciente] = useState({}); 
  const [pagina, setPagina] = useState(1);
  const pacientesPorPagina = 6;

  const [editando, setEditando] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

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

const convertirFechaConsulta = (fecha) => {
  if (!fecha) return null;

  const partes = fecha.split("/");

  if (partes.length !== 3) return null;

  const [dia, mes, anio] = partes;

  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
};

const obtenerFechaHoraConsulta = (data) => {
  let fechaDate = null;
  let hora = data.hora || "";

  if (data.creado?.toDate) {
    fechaDate = data.creado.toDate();

    if (!hora) {
      hora = fechaDate.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
  } else if (data.creado instanceof Date) {
    fechaDate = data.creado;

    if (!hora) {
      hora = fechaDate.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
  } else {
    fechaDate = convertirFechaConsulta(data.fecha);
  }

  return {
    fecha: data.fecha || "",
    hora,
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
  const unsubscribe = onSnapshot(
    collectionGroup(db, "consultas"),
    (snapshot) => {
      const mapaDiagnosticos = {};
      const mapaUltimaConsulta = {};
      const mapaCantidadConsultas = {};

      snapshot.docs.forEach((consultaDoc) => {
        const data = consultaDoc.data();

        const pacienteId = consultaDoc.ref.parent.parent?.id;

        if (!pacienteId) return;

        mapaCantidadConsultas[pacienteId] =
          (mapaCantidadConsultas[pacienteId] || 0) + 1;

        const listaDiagnosticos = Array.isArray(data.diagnosticos)
          ? data.diagnosticos
          : data.diagnostico
            ? data.diagnostico.split(" - ")
            : [];

        listaDiagnosticos.forEach((diag) => {
          const diagnosticoLimpio = diag?.toString().trim().toUpperCase();

          if (!diagnosticoLimpio) return;

          if (!mapaDiagnosticos[pacienteId]) {
            mapaDiagnosticos[pacienteId] = new Set();
          }

          mapaDiagnosticos[pacienteId].add(diagnosticoLimpio);
        });

        const fechaHoraConsulta = obtenerFechaHoraConsulta(data);

        if (fechaHoraConsulta.fechaDate) {
          const ultimaActual = mapaUltimaConsulta[pacienteId]?.fechaDate;

          if (!ultimaActual || fechaHoraConsulta.fechaDate > ultimaActual) {
            mapaUltimaConsulta[pacienteId] = fechaHoraConsulta;
          }
        }
      });

      const mapaDiagnosticosFinal = {};
      const mapaUltimaConsultaFinal = {};
      const mapaUltimaConsultaFechaFinal = {};

      Object.entries(mapaDiagnosticos).forEach(
        ([pacienteId, diagnosticosSet]) => {
          mapaDiagnosticosFinal[pacienteId] = Array.from(diagnosticosSet).sort(
            (a, b) =>
              a.localeCompare(b, "es", {
                sensitivity: "base"
              })
          );
        }
      );

      Object.entries(mapaUltimaConsulta).forEach(([pacienteId, data]) => {
        mapaUltimaConsultaFinal[pacienteId] = data.hora
          ? `${data.fecha} - ${data.hora} hs`
          : data.fecha;

        mapaUltimaConsultaFechaFinal[pacienteId] =
          data.fechaDate?.getTime ? data.fechaDate.getTime() : 0;
      });

      setDiagnosticosPorPaciente(mapaDiagnosticosFinal);
      setUltimaConsultaPorPaciente(mapaUltimaConsultaFinal);
      setUltimaConsultaFechaPorPaciente(mapaUltimaConsultaFechaFinal);
      setCantidadConsultasPorPaciente(mapaCantidadConsultas);
    }
  );

  return () => unsubscribe();
}, []);

useEffect(() => {
  setPagina(1);
}, [busqueda, filtroDiagnostico, filtroSexo]);

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

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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

const pacientesFiltrados = pacientes
  .filter((p) => {
    const textoPaciente = normalizarTexto(busqueda);
    const textoDiagnostico = normalizarTexto(filtroDiagnostico);

    const coincidePaciente =
      !textoPaciente ||
      normalizarTexto(p.nombre).includes(textoPaciente) ||
      p.dni?.toString().includes(busqueda.trim());

    const diagnosticosPaciente = diagnosticosPorPaciente[p.id] || [];

    const coincideDiagnostico =
      !textoDiagnostico ||
      diagnosticosPaciente.some((diag) =>
        normalizarTexto(diag).includes(textoDiagnostico)
      );

    const coincideSexo =
      !filtroSexo ||
      normalizarTexto(p.sexo) === normalizarTexto(filtroSexo);

    return coincidePaciente && coincideDiagnostico && coincideSexo;
  })
  .sort((a, b) => {
    const ultimaB = ultimaConsultaFechaPorPaciente[b.id] || 0;
    const ultimaA = ultimaConsultaFechaPorPaciente[a.id] || 0;

    if (ultimaB !== ultimaA) {
      return ultimaB - ultimaA;
    }

    return obtenerCreadoPaciente(b) - obtenerCreadoPaciente(a);
  });

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

const obtenerClavePacienteAgenda = (cita) => {
  const dniPaciente = cita?.Dni || cita?.dni || "";

  if (dniPaciente.toString().trim()) {
    return `dni-${dniPaciente.toString().replace(/\D/g, "")}`;
  }

  return `nombre-${normalizarTexto(cita?.nombre || "")}`;
};

const obtenerNumeroCitaPacienteAgenda = (cita) => {
  if (!cita) return 1;

  const clavePaciente = obtenerClavePacienteAgenda(cita);

  const citasPaciente = citasAgenda
    .filter((c) => obtenerClavePacienteAgenda(c) === clavePaciente)
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora || "00:00"}`);
      const fechaB = new Date(`${b.fecha}T${b.hora || "00:00"}`);

      return fechaA - fechaB;
    });

  const posicion = citasPaciente.findIndex((c) => c.id === cita.id);

  return posicion === -1 ? 1 : posicion + 1;
};

const textoNumeroCitaPacienteAgenda = (numero) => {
  if (numero === 1) return "Primera vez";
  if (numero === 2) return "Segunda vez";
  if (numero === 3) return "Tercera vez";

  return `${numero}ª vez`;
};

const citasHoyAgenda = citasAgenda
  .filter((c) => c.fecha === obtenerFechaHoyLocal())
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
                <span className="subtitle-negro">PACIENTE</span>
              </>
            ) : (
              <>
                <span className="subtitle-celeste">HISTORIAS</span>{" "}
                <span className="subtitle-negro">CLÍNICAS</span>
              </>
            )}
          </h2>

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

  <div className="historias-total-card">
    <FaUsers />
    <div>
      <strong>{pacientes.length}</strong>
      <span>Pacientes</span>
    </div>
  </div>

</div>

      </div>

      {/* TABLA PACIENTES DE HOY DESDE AGENDA */}
<div className="card shadow-sm mb-4 historias-tabla-hoy-card">

  <div className="card-header text-center text-white fw-bold">
    <h3 className="mb-0">
      PACIENTES DE HOY
    </h3>
  </div>

  <div className="card-body p-0 table-responsive">

    {citasHoyAgenda.length === 0 ? (
      <div className="p-3 text-center fw-bold">
        No hay citas programadas para hoy
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
            const numeroCita = obtenerNumeroCitaPacienteAgenda(c);

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

  <div className="historias-search-card">

    <FaStethoscope className="historias-search-icon" />

    <input
      className="form-control historias-search-input"
      placeholder="Filtrar por diagnóstico..."
      value={filtroDiagnostico}
      onChange={(e) => setFiltroDiagnostico(e.target.value)}
    />

    {filtroDiagnostico && (
      <button
        type="button"
        className="historias-clear-search"
        onClick={() => setFiltroDiagnostico("")}
      >
        <FaTimes />
      </button>
    )}
 </div>

<div className="historias-search-card">
 <FaVenusMars className="historias-search-icon" />

  <select
    className="form-select historias-search-input"
    value={filtroSexo}
    onChange={(e) => setFiltroSexo(e.target.value)}
  >
    <option value="">Filtrar por sexo...</option>
    <option value="Masculino">Masculino</option>
    <option value="Femenino">Femenino</option>
  </select>

  {filtroSexo && (
    <button
      type="button"
      className="historias-clear-search"
      onClick={() => setFiltroSexo("")}
    >
      <FaTimes />
    </button>
  )}

  </div>

</div>

{(busqueda || filtroDiagnostico || filtroSexo) && (
  <div className="historias-filter-info mb-3">
    Mostrando <strong>{pacientesFiltrados.length}</strong> resultado(s)
    {filtroDiagnostico && (
      <>
        {" "}con diagnóstico relacionado a{" "}
        <strong>{filtroDiagnostico.toUpperCase()}</strong>
      </>
    )}

{filtroSexo && (
      <>
        {" "}y sexo{" "}
        <strong>{filtroSexo.toUpperCase()}</strong>
      </>
    )}

  </div>
)}

      {/* LISTADO */}
      {pacientesPagina.length === 0 ? (
        <div className="historias-empty">
          <FaSearch />
          <h5>No se encontraron pacientes</h5>
          <p>
            {filtroDiagnostico
              ? "No hay historias clínicas con ese diagnóstico."
              : "Prueba con otro nombre o DNI."}
          </p>
        </div>
      ) : (
        <div className="historias-list">

          {pacientesPagina.map((p) => {
            const sexoTexto = p.sexo?.toLowerCase() || "";

            const avatar =
              sexoTexto === "femenino" ? femaleAvatar : maleAvatar;

            const edad = calcularEdad(p.fechaNacimiento);
            const diagnosticosPaciente = diagnosticosPorPaciente[p.id] || [];
            const ultimaConsulta = ultimaConsultaPorPaciente[p.id]; 
            const cantidadConsultas = cantidadConsultasPorPaciente[p.id] || 0; 

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