import { useEffect, useState } from "react";
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
import { Link } from "react-router-dom";

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
  FaStethoscope 
} from "react-icons/fa";

import maleAvatar from "../assets/user-male.png";
import femaleAvatar from "../assets/user-female.png";
import "../styles/App.css";

function HistoriasClinicas() {
  const [pacientes, setPacientes] = useState([]);

  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [sexo, setSexo] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroDiagnostico, setFiltroDiagnostico] = useState("");
  const [diagnosticosPorPaciente, setDiagnosticosPorPaciente] = useState({});
  const [pagina, setPagina] = useState(1);
  const pacientesPorPagina = 6;

  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");

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
  const unsubscribe = onSnapshot(
    collectionGroup(db, "consultas"),
    (snapshot) => {
      const mapa = {};

      snapshot.docs.forEach((consultaDoc) => {
        const data = consultaDoc.data();

        const pacienteId = consultaDoc.ref.parent.parent?.id;

        if (!pacienteId) return;

        const listaDiagnosticos = Array.isArray(data.diagnosticos)
          ? data.diagnosticos
          : data.diagnostico
            ? data.diagnostico.split(" - ")
            : [];

        listaDiagnosticos.forEach((diag) => {
          const diagnosticoLimpio = diag?.toString().trim().toUpperCase();

          if (!diagnosticoLimpio) return;

          if (!mapa[pacienteId]) {
            mapa[pacienteId] = new Set();
          }

          mapa[pacienteId].add(diagnosticoLimpio);
        });
      });

      const mapaFinal = {};

      Object.entries(mapa).forEach(([pacienteId, diagnosticosSet]) => {
        mapaFinal[pacienteId] = Array.from(diagnosticosSet).sort((a, b) =>
          a.localeCompare(b, "es", {
            sensitivity: "base"
          })
        );
      });

      setDiagnosticosPorPaciente(mapaFinal);
    }
  );

  return () => unsubscribe();
}, []);

useEffect(() => {
  setPagina(1);
}, [busqueda, filtroDiagnostico]);

  const crearPaciente = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "historiasClinicas"), {
      nombre: nombre.trim(),
      dni: dni.trim(),
      fechaNacimiento,
      obraSocial: obraSocial.trim(),
      sexo,
      creado: new Date()
    });

    limpiarFormulario();
    setMensaje("Paciente creado correctamente");

    setTimeout(() => setMensaje(""), 3000);
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

    setMensaje("Paciente actualizado");

    setTimeout(() => setMensaje(""), 3000);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    limpiarFormulario();
  };

const pacientesFiltrados = pacientes.filter((p) => {
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

  return coincidePaciente && coincideDiagnostico;
});

  const indiceFinal = pagina * pacientesPorPagina;
  const indiceInicial = indiceFinal - pacientesPorPagina;

  const pacientesPagina = pacientesFiltrados.slice(
    indiceInicial,
    indiceFinal
  );

  const totalPaginas =
    Math.ceil(pacientesFiltrados.length / pacientesPorPagina) || 1;

  return (
    <div className="container historias-modern-container py-4 mb-5">

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

        <div className="historias-total-card">
          <FaUsers />
          <div>
            <strong>{pacientes.length}</strong>
            <span>Pacientes</span>
          </div>
        </div>

      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div className="alert alert-success historias-alert">
          <FaCheckCircle className="me-2" />
          {mensaje}
        </div>
      )}

      {/* FORMULARIO */}
      <div className="historias-form-card mb-4">

        <div className="historias-form-title">
          <div className="historias-form-icon">
            <FaUserPlus />
          </div>

          <div>
            <h4>
              {editando ? "Editar paciente" : "Nuevo paciente"}
            </h4>

            <p>
              Completa los datos básicos para crear o actualizar la historia clínica.
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

</div>

{(busqueda || filtroDiagnostico) && (
  <div className="historias-filter-info mb-3">
    Mostrando <strong>{pacientesFiltrados.length}</strong> resultado(s)
    {filtroDiagnostico && (
      <>
        {" "}con diagnóstico relacionado a{" "}
        <strong>{filtroDiagnostico.toUpperCase()}</strong>
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

            return (
              <div key={p.id} className="historias-paciente-card">

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