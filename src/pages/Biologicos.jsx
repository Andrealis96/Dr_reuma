import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  FaCheckCircle,
  FaEdit,
  FaFilePdf,
  FaFolderOpen,
  FaHourglassHalf,
  FaLink,
  FaPaperPlane,
  FaPauseCircle,
  FaPlus,
  FaSearch,
  FaSyringe,
  FaTimes,
  FaUnlink,
  FaUsers,
} from "react-icons/fa";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import DrReumaLogo from "../assets/DrReumaLogo.png";
import "../styles/App.css";

const COLECCION = "tratamientosBiologicos";

const ESTADOS = [
  "EN PROCESO",
  "ENVIADO",
  "APROBADO",
  "RECHAZADO",
  "SUSPENDIDO",
];

const TIPOS = [
  "Biológico",
  "FAME sintético dirigido",
  "Antirresortivo",
  "Otro",
];

const formularioVacio = () => ({
  historiaClinicaId: "",
  nombrePaciente: "",
  dni: "",
  edadReferencia: "",
  enfermedad: "",
  obraSocial: "",
  medicamento: "",
  tipoTratamiento: "Biológico",
  dosisFrecuencia: "",
  fechaInicio: "",
  estadoTramite: "EN PROCESO",
  observaciones: "",
});

const normalizar = (texto = "") =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

const normalizarEstado = (valor = "") => {
  const estado = normalizar(valor);
  if (estado.includes("APROB")) return "APROBADO";
  if (estado.includes("ENVI") || estado === "ENVADO") return "ENVIADO";
  if (estado.includes("RECHAZ") || estado.includes("DENEG")) return "RECHAZADO";
  if (estado.includes("SUSPEND")) return "SUSPENDIDO";
  return "EN PROCESO";
};

const nombreHistoria = (p = {}) =>
  [p.nombres, p.apellidos].filter(Boolean).join(" ").trim() ||
  p.nombre ||
  p.nombreCompleto ||
  "Paciente sin nombre";

const fechaVisible = (iso = "") => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "—";
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
};

// Única fecha para ordenar; sin fecha al final.
const fechaParaOrden = (registro = {}) => {
  const fecha = String(registro.fechaInicio || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : "";
};

const ordenarTratamientos = (a, b) => {
  const primera = fechaParaOrden(a);
  const segunda = fechaParaOrden(b);
  if (primera !== segunda) return segunda.localeCompare(primera);
  return String(a.nombrePaciente || "").localeCompare(String(b.nombrePaciente || ""), "es");
};

const claseEstado = (estado) =>
  normalizarEstado(estado).toLowerCase().replaceAll(" ", "-");

const iconoEstado = (estado) => {
  switch (normalizarEstado(estado)) {
    case "APROBADO": return <FaCheckCircle />;
    case "ENVIADO": return <FaPaperPlane />;
    case "RECHAZADO": return <FaTimes />;
    case "SUSPENDIDO": return <FaPauseCircle />;
    default: return <FaHourglassHalf />;
  }
};

function Biologicos() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [historias, setHistorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(formularioVacio);
  const [busquedaHistoria, setBusquedaHistoria] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const detener = onSnapshot(
      collection(db, COLECCION),
      (snapshot) => {
        setRegistros(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setCargando(false);
        setError("");
      },
      (err) => {
        console.error("Biológicos: no se pudo leer Firestore", err);
        setError("No se pudieron cargar los tratamientos. Revisá los permisos de Firebase.");
        setCargando(false);
      }
    );
    return () => detener();
  }, []);

  useEffect(() => {
    const detener = onSnapshot(
      collection(db, "historiasClinicas"),
      (snapshot) => {
        setHistorias(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (err) => console.error("Biológicos: no se pudieron cargar las historias", err)
    );
    return () => detener();
  }, []);

  const estadisticas = useMemo(() => ({
    total: registros.length,
    aprobados: registros.filter((r) => normalizarEstado(r.estadoTramite) === "APROBADO").length,
    enviados: registros.filter((r) => normalizarEstado(r.estadoTramite) === "ENVIADO").length,
    proceso: registros.filter((r) => normalizarEstado(r.estadoTramite) === "EN PROCESO").length,
  }), [registros]);

  const ordenados = useMemo(() => [...registros].sort(ordenarTratamientos), [registros]);

  const visibles = useMemo(() => {
    const termino = normalizar(busqueda);
    return ordenados
      .filter((r) => filtroEstado === "TODOS" || normalizarEstado(r.estadoTramite) === filtroEstado)
      .filter((r) =>
        !termino ||
        [r.nombrePaciente, r.dni, r.enfermedad, r.obraSocial, r.medicamento]
          .some((dato) => normalizar(dato).includes(termino))
      );
  }, [ordenados, busqueda, filtroEstado]);

  const sugerencias = useMemo(() => {
    const termino = normalizar(busquedaHistoria);
    if (termino.length < 2) return [];
    return historias.filter((p) =>
      normalizar(`${nombreHistoria(p)} ${p.dni || p.Dni || ""}`).includes(termino)
    ).slice(0, 7);
  }, [historias, busquedaHistoria]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(formularioVacio());
    setBusquedaHistoria("");
    setModalAbierto(true);
    setMensaje("");
  };

  const abrirEdicion = (registro) => {
    setEditandoId(registro.id);
    setForm({
      ...formularioVacio(),
      ...registro,
      estadoTramite: normalizarEstado(registro.estadoTramite),
    });
    setBusquedaHistoria("");
    setModalAbierto(true);
    setMensaje("");
  };

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setForm((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "nombrePaciente" ? { historiaClinicaId: "" } : {}),
    }));
  };

  const vincularHistoria = (paciente) => {
    setForm((anterior) => ({
      ...anterior,
      historiaClinicaId: paciente.id,
      nombrePaciente: nombreHistoria(paciente),
      dni: String(paciente.dni || paciente.Dni || "").replace(/\D/g, ""),
    }));
    setBusquedaHistoria("");
  };

  const guardarTratamiento = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    if (!form.nombrePaciente.trim() || !form.enfermedad.trim() || !form.obraSocial.trim()) {
      window.alert("Completá paciente, enfermedad y obra social.");
      return;
    }
    const datos = {
      historiaClinicaId: form.historiaClinicaId || "",
      nombrePaciente: form.nombrePaciente.trim(),
      dni: String(form.dni || "").replace(/\D/g, ""),
      edadReferencia: String(form.edadReferencia || "").replace(/\D/g, ""),
      enfermedad: form.enfermedad.trim(),
      obraSocial: form.obraSocial.trim().toLocaleUpperCase("es-AR"),
      medicamento: form.medicamento.trim(),
      tipoTratamiento: form.tipoTratamiento,
      dosisFrecuencia: form.dosisFrecuencia.trim(),
      fechaInicio: form.fechaInicio || "",
      estadoTramite: normalizarEstado(form.estadoTramite),
      observaciones: form.observaciones.trim(),
    };

    try {
      setGuardando(true);
      if (editandoId) {
        await updateDoc(doc(db, COLECCION, editandoId), {
          ...datos,
          actualizadoEn: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, COLECCION), {
          ...datos,
          origenRegistro: "manual",
          creadoEn: serverTimestamp(),
          actualizadoEn: serverTimestamp(),
        });
      }
      setModalAbierto(false);
      setMensaje(editandoId ? "Tratamiento actualizado correctamente." : "Tratamiento agregado correctamente.");
    } catch (err) {
      console.error("No se pudo guardar el tratamiento", err);
      window.alert("No se pudo guardar. Revisá los permisos de Firebase e intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="bio-modulo container py-4">
      <header className="bio-encabezado">
        <div className="bio-encabezado-textos">
          <span className="bio-etiqueta"><FaSyringe /> PANEL DE TRATAMIENTOS</span>
          <h1>BIOLÓGICOS</h1>
          <p>Tratamientos especiales, autorizaciones y seguimiento de pacientes.</p>
        </div>
        <div className="bio-acciones-superiores">
          <button
            type="button"
            className="bio-boton bio-boton-pdf"
            onClick={() => window.print()}
            disabled={cargando || Boolean(error) || registros.length === 0}
            title="Imprimir o guardar como PDF el listado completo"
          >
            <FaFilePdf /> PDF / Imprimir
          </button>
          <button type="button" className="bio-boton bio-boton-primario" onClick={abrirNuevo}>
            <FaPlus /> Agregar tratamiento
          </button>
        </div>
      </header>

      <section className="bio-estadisticas" aria-label="Resumen de tratamientos">
        {[
          { clase: "total", titulo: "Total", valor: estadisticas.total, Icono: FaUsers },
          { clase: "aprobado", titulo: "Aprobados", valor: estadisticas.aprobados, Icono: FaCheckCircle },
          { clase: "enviado", titulo: "Enviados", valor: estadisticas.enviados, Icono: FaPaperPlane },
          { clase: "proceso", titulo: "En proceso", valor: estadisticas.proceso, Icono: FaHourglassHalf },
        ].map(({ clase, titulo, valor, Icono }) => (
          <div key={clase} className={`bio-estadistica bio-estadistica-${clase}`}>
            <div className="bio-estadistica-icono"><Icono /></div>
            <div className="bio-estadistica-texto">
              <span>{titulo}</span>
              <strong>{valor}</strong>
            </div>
          </div>
        ))}
      </section>

      {mensaje && <div className="bio-mensaje" role="status">{mensaje}</div>}
      {error && <div className="bio-error" role="alert">{error}</div>}

      <section className="bio-panel-listado">
        <div className="bio-filtros">
          <label className="bio-campo-buscar">
            <FaSearch />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar paciente, DNI o medicamento..."
              aria-label="Buscar tratamientos"
            />
          </label>
          <label className="bio-filtro-select">
            <span>Estado</span>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="TODOS">Todos</option>
              {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
            </select>
          </label>
        </div>

        <div className="bio-listado-cabecera">
          <h2>Pacientes y tratamientos</h2>
          <span>{visibles.length} registro(s)</span>
        </div>

        {cargando ? (
          <p className="bio-vacio">Cargando tratamientos...</p>
        ) : visibles.length === 0 ? (
          <div className="bio-vacio">
            <FaSyringe />
            <p>No hay tratamientos que coincidan con la búsqueda.</p>
            <span>Podés agregar un tratamiento nuevo desde el botón superior.</span>
          </div>
        ) : (
          <div className="bio-lista">
            {visibles.map((registro, index) => (
              <article className={`bio-registro bio-registro-${claseEstado(registro.estadoTramite)}`} key={registro.id}>
                <div className="bio-registro-superior">
                  <div className="bio-registro-cabecera-paciente">
                    <span className="bio-registro-numero">{index + 1}</span>
                    <div className="bio-registro-identidad">
                      <h3>{registro.nombrePaciente || "Paciente sin nombre"}</h3>
                      <p>{registro.enfermedad || "Sin diagnóstico"}</p>
                    </div>
                  </div>
                  <span className={`bio-estado bio-estado-${claseEstado(registro.estadoTramite)}`}>
                    {iconoEstado(registro.estadoTramite)}
                    {normalizarEstado(registro.estadoTramite)}
                  </span>
                </div>
                <div className="bio-registro-datos">
                  <div><span>Medicamento</span><strong>{registro.medicamento || "Pendiente de definir"}</strong></div>
                  <div><span>Dosis y frecuencia</span><strong>{registro.dosisFrecuencia || "—"}</strong></div>
                  <div><span>Obra social</span><strong>{registro.obraSocial || "—"}</strong></div>
                  <div><span>Fecha de inicio</span><strong>{fechaVisible(registro.fechaInicio)}</strong></div>
                </div>
                <div className="bio-registro-pie">
                  <span className="bio-vinculo-mini">
                    {registro.historiaClinicaId ? <><FaLink /> Historia vinculada</> : "Sin vincular a historia"}
                  </span>
                  <div className="bio-registro-acciones">
                    {registro.historiaClinicaId && (
                      <button
                        type="button"
                        className="bio-boton bio-boton-historia"
                        onClick={() => navigate(`/admin/historia/${encodeURIComponent(registro.historiaClinicaId)}`)}
                      >
                        <FaFolderOpen /> Ver historia clínica
                      </button>
                    )}
                    <button type="button" className="bio-boton bio-boton-editar" onClick={() => abrirEdicion(registro)}>
                      <FaEdit /> Editar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* La plantilla de impresión solo se ve al imprimir o guardar como PDF. */}
      <section className="bio-impresion" aria-label="Plantilla imprimible de biológicos">
        <header className="bio-impresion-cabecera">
          <img src={DrReumaLogo} alt="Logo Dr. Reuma" className="bio-impresion-logo" />
          <div className="bio-impresion-titulos">
            <h1>PLANTILLA DE BIOLÓGICOS</h1>
            <p>Dr. Tony Vélez · Médico Reumatólogo</p>
            <p>Control de tratamientos y autorizaciones</p>
          </div>
          <div className="bio-impresion-info">
            <strong>{ordenados.length} tratamientos</strong>
            <span>Emitido: {new Date().toLocaleDateString("es-AR")}</span>
          </div>
        </header>
        <table className="bio-impresion-tabla">
          <colgroup>
            <col className="bio-pdf-numero" />
            <col className="bio-pdf-enfermedad" />
            <col className="bio-pdf-nombre" />
            <col className="bio-pdf-edad" />
            <col className="bio-pdf-obra" />
            <col className="bio-pdf-medicamento" />
            <col className="bio-pdf-dosis" />
            <col className="bio-pdf-fecha" />
            <col className="bio-pdf-estado" />
          </colgroup>
          <thead>
            <tr>
              <th>N°</th>
              <th>ENFERMEDAD</th>
              <th>NOMBRE</th>
              <th>EDAD</th>
              <th>OBRA SOCIAL</th>
              <th>BIOLÓGICO / MEDICACIÓN</th>
              <th>SUMINISTRACIÓN</th>
              <th>FECHA DE INICIO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((registro, index) => (
              <tr key={registro.id}>
                <td>{index + 1}</td>
                <td>{registro.enfermedad || "—"}</td>
                <td>{registro.nombrePaciente || "—"}</td>
                <td>{registro.edadReferencia ? `${registro.edadReferencia} años` : "—"}</td>
                <td>{registro.obraSocial || "—"}</td>
                <td>{registro.medicamento || "Pendiente de definir"}</td>
                <td>{registro.dosisFrecuencia || "—"}</td>
                <td>{fechaVisible(registro.fechaInicio)}</td>
                <td className={`bio-impresion-estado bio-impresion-${claseEstado(registro.estadoTramite)}`}>
                  {normalizarEstado(registro.estadoTramite)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="bio-impresion-pie">Uso interno · Información clínica confidencial · Dr. Reuma</p>
      </section>

      {modalAbierto && (
        <div className="bio-modal-fondo" role="presentation" onMouseDown={(e) => {
          if (e.target === e.currentTarget && !guardando) setModalAbierto(false);
        }}>
          <section className="bio-modal" role="dialog" aria-modal="true" aria-labelledby="bio-modal-titulo">
            <header className="bio-modal-cabecera">
              <div>
                <span>DR. REUMA · TRATAMIENTOS</span>
                <h2 id="bio-modal-titulo">{editandoId ? "Editar tratamiento" : "Agregar tratamiento"}</h2>
              </div>
              <button type="button" className="bio-cerrar" onClick={() => setModalAbierto(false)} disabled={guardando} aria-label="Cerrar">
                <FaTimes />
              </button>
            </header>

            <form className="bio-formulario" onSubmit={guardarTratamiento}>
              <div className="bio-form-seccion">
                <h3>Paciente</h3>
                <label className="bio-campo bio-campo-ancho">
                  <span>Buscar y vincular con Historias Clínicas</span>
                  <input
                    type="search"
                    value={busquedaHistoria}
                    onChange={(e) => setBusquedaHistoria(e.target.value)}
                    placeholder="Nombre, apellido o DNI (mínimo 2 caracteres)"
                  />
                </label>
                {sugerencias.length > 0 && (
                  <div className="bio-sugerencias">
                    {sugerencias.map((p) => (
                      <button type="button" key={p.id} onClick={() => vincularHistoria(p)}>
                        <span>{nombreHistoria(p)}</span>
                        <small>DNI: {p.dni || p.Dni || "No registrado"}</small>
                      </button>
                    ))}
                  </div>
                )}
                {form.historiaClinicaId && (
                  <div className="bio-vinculo-activo">
                    <span><FaLink /> Historia clínica vinculada</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, historiaClinicaId: "" }))}>
                      <FaUnlink /> Desvincular
                    </button>
                  </div>
                )}
              </div>

              <div className="bio-form-grid">
                <label className="bio-campo bio-campo-ancho">
                  <span>Nombre completo del paciente *</span>
                  <input name="nombrePaciente" value={form.nombrePaciente} onChange={actualizarCampo} required placeholder="Nombre y apellido" />
                </label>
                <label className="bio-campo">
                  <span>DNI</span>
                  <input name="dni" inputMode="numeric" value={form.dni} onChange={actualizarCampo} placeholder="Sin puntos" />
                </label>
                <label className="bio-campo">
                  <span>Edad de referencia</span>
                  <input name="edadReferencia" inputMode="numeric" value={form.edadReferencia} onChange={actualizarCampo} placeholder="Ej.: 55" />
                </label>
                <label className="bio-campo">
                  <span>Enfermedad *</span>
                  <input name="enfermedad" value={form.enfermedad} onChange={actualizarCampo} required placeholder="Diagnóstico" />
                </label>
                <label className="bio-campo">
                  <span>Obra social *</span>
                  <input name="obraSocial" value={form.obraSocial} onChange={actualizarCampo} required placeholder="Ej.: ISSN / PAMI" />
                </label>
                <label className="bio-campo bio-campo-ancho">
                  <span>Medicamento (puede quedar pendiente)</span>
                  <input name="medicamento" value={form.medicamento} onChange={actualizarCampo} placeholder="Nombre genérico, presentación y marca" />
                </label>
                <label className="bio-campo">
                  <span>Tipo de tratamiento</span>
                  <select name="tipoTratamiento" value={form.tipoTratamiento} onChange={actualizarCampo}>
                    {TIPOS.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </label>
                <label className="bio-campo">
                  <span>Dosis y frecuencia</span>
                  <input name="dosisFrecuencia" value={form.dosisFrecuencia} onChange={actualizarCampo} placeholder="Ej.: 40 mg cada 15 días" />
                </label>
                <label className="bio-campo">
                  <span>Fecha de inicio</span>
                  <input type="date" name="fechaInicio" value={form.fechaInicio || ""} onChange={actualizarCampo} />
                </label>
                <label className="bio-campo">
                  <span>Estado del trámite</span>
                  <select name="estadoTramite" value={form.estadoTramite} onChange={actualizarCampo}>
                    {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                  </select>
                </label>
                <label className="bio-campo bio-campo-ancho">
                  <span>Observaciones administrativas</span>
                  <textarea name="observaciones" value={form.observaciones} onChange={actualizarCampo} rows={3} placeholder="Autorización, documentación pendiente, etc." />
                </label>
              </div>

              <footer className="bio-modal-acciones">
                <button type="button" className="bio-boton bio-boton-secundario" onClick={() => setModalAbierto(false)} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="bio-boton bio-boton-primario" disabled={guardando}>
                  {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Agregar tratamiento"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Biologicos;
