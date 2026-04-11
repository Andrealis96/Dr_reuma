import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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

  const [eventos, setEventos] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    fecha: "",
    hora: "",
    tipo: "presencial"
  });

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // 🔥 GENERADOR DE HORARIOS
  const generarHorarios = (inicio, fin) => {
    const horarios = [];
    let [h, m] = inicio.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {
      const hora = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      horarios.push(hora);

      m += 30;
      if (m >= 60) {
        m = 0;
        h++;
      }
    }

    return horarios;
  };

  // 🔄 Cargar citas calendario
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "citas"), (snapshot) => {
    const data = snapshot.docs.map((docu) => {
  const cita = docu.data();

  const [year, month, dayNum] = cita.fecha.split("-");
  const day = new Date(year, month - 1, dayNum).getDay();

  let color = "#198754"; // default verde

  if (cita.tipo === "virtual") {
    color = "#0d6efd"; // azul
  }

  // 😎 fin de semana
  if (day === 5 || day === 6 || day === 0) {
    color = "#6f42c1"; // morado
  }

  return {
  id: docu.id,
  title: cita.nombre,
  start: `${cita.fecha}T${cita.hora}`,
  backgroundColor: color,
  borderColor: "#00000020",
  textColor: "#fff",
  extendedProps: {
    tipo: cita.tipo
  }
};
});

      setEventos(data);
    });

    return () => unsub();
  }, []);

  // 🔥 CARGAR HORARIOS DISPONIBLES
  useEffect(() => {
    if (!form.fecha) return;

    const cargarHorarios = async () => {

      const [year, month, dayNum] = form.fecha.split("-");
      const day = new Date(year, month - 1, dayNum).getDay();

      let horariosBase = [];

      // 🧠 lunes(1) a jueves(4)
      if (day >= 1 && day <= 4) {
        horariosBase = generarHorarios("15:00", "18:00");
      } 
      // 😎 viernes(5) a domingo(0)
      else {
        horariosBase = generarHorarios("08:00", "18:00");
      }

      const q = query(
        collection(db, "citas"),
        where("fecha", "==", form.fecha)
      );

      const snapshot = await getDocs(q);

      const ocupados = snapshot.docs.map(doc => doc.data().hora);

      const disponibles = horariosBase.filter(h => !ocupados.includes(h));

      setHorariosDisponibles(disponibles);
    };

    cargarHorarios();

  }, [form.fecha]);

  // ➕ CREAR CITA
  const handleCrear = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.fecha || !form.hora) {
      alert("Completa todos los campos");
      return;
    }

    // 🔥 VALIDAR DISPONIBILIDAD
    if (!horariosDisponibles.includes(form.hora)) {
      alert("Ese horario no está disponible");
      return;
    }

    try {
      await addDoc(collection(db, "citas"), {
        ...form,
        createdAt: new Date()
      });

      setForm({
        nombre: "",
        fecha: "",
        hora: "",
        tipo: "presencial"
      });

    } catch (error) {
      console.error(error);
      alert("Error al crear cita");
    }
  };

  // ✏️ EDITAR / ELIMINAR
const handleEventClick = async (info) => {

  const cita = info.event;

  const result = await Swal.fire({
    title: cita.title,
    html: `
      <p><b>Fecha:</b> ${cita.startStr.split("T")[0]}</p>
      <p><b>Hora:</b> ${cita.startStr.split("T")[1]?.substring(0,5)}</p>
      <p><b>Tipo:</b> ${cita.extendedProps.tipo}</p>
    `,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cerrar",
    confirmButtonColor: "#dc3545"
  });

  if (result.isConfirmed) {
    const confirmDelete = await Swal.fire({
      title: "¿Seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar"
    });

    if (confirmDelete.isConfirmed) {
      await deleteDoc(doc(db, "citas", cita.id));
    }
  }
};

  // 🔄 DRAG & DROP CON VALIDACIÓN
  const handleEventDrop = async (info) => {

    const fecha = info.event.startStr.split("T")[0];
    const hora = info.event.startStr.split("T")[1]?.substring(0,5);

    const q = query(
      collection(db, "citas"),
      where("fecha", "==", fecha),
      where("hora", "==", hora)
    );

    const snapshot = await getDocs(q);

    const ocupado = snapshot.docs.some(doc => doc.id !== info.event.id);

    if (ocupado) {
      alert("Ese horario ya está ocupado");
      info.revert();
      return;
    }

    await updateDoc(doc(db, "citas", info.event.id), {
      fecha,
      hora
    });
  };

  return (
    <div className="container py-4">

      <h2 className="subtitle-general mb-4 text-center">
        <span className="subtitle-celeste"> GESTIÓN DE </span>
        <span className="subtitle-negro"> CITAS</span>
    </h2>

      {/* FORM */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5 className="mb-3 fw-bold">NUEVA CITA</h5>

        <form onSubmit={handleCrear}>
          <div className="row g-2">

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
              >
                <option value="">Selecciona hora</option>

                {horariosDisponibles.length > 0 ? (
                  horariosDisponibles.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))
                ) : (
                  <option disabled>No hay horarios disponibles</option>
                )}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div className="col-md-1 d-grid">
              <button className="btn btn-dark">
                ✔
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* CALENDARIO */}
      <div className="card p-3 shadow-sm">

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="es"
          events={eventos}
          height="auto"
          editable={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día"
          }}
          allDaySlot={false}
          dateClick={(info) => {
                info.view.calendar.changeView("timeGridDay", info.dateStr);
                }}
        />

      </div>

    </div>
  );
}

export default Citas;