import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import ModalCita from "../components/ModalCita";
import {
  FaPlus, 
  FaEdit,
  FaTrash,
  FaWhatsapp,
  FaCalendarAlt,
  FaVideo,
  FaStethoscope,
  FaUserClock,
  FaUsers,
  FaUser,
  FaClock
} from "react-icons/fa";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { query, where, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../firebase";

function Citas() {
  const calendarRef = useRef(null);
  const [citasDB, setCitasDB] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [mesActual, setMesActual] = useState(new Date());
  const [ahora, setAhora] = useState(new Date());
  const [fechaActual, setFechaActual] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [citaEditar, setCitaEditar] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [vistaActual, setVistaActual] = useState("dayGridMonth");
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  const [rangoHoras, setRangoHoras] = useState({
  min: "09:00:00",
  max: "19:00:00"
});

  // PARSE FECHA
  // =========================
  const parseFecha = (fecha) => {
    const [y, m, d] = fecha.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // =========================
  // HORARIOS (ARREGLADO 🔥)
  // =========================
  const generarHorarios = (inicio, fin) => {
    const horarios = [];
    let [h, m] = inicio.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {

      const horaFormateada =
        String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");

      horarios.push(horaFormateada);

      m += 30;
      if (m >= 60) {
        m = 0;
        h++;
      }
    }

    return horarios;
  };

  const obtenerRangoDia = (fecha) => {
  const [y, m, d] = fecha.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();

  if (day === 1 || day === 2 || day === 3) {
    return { min: "15:00:00", max: "18:00:00" };
  }

  if (day === 4) {
    return { min: "09:00:00", max: "13:30:00" };
  }

  if (day === 5 || day === 6) {
    return { min: "09:00:00", max: "18:00:00" };
  }

  return { min: "09:00:00", max: "18:00:00" };
};

  const obtenerHorariosDisponibles = async (fecha) => {

    const [y, m, d] = fecha.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();

    let horariosBase = [];

    if (day === 1 || day === 2|| day === 3) horariosBase = generarHorarios("15:00", "18:00");
    else if (day === 4) {
        horariosBase = [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "13:20"
        ];
      }
    else if (day === 5) horariosBase = generarHorarios("09:00", "18:00");
    else if (day === 6) horariosBase = generarHorarios("09:00", "18:00");
    else if (day === 0) return [];

    const q = query(collection(db, "citas"), where("fecha", "==", fecha));
    const snapshot = await getDocs(q);

    const ocupados = snapshot.docs.map(d => d.data().hora);

    return horariosBase.filter(h => !ocupados.includes(h));
  };

  // =========================
  // FIRESTORE
  // =========================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "citas"), (snapshot) => {

      const citas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCitasDB(citas);

      setEventos(
        citas.map(cita => ({
          id: cita.id,
          title: cita.nombre,
          start: `${cita.fecha}T${cita.hora}`,
          classNames: [`evento-${cita.tipo}`],
          extendedProps: cita
        }))
      );
    });

    return () => unsub();
  }, []);

  ///temporizador
useEffect(() => {
  const interval = setInterval(() => {
    setAhora(new Date());
  }, 60000);

  return () => clearInterval(interval);
}, []);


  // =========================
  // CREAR CITA
  // =========================
  const crearCita = async (fechaPreseleccionada = null) => {
    let fecha = fechaPreseleccionada;

    if (!fecha) {

      const result = await Swal.fire({
        title: "Fecha de cita",
        input: "date",
        showCancelButton: true
      });

      fecha = result.value;

      if (!fecha) return;
    }

    const horarios = await obtenerHorariosDisponibles(fecha);

    if (!horarios.length) {
      Swal.fire("Sin horarios", "No hay disponibilidad", "info");
      return;
    }

    const options = horarios.map(h =>
      `<option value="${h}">${h}</option>`
    ).join("");

    const { value: form } = await Swal.fire({
  title: "Nueva cita",
  html: `
    <input id="nombre" class="swal2-input" placeholder="Nombre">
    <input id="telefono" class="swal2-input" placeholder="Teléfono"> <br />
    <select id="hora" class="swal2-input">
      <option value="">Selecciona hora</option>
      ${options}
    </select>   <br />
    <select id="tipo" class="swal2-input">
      <option value="presencial">Presencial</option>
      <option value="virtual">Virtual</option>
    </select>
  `,
  focusConfirm: false,
  preConfirm: () => {
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const hora = document.getElementById("hora").value;
    const tipo = document.getElementById("tipo").value;

    if (!nombre || !hora || !tipo) {
      Swal.showValidationMessage("Completa los campos obligatorios");
      return false;
    }

    return { nombre, telefono, hora, tipo };
  }
});
    if (!form?.nombre || !form?.hora) return;

    await addDoc(collection(db, "citas"), {
      ...form,
      fecha,
      createdAt: new Date()
    });
  };

  // =========================
  // ELIMINAR
  // =========================
const handleEventClick = (info) => {

  setCitaSeleccionada({
    id: info.event.id,
    ...info.event.extendedProps
  });

  setShowDetalle(true);
};

  // =========================
  // DRAG
  // =========================
  const handleEventDrop = async (info) => {
    const fecha = info.event.startStr.split("T")[0];
    const hora = info.event.startStr.split("T")[1]?.substring(0,5);

    await updateDoc(doc(db, "citas", info.event.id), {
      fecha,
      hora
    });
  };

  const hoy = new Date().toISOString().split("T")[0];

const citasHoy = citasDB.filter(
  c => c.fecha === hoy
).length;

const pacientesHoy = citasDB
  .filter(c => c.fecha === hoy)
  .sort((a, b) => a.hora.localeCompare(b.hora));

  const proximoPaciente = pacientesHoy.find((cita) => {

  const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);

  return fechaHora >= ahora;
});

const pacientesRestantes = pacientesHoy.filter((cita) => {

  const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);

  return fechaHora >= ahora;

}).length;

const handleDatesSet = (arg) => {

  console.log("DATESSET:", arg.view.type);

  setVistaActual(arg.view.type);

  if (arg.view.type === "timeGridDay") {

    const fecha = arg.view.currentStart
      .toISOString()
      .split("T")[0];

    setFechaActual(fecha);

  } else {

    setFechaActual(null);

  }
};

const guardarCita = async (data) => {

  if (citaEditar) {

    await updateDoc(
      doc(db, "citas", citaEditar.id),
      data
    );

    setCitaEditar(null);

    return;
  }

  const q = query(
    collection(db, "citas"),
    where("fecha", "==", data.fecha),
    where("hora", "==", data.hora)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    alert("Ya existe una cita en esa fecha y hora");
    return;
  }

  await addDoc(collection(db, "citas"), {
    ...data,
    createdAt: new Date()
  });
};

  return (
    <div className="container py-4">

      <h3 className="subtitle-general text-center mb-4">
        <span className="subtitle-celeste">CALENDARIO DE</span>
        <span className="subtitle-negro"> CITAS</span>
      </h3>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
          <div className="stat-card h-100">
            <h6>
              <FaCalendarAlt className="me-2 celeste" />
              Hoy
            </h6>
            <h4>{citasHoy}</h4>
          </div>
        </div>

        <div className="col-6 col-md-4">
          <div className="stat-card h-100">
            <h6>
              <FaUserClock className="me-2 celeste" />
              Próximo paciente
            </h6>
            <h5>
              {proximoPaciente
                ? proximoPaciente.nombre
                : "Sin pacientes"}
            </h5>

            <small>
              {proximoPaciente?.hora || ""}
            </small>
          </div>
        </div>

        <div className="col-6 col-md-4">
          <div className="stat-card h-100">
            <h6>
              <FaUsers className="me-2 celeste" />
              Pacientes restantes
            </h6>
            <h4>{pacientesRestantes}</h4>
          </div>
        </div>

      </div>

<div className="card shadow-sm mb-4">
  <div className="card-header text-white fw-bold">
   PACIENTES DE HOY
  </div>

  <div className="card-body p-0">

    {pacientesHoy.length === 0 ? (
      <div className="p-3 text-center">
        No hay citas programadas para hoy
      </div>
    ) : (

      <div className="table-responsive">
        <table className="table table-hover mb-0">

          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Teléfono</th>
              <th>Tipo</th>
            </tr>
          </thead>

          <tbody>
            {pacientesHoy.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.hora}</td>
                <td>{cita.nombre}</td>
                <td>
                  {cita.telefono ? (
                    <a
                      href={`https://wa.me/${cita.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-success text-decoration-none fw-semibold"
                    >
                      <FaWhatsapp className="me-1" />
                      {cita.telefono}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {cita.tipo === "virtual"
                    ? "🔵 Virtual"
                    : "🟢 Presencial"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    )}

  </div>
</div>

<ModalCita
  show={showModal}
  onHide={() => setShowModal(false)}
  onGuardar={guardarCita}
  citaEditar={citaEditar}
  fechaSeleccionada={fechaSeleccionada}
  horariosDisponibles={horariosDisponibles}
  obtenerHorariosDisponibles={obtenerHorariosDisponibles}
/>

<Modal
  show={showDetalle}
  onHide={() => setShowDetalle(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>
      <FaCalendarAlt className="me-2 celeste" />
      <span className="celeste fw-bold">DETALLE DE CITA</span>
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>

    <div className="mb-3">
  <FaUser className="celeste me-2" />
  <strong className="celeste"> | Paciente:</strong>{" "}
  {citaSeleccionada?.nombre}
</div>

<div className="mb-3">
  <FaWhatsapp className="celeste me-2" />
  <strong className="celeste"> | Teléfono:</strong>{" "}

  {citaSeleccionada?.telefono ? (
    <a
      href={`https://wa.me/${citaSeleccionada.telefono.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-success text-decoration-none fw-semibold"
    >
      {citaSeleccionada.telefono} 📲 Enviar mensaje por WhatsApp 
    </a>
  ) : (
    "-"
  )}
</div>

<div className="mb-3">
  <FaCalendarAlt className="celeste me-2" />
  <strong className="celeste"> | Fecha:</strong>{" "}
  {citaSeleccionada?.fecha}
</div>

<div className="mb-3">
  <FaClock className="celeste me-2" />
  <strong className="celeste"> | Hora:</strong>{" "}
  {citaSeleccionada?.hora}
</div>

<div>
  <FaStethoscope className="celeste  me-2" />
  <strong className="celeste"> | Tipo:</strong>{" "}
  {citaSeleccionada?.tipo === "virtual"
    ? "🔵 Virtual"
    : "🟢 Presencial"}
</div>

  </Modal.Body>

  <Modal.Footer>
    <Button
      variant="danger"
      onClick={async () => {

        await deleteDoc(
          doc(db, "citas", citaSeleccionada.id)
        );

        setShowDetalle(false);
      }}
    >
      <FaTrash className="me-2" />
      Eliminar
    </Button>

    <Button
        onClick={() => {
        setCitaEditar(citaSeleccionada);
        setShowDetalle(false);
        setShowModal(true);
      }}
    >
      <FaEdit className="me-2 btn-cita" />
      Editar
    </Button>
  </Modal.Footer>

</Modal>


      <div className="text-end mb-3">
        <button
          className="btn btn-cita text-white fw-bold"
          onClick={async () => {
          if (fechaSeleccionada) {
            const horarios = await obtenerHorariosDisponibles(fechaSeleccionada);
            setHorariosDisponibles(horarios);
            setCitaEditar(null);
            setShowModal(true);
          } else {
            setHorariosDisponibles([]);
            setShowModal(true);
          }
        }}
        >
          <FaPlus />
        </button>
      </div>    

      <div className="card p-3 shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          nowIndicator={true}
          initialView="dayGridMonth"
          showNonCurrentDates={false}
          fixedWeekCount={false}
          locale={esLocale} 
          events={eventos}
          editable
          height="auto"
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          datesSet={handleDatesSet}
          dateClick={(info) => {
  const fecha = info.dateStr;

  const rango = obtenerRangoDia(fecha);
  setRangoHoras(rango);
  setFechaSeleccionada(fecha);

  setTimeout(() => {
    const calendarApi = info.view.calendar;
    calendarApi.gotoDate(fecha);
    calendarApi.changeView("timeGridDay");
  }, 0);
}}
            headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
                    
            // 🔥 QUITAR ALL DAY
            allDaySlot={false}

            // 🔥 EMPEZAR DESDE LAS 08:00
           slotMinTime="08:00:00"
slotMaxTime="20:00:00"

            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            }}

            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            }}
          />
      </div>
    </div>
  );
}

export default Citas;