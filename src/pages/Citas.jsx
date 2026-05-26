import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

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

  const [citasDB, setCitasDB] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [mesActual, setMesActual] = useState(new Date());
  // =========================
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

  const obtenerHorariosDisponibles = async (fecha) => {

    const [y, m, d] = fecha.split("-").map(Number);
    const day = new Date(y, m - 1, d).getDay();

    let horariosBase = [];

    if (day === 1 || day === 2|| day === 3) horariosBase = generarHorarios("15:00", "18:00");
    else if (day === 4) horariosBase = generarHorarios("09:00", "12:00");
    else if (day === 5) horariosBase = generarHorarios("09:00", "18:00");
    else if (day === 6) horariosBase = generarHorarios("08:00", "18:00");
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

  // =========================
  // CREAR CITA
  // =========================
  const crearCita = async () => {

    const { value: fecha } = await Swal.fire({
      title: "Selecciona fecha",
      input: "date",
      showCancelButton: true
    });

    if (!fecha) return;

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
    <input id="telefono" class="swal2-input" placeholder="Teléfono">

    <select id="hora" class="swal2-input">
      <option value="">Selecciona hora</option>
      ${options}
    </select>

    <select id="tipo" class="swal2-input">
      <option value="">Tipo de cita</option>
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
  const handleEventClick = async (info) => {

    const cita = info.event;

    const result = await Swal.fire({
      title: cita.title,
      html: `
        <p><b>Nombre:</b> ${cita.extendedProps.nombre}</p>
        <p><b>Teléfono:</b> ${cita.extendedProps.telefono || "-"}</p>
        <p><b>Fecha:</b> ${cita.startStr.split("T")[0]}</p>
        <p><b>Hora:</b> ${cita.startStr.split("T")[1]?.substring(0,5)}</p>
        <p><b>Tipo:</b> ${cita.extendedProps.tipo}</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "#dc3545"
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "citas", cita.id));
    }
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

  const handleDatesSet = (arg) => {
    setMesActual(new Date(arg.start));
  };

  return (
    <div className="container py-4">

      <h3 className="subtitle-general text-center mb-4">
        <span className="subtitle-celeste">CALENDARIO DE</span>
        <span className="subtitle-negro"> CITAS</span>
      </h3>

      <div className="text-end mb-3">
        <button className="btn btn-info fw-bold" onClick={crearCita}>
          + Nueva cita
        </button>
      </div>

      <div className="card p-3 shadow-sm">
        <FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  locale={esLocale} 
  events={eventos}
  editable
  height="auto"
  eventClick={handleEventClick}
  eventDrop={handleEventDrop}
  datesSet={handleDatesSet}

  headerToolbar={{
    left: "prev,next",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay"
  }}

  // 🔥 QUITAR ALL DAY
  allDaySlot={false}

  // 🔥 EMPEZAR DESDE LAS 08:00
  slotMinTime="08:00:00"

  // (opcional recomendado)
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