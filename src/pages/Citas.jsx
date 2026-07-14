import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import ModalCita from "../components/ModalCita";
import ModalDetalle from "../components/ModalDetalle";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaWhatsapp,
  FaCalendarAlt,
  FaStethoscope,
  FaUserClock,
  FaSearch,
  FaIdCard,
  FaUser,
  FaUsers,
  FaClock, 
  FaVideo,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaSun,
  FaCloudSun,
  FaStickyNote
} from "react-icons/fa";

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";

import Swal from "sweetalert2";
import { db } from "../firebase";

function Citas() {
  const calendarRef = useRef(null);

  const [citasDB, setCitasDB] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [citaEditar, setCitaEditar] = useState(null);

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const normalizarHora = (h) => h?.slice(0,5);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaPreseleccionada, setHoraPreseleccionada] = useState(null);
  const [busquedaPaciente, setBusquedaPaciente] = useState(""); 
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [showModalBloqueo, setShowModalBloqueo] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState("");
  const detalleDiaRef = useRef(null);
  //variable para bloquear viernes
  const [viernesAgenda, setViernesAgenda] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [showDetalle, setShowDetalle] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  //notas 
  const [notasAgenda, setNotasAgenda] = useState([]);
  const [showModalNota, setShowModalNota] = useState(false);
  const [notaDia, setNotaDia] = useState("");

  // ================= FIRESTORE =================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "citas"), (snap) => {
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setCitasDB(data);

      setEventos(
        data.map(c => ({
          id: c.id,
          title: c.nombre,
          start: `${c.fecha}T${c.hora}`,
          classNames: [`evento-${c.tipo}`],
          extendedProps: c
        }))
      );
    });

    return () => unsub();
  }, []);

useEffect(() => {
  if (!diaSeleccionado) return;

  const horarios = obtenerHorariosDisponibles(diaSeleccionado);
  setHorariosDisponibles(horarios);
}, [diaSeleccionado, citasDB, viernesAgenda, bloqueos]);

useEffect(() => {
  const unsub = onSnapshot(collection(db, "bloqueosAgenda"), (snap) => {
    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setBloqueos(data);
  });

  return () => unsub();
}, []);

//useEffect para viernes bloqueado 
useEffect(() => {
  const unsub = onSnapshot(collection(db, "viernesAgenda"), (snap) => {
    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setViernesAgenda(data);
  });

  return () => unsub();
}, []);
//para notas
useEffect(() => {
  const unsub = onSnapshot(collection(db, "notasAgenda"), (snap) => {
    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setNotasAgenda(data);
  });

  return () => unsub();
}, []);

  // ================= HORARIOS =================
  const generarHorarios = (inicio, fin) => {
    const horarios = [];
    let [h, m] = inicio.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {
      horarios.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );

      m += 30;
      if (m >= 60) {
        m = 0;
        h++;
      }
    }

    return horarios;
  };

  const diaEstaBloqueado = (fecha) => {
  return bloqueos.some(b => b.fecha === fecha && b.activo);
};

const toggleBloqueoDia = async () => {
  if (!diaSeleccionado) return;

  const bloqueoActivo = bloqueos.find(
    b => b.fecha === diaSeleccionado && b.activo
  );

  // Si ya está bloqueado: desbloquea directo
  if (bloqueoActivo) {
    updateDoc(
  doc(db, "bloqueosAgenda", bloqueoActivo.id),
  {
    activo: false
  }
);

return;
  }

  // Si está disponible: abre modal para escribir motivo
  setMotivoBloqueo("");
  setShowModalBloqueo(true);
};

const guardarBloqueoDia = async () => {
  const motivo = motivoBloqueo || "Sin motivo especificado";

  setShowModalBloqueo(false);
  setMotivoBloqueo("");

  await addDoc(collection(db, "bloqueosAgenda"), {
    fecha: diaSeleccionado,
    activo: true,
    motivo,
    createdAt: new Date()
  });
};

const obtenerHorariosDisponibles = (fecha) => {
   if (diaEstaBloqueado(fecha)) {
    return [];
  }
  const [y, m, d] = fecha.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();

  let base = [];

  if (day === 1 || day === 2 || day === 3) {
  base = generarHorarios("15:00", "18:00");
  base.unshift("14:45"); // lo agrega al inicio
}
  else if (day === 4)
    base = ["09:30","10:00","10:30","13:20"];
  //horarios viernes
  else if (day === 5) {
  const configViernes = getConfiguracionViernes(fecha);

  if (!configViernes) {
    return [];
  }

  if (configViernes.turno === "mañana") {
    base = ["09:30", "10:00", "10:30", "11:00", "13:20"];
  }

  if (configViernes.turno === "tarde") {
    base = ["14:45", "15:00", "15:30", "16:30"];
  }
}
  else if (day === 6)
    base = generarHorarios("10:00", "12:30");
  else
    return [];

  const ocupados = citasDB
    .filter(c => c.fecha === fecha)
    .map(c => String(c.hora).trim().slice(0, 5));

  return base.filter(
    h => !ocupados.includes(h.trim().slice(0, 5))
  );
};


//funcion para viernes bloqueado
const getConfiguracionViernes = (fecha) => {
  return viernesAgenda.find(v => v.fecha === fecha);
};

const cambiarTurnoViernes = async (turno) => {
  if (!diaSeleccionado) return;

  const existente = getConfiguracionViernes(diaSeleccionado);

  if (existente) {
    await updateDoc(doc(db, "viernesAgenda", existente.id), {
      turno
    });
  } else {
    await addDoc(collection(db, "viernesAgenda"), {
      fecha: diaSeleccionado,
      turno,
      createdAt: new Date()
    });
  }
};

  // ================= PACIENTES =================
  const pacientesDelDia = citasDB
    .filter(c => c.fecha === diaSeleccionado)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const hoy = new Date().toISOString().split("T")[0];

  const pacientesHoy = citasDB
    .filter(c => c.fecha === hoy)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const citasHoy = pacientesHoy.length;

  const proximoPaciente = pacientesHoy.find(c => {
    return new Date(`${c.fecha}T${c.hora}`) >= new Date();
  });

  const pacientesRestantes = pacientesHoy.filter(c => {
    return new Date(`${c.fecha}T${c.hora}`) >= new Date();
  }).length;

  const resultadosBusqueda =
  busquedaPaciente.trim() === ""
    ? []
    : citasDB
        .filter(c =>
          c.nombre?.toLowerCase().includes(
            busquedaPaciente.toLowerCase()
          ) ||
          c.Dni?.toString().includes(
            busquedaPaciente
          )
        )
        .sort((a, b) => {
          const fechaA = new Date(`${a.fecha}T${a.hora}`);
          const fechaB = new Date(`${b.fecha}T${b.hora}`);
          return fechaB - fechaA;
        });

  const abrirDetalle = (cita) => {
  setCitaSeleccionada(cita);
  setShowDetalle(true);
};

const capitalizarNombre = (texto) => {
  return texto
    ?.toLowerCase()
    .split(" ")
    .map(
      palabra =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(" ");
};

  // ================= GUARDAR =================
const guardarCita = async (data) => {

  const q = query(
    collection(db, "citas"),
    where("fecha", "==", data.fecha),
    where("hora", "==", data.hora)
  );

  const snap = await getDocs(q);

  const existe = snap.docs.some(
    d => d.id !== citaEditar?.id
  );

  if (existe) {
    Swal.fire({
      icon: "warning",
      title: "Horario ocupado",
      text: "Ya existe una cita agendada para esa hora."
    });
    return;
  }

  if (citaEditar) {
    await updateDoc(
      doc(db, "citas", citaEditar.id),
      data
    );

    setCitaEditar(null);
    setShowModal(false);
    return;
  }

  await addDoc(
    collection(db, "citas"),
    {
      ...data,
      createdAt: new Date()
    }
  );

  setShowModal(false);
};


const fechaFormateada = diaSeleccionado
  ? new Date(`${diaSeleccionado}T00:00:00`).toLocaleDateString(
      "es-ES",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    )
     .replace(/^./, c => c.toUpperCase())
  : "";

const cambiarDia = (direccion) => {
  if (!diaSeleccionado) return;

  const fecha = new Date(`${diaSeleccionado}T00:00:00`);

  fecha.setDate(
    fecha.getDate() + direccion
  );

  const nuevaFecha = fecha
    .toISOString()
    .split("T")[0];

  setDiaSeleccionado(nuevaFecha);
}; 

const bloqueoDelDia = bloqueos.find(
  b => b.fecha === diaSeleccionado && b.activo
);

const notaDelDia = notasAgenda.find(
  n => n.fecha === diaSeleccionado
);

const abrirModalNota = () => {
  setNotaDia(notaDelDia?.texto || "");
  setShowModalNota(true);
};

const guardarNotaDia = async () => {
  if (!diaSeleccionado) return;

  const texto = notaDia.trim();

  const existente = notasAgenda.find(
    n => n.fecha === diaSeleccionado
  );

  setShowModalNota(false);
  setNotaDia("");

  if (existente) {
    if (texto === "") {
      await deleteDoc(doc(db, "notasAgenda", existente.id));
      return;
    }

    await updateDoc(doc(db, "notasAgenda", existente.id), {
      texto,
      updatedAt: new Date()
    });

    return;
  }

  if (texto !== "") {
    await addDoc(collection(db, "notasAgenda"), {
      fecha: diaSeleccionado,
      texto,
      createdAt: new Date()
    });
  }
};

const eliminarNotaDia = async () => {
  const existente = notasAgenda.find(
    n => n.fecha === diaSeleccionado
  );

  setShowModalNota(false);
  setNotaDia("");

  if (existente) {
    await deleteDoc(doc(db, "notasAgenda", existente.id));
  }
};

  return (
    <div className="container py-4">

      {/* HEADER */}
      <h3 className="subtitle-general text-center mb-4">
        <span className="subtitle-celeste">CALENDARIO DE</span>
        <span className="subtitle-negro"> CITAS</span>
      </h3>

      {/* CARDS */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-md-4">
          <div className="stat-card h-100">
            <h6><FaCalendarAlt className="me-2 celeste" />Hoy</h6>
            <h4>{citasHoy}</h4>
          </div>
        </div>

        <div className="col-6 col-md-4">
          <div className="stat-card h-100">
            <h6><FaUserClock className="me-2 celeste" />Próximo paciente</h6>
            <h5>
              {proximoPaciente
                ? capitalizarNombre(proximoPaciente.nombre)
                : "Sin pacientes"}
            </h5>
            <small>{proximoPaciente?.hora || ""}</small>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card h-100">
            <h6><FaUsers className="me-2 celeste" />Restantes</h6>
            <h4>{pacientesRestantes}</h4>
          </div>
        </div>

      </div>

      {/* TABLA DE HOY (LA TUYA ORIGINAL) */}
      <div className="card shadow-sm mb-4">
        <div className="card-header  text-center text-white fw-bold">
          <h3>  
            PACIENTES DE HOY
          </h3>
        </div>

        <div className="card-body p-0 table-responsive">

          {pacientesHoy.length === 0 ? (
            <div className="p-3 text-center">
              No hay citas programadas
            </div>
          ) : (
            <table className="table table-sm mb-0">
              <thead>
                <tr className="text-center">
                  <th>
                      <FaClock className="me-1 celeste text-center" /> <br />
                       <span className="celeste">
                        Hora
                       </span>
                    </th>

                    <th>
                      <FaUser className="me-2 celeste" /><br />
                      <span className="celeste">
                      Paciente
                      </span>
                    </th>

                    <th>
                      <FaIdCard className="me-2 celeste" /> <br />
                      <span className="celeste">
                        Dni
                      </span>
                    </th>

                    <th>
                      <FaWhatsapp className="me-2 celeste" /> <br />
                      <span className="celeste">
                        Teléfono
                      </span>
                    </th>

                    <th>
                      <FaStethoscope className="me-2 celeste" /> <br />
                      <span className="celeste">
                        Tipo
                      </span>
                    </th>
                </tr>
              </thead>

              <tbody className="text-center">
                {pacientesHoy.map(c => (
                  <tr key={c.id}>
                    <td>{c.hora}</td>
                    <td>{capitalizarNombre(c.nombre)}</td>
                    <td>{c.Dni}</td>
                    <td> 
                      {c.telefono ? (
                        <a
                          href={`https://wa.me/${c.telefono.replace(/\D/g,"")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-success text-decoration-none"
                        >
                        {c.telefono}
                        </a>
                      ) : "-"}
                    </td>
                    <td>
                      {c.tipo === "presencial" ? (
                        <>
                          🟢 Presencial
                        </>
                      ) : (
                        <>
                          🔵 Virtual
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>


      {/* CALENDARIO (SIN SCROLL FORZADO) */}
      <div className="card p-3">
        <FullCalendar
  ref={calendarRef}
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  locale={esLocale}
  showNonCurrentDates={false}
  fixedWeekCount={false}
  initialView="dayGridMonth"
  events={eventos}
  height="auto"

  dayCellClassNames={(arg) => {
    const fecha = arg.date.toISOString().split("T")[0];
    return diaEstaBloqueado(fecha) ? ["dia-bloqueado"] : [];
  }}

 dayCellContent={(arg) => {
  const fecha = arg.date.toISOString().split("T")[0];
const configViernes = getConfiguracionViernes(fecha);

const tieneNota = notasAgenda.some(
  n => n.fecha === fecha && n.texto?.trim()
);

  return (
    <div className="dia-celda-custom">

      {tieneNota && (
  <div
    className="nota-triangulo"
    title="Este día tiene una nota"
  />
)}

      <div className="dia-numero">
        {arg.dayNumberText}
      </div>

      {diaEstaBloqueado(fecha) && (
        <div className="candado-centro">
          <FaLock className="candado-bloqueo" />
        </div>
      )}

      {configViernes?.turno && (
        <div
          className={`turno-viernes-label ${
            configViernes.turno === "mañana"
              ? "turno-manana"
              : "turno-tarde"
          }`}
        >
          {configViernes.turno === "mañana"
            ? "Mañana"
            : "Tarde"}
        </div>
      )}
    </div>
  );
}}

  headerToolbar={{
    left: "title",
    right: "prev,next"
  }}
  eventTimeFormat={{
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }}

  dateClick={(info) => {
  setDiaSeleccionado(info.dateStr);

  setTimeout(() => {
    detalleDiaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 50);
}}

eventClick={(info) => {
  setDiaSeleccionado(
    info.event.startStr.split("T")[0]
  );

  setTimeout(() => {
    detalleDiaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 50);
}}
/>
</div>

{/* BLOQUE DÍA SELECCIONADO */}
{diaSeleccionado && (
<div
            ref={detalleDiaRef}
            className="card mt-3 p-3"
          >

<div className="card buscador-paciente  mt-3 p-3">
<div className="buscador-wrapper">

  <span className="buscador-icono">
    <FaSearch />
  </span>

  <input
    type="text"
    className="form-control buscador-paciente"
    placeholder="Buscar paciente o DNI..."
    value={busquedaPaciente}
    onChange={(e) =>
      setBusquedaPaciente(e.target.value)
    }
  />

  {busquedaPaciente && (
    <button
      type="button"
      className="btn-limpiar"
      onClick={() => setBusquedaPaciente("")}
    >
      ✕
    </button>
  )}

</div>

  {busquedaPaciente.trim() !== "" && (
    <div className="mt-3">

      {resultadosBusqueda.length === 0 ? (
        <p className="text-muted mb-0">
          No se encontraron pacientes.
        </p>
      ) : (
        resultadosBusqueda.map(c => (
          <div
            key={c.id}
            className="resultado-paciente p-2 mb-2"
            onClick={() => {
              setCitaSeleccionada(c);
              setShowDetalle(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <strong>
              {capitalizarNombre(c.nombre)}
            </strong>

            <br />

            <small>
              DNI: {c.Dni}
            </small>

            <br />

            <small>
              📅 {c.fecha} | 🕒 {c.hora}
            </small>
          </div>
        ))
      )}
    </div>
  )}

</div>
<br />
<div className="agenda-header mb-3">

  <h5 className="fw-bold celeste mb-0">
    <FaCalendarAlt className="me-2" />
    {fechaFormateada}
  </h5>

  <div className="agenda-flechas">
    <button
      className="btn btn-citadias me-2"
      onClick={() => cambiarDia(-1)}
    >
      <FaChevronLeft />
    </button>

    <button
      className="btn btn-citadias"
      onClick={() => cambiarDia(1)}
    >
      <FaChevronRight />
    </button>
  </div>
</div>

<div className="mb-3">

  <div className="d-flex gap-2 align-items-center flex-wrap">

    <button
      className={`btn btn-agenda-icono ${
        diaEstaBloqueado(diaSeleccionado)
          ? "btn-danger"
          : "btn-outline-secondary"
      }`}
      onClick={toggleBloqueoDia}
      title={
        diaEstaBloqueado(diaSeleccionado)
          ? "Desbloquear día"
          : "Bloquear día"
      }
    >
      {diaEstaBloqueado(diaSeleccionado) ? <FaEyeSlash /> : <FaEye />}
    </button>

    <button
      className={`btn btn-agenda-icono ${
        notaDelDia ? "btn-info" : "btn-outline-info"
      }`}
      onClick={abrirModalNota}
      title={notaDelDia ? "Ver nota del día" : "Agregar nota"}
    >
      <FaStickyNote />
    </button>

    {diaSeleccionado &&
      new Date(`${diaSeleccionado}T00:00:00`).getDay() === 5 && (
        <div className="d-flex gap-2">

          <button
            className={`btn btn-agenda-icono ${
              getConfiguracionViernes(diaSeleccionado)?.turno === "mañana"
                ? "btn-warning"
                : "btn-outline-warning"
            }`}
            onClick={() => cambiarTurnoViernes("mañana")}
            title="Consultorio de mañana"
          >
            <FaSun />
          </button>

          <button
            className={`btn btn-agenda-icono ${
              getConfiguracionViernes(diaSeleccionado)?.turno === "tarde"
                ? "btn-tarde"
                : "btn-outline-tarde"
            }`}
            onClick={() => cambiarTurnoViernes("tarde")}
            title="Consultorio de tarde"
          >
            <FaCloudSun />
          </button>

        </div>
      )}

  </div>

  {notaDelDia?.texto && (
    <div className="alert alert-info py-2 px-3 mt-2 mb-0 nota-dia-alert">
      <strong className="d-block">📝 NOTA DEL DÍA:</strong>
      <span className="d-block">{notaDelDia.texto}</span>
    </div>
  )}

</div>

          {pacientesDelDia.length === 0 ? (
            <p>No hay pacientes</p>
          ) : (
            pacientesDelDia.map(c => (
              <div
  key={c.id}
  className="btn-pacientecita"
  onClick={() => {
    setCitaSeleccionada(c);
    setShowDetalle(true);
  }}
>
  <div className="d-flex justify-content-between align-items-center">

    <div>
      <div className="hora-paciente">
        {c.hora}
      </div>

      <div className="nombre-paciente-dia">
        {capitalizarNombre(c.nombre)}
      </div>
    </div>

    <div>
      {c.tipo === "presencial" ? (
        <span className="tipo-presencial">
          🟢 Presencial
        </span>
      ) : (
        <span className="tipo-virtual">
          🔵 Virtual
        </span>
      )}
    </div>

  </div>
</div>
            ))
          )}

          <hr />

          <div className="horarios-disponibles mb-2 text-center gap-2">
            <h5>
            <FaClock className="me-3 text-white" />
            <span className="fw-bold text-white">
              Horarios disponibles
            </span>
            </h5>
          </div>

          <div className="d-flex flex-wrap gap-2">

{diaEstaBloqueado(diaSeleccionado) ? (
  <div className="alert alert-danger w-100 text-center mb-0">
    🔒 Agenda bloqueada
    <br />
    <strong>Motivo:</strong> {bloqueoDelDia?.motivo}
  </div>
) : (
  horariosDisponibles.map(h => (
    <button
      key={h}
      className="btn btn-horario"
      onClick={() => {
        setCitaEditar(null);
        setFechaSeleccionada(diaSeleccionado);
        setHoraPreseleccionada(h);
        setShowModal(true);
      }}
    >
      <FaClock className="me-1" />
      {h}
    </button>
  ))
)}

</div>

        </div>
      )}

      {/* MODAL cita y modal detalle*/}
      <ModalCita
  show={showModal}
 onHide={() => {
    setShowModal(false);
    setCitaEditar(null);
  }}
  onGuardar={guardarCita}
  citaEditar={citaEditar}
  fechaSeleccionada={fechaSeleccionada || diaSeleccionado}
  horariosDisponibles={horariosDisponibles}
  horaPreseleccionada={horaPreseleccionada}
  
   obtenerHorariosDisponibles={obtenerHorariosDisponibles}
/>

<ModalDetalle
  show={showDetalle}
  onHide={() => setShowDetalle(false)}
  cita={citaSeleccionada}
  onEditar={(cita) => {
    setCitaEditar(cita);
    setShowDetalle(false);
    setShowModal(true);
  }}
  onEliminar={async (cita) => {
  setShowDetalle(false);
  setCitaSeleccionada(null);

  await deleteDoc(doc(db, "citas", cita.id));
}}
/>

      {showModalNota && (
  <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">
            📝 Nota del día
          </h5>

          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModalNota(false)}
          />
        </div>

        <div className="modal-body">
          <label className="form-label fw-bold">
            Nota para {fechaFormateada}
          </label>

          <textarea
            className="form-control"
            rows="5"
            placeholder="Ej: llamar paciente, confirmar horario, traer estudios, agenda especial, etc."
            value={notaDia}
            onChange={(e) => setNotaDia(e.target.value)}
          />

          <small className="text-muted d-block mt-2">
            Si dejas la nota vacía y guardas, se elimina.
          </small>
        </div>

        <div className="modal-footer d-flex justify-content-between">
          <button
            className="btn btn-outline-danger"
            onClick={eliminarNotaDia}
            disabled={!notaDelDia}
          >
            Eliminar
          </button>

          <div>
            <button
              className="btn btn-secondary me-2"
              onClick={() => setShowModalNota(false)}
            >
              Cancelar
            </button>

            <button
              className="btn btn-info fw-bold"
              onClick={guardarNotaDia}
            >
              Guardar nota
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
)}

{showModalBloqueo && (
  <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">
            🔒  BLOQUEAR AGENDA
          </h5>

          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModalBloqueo(false)}
          />
        </div>

        <div className="modal-body">
          <label className="form-label fw-bold">
            Motivo del bloqueo:
          </label>

          <textarea
            className="form-control"
            rows="4"
            placeholder="Ej: vacaciones, congreso, trámite, licencia médica..."
            value={motivoBloqueo}
            onChange={(e) => setMotivoBloqueo(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowModalBloqueo(false)}
          >
            Cancelar
          </button>

          <button
            className="btn btn-danger"
            onClick={guardarBloqueoDia}
          >
            Bloquear
          </button>
        </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Citas;