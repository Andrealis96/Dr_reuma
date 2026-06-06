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
  FaIdCard,
  FaUser,
  FaUsers,
  FaClock, 
  FaVideo
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

  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaPreseleccionada, setHoraPreseleccionada] = useState(null);

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const detalleDiaRef = useRef(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

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
  const cargar = async () => {
    if (!diaSeleccionado) return;

    const horarios = await obtenerHorariosDisponibles(diaSeleccionado);
    setHorariosDisponibles(horarios);
  };

  cargar();
}, [diaSeleccionado]);
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

  const obtenerHorariosDisponibles = async (fecha) => {
    const [y, m, d] = fecha.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();

    let base = [];

    if (day === 1 || day === 2 || day === 3)
      base = generarHorarios("15:00", "18:00");
    else if (day === 4)
      base = ["09:30","13:20"];
    else if (day === 5)
      base = generarHorarios("09:30", "17:00");
    else if (day === 6)
      base = generarHorarios("10:00", "12:30");
    else return [];

    const q = query(collection(db, "citas"), where("fecha", "==", fecha));
    const snap = await getDocs(q);

    const ocupados = snap.docs.map(d => d.data().hora);

    return base.filter(h => !ocupados.includes(h));
  };

 useEffect(() => {
  if (diaSeleccionado && detalleDiaRef.current) {
    window.scrollTo({
      top: detalleDiaRef.current.offsetTop - 80,
      behavior: "smooth"
    });
  }
}, [diaSeleccionado]);

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
    if (citaEditar) {
      await updateDoc(doc(db, "citas", citaEditar.id), data);
      setCitaEditar(null);
      return;
    }

    await addDoc(collection(db, "citas"), {
      ...data,
      createdAt: new Date()
    });
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

        <div className="col-6 col-md-4">
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
          }}
          eventClick={(info) => {
            setDiaSeleccionado(
              info.event.startStr.split("T")[0]
            );
          }}
        />
      </div>

      {/* BLOQUE DÍA SELECCIONADO */}
      {diaSeleccionado && (
        <div
            ref={detalleDiaRef}
            className="card mt-3 p-3"
          >

           <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold celeste mb-0">
              <FaCalendarAlt className="me-2" />
              {fechaFormateada}
            </h5>

            <div>
              <button
                className="btn btn-citadias -sm me-2"
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

          {pacientesDelDia.length === 0 ? (
            <p>No hay pacientes</p>
          ) : (
            pacientesDelDia.map(c => (
              <div
                key={c.id}
                className="btn-pacientecita  p-2 mb-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setCitaSeleccionada(c);
                  setShowDetalle(true);
                }}
              >
                <strong>{c.hora}</strong> 
                <span
                  className="fw-semibold text-black"
                >
                  {c.tipo === "presencial" ? " | 🟢  " : " | 🔵  "}
                  {capitalizarNombre(c.nombre)}
                </span>
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
            {horariosDisponibles.map(h => (
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
            ))}
          </div>

        </div>
      )}

      {/* MODAL cita y modal detalle*/}
      <ModalCita
  show={showModal}
  onHide={() => setShowModal(false)}
  onGuardar={guardarCita}
  citaEditar={citaEditar}
  fechaSeleccionada={fechaSeleccionada || diaSeleccionado}
  horariosDisponibles={horariosDisponibles}
  horaPreseleccionada={horaPreseleccionada}
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
    await deleteDoc(doc(db, "citas", cita.id));
    setShowDetalle(false);
  }}
/>

    </div>
  );
}

export default Citas;