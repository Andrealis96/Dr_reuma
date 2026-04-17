import { useState, useEffect } from "react";
import { useRef } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ServiceCard from "./ServiceCard";
import { FaCalendarCheck, FaCalendarAlt, FaSave } from "react-icons/fa";
import { FaMoneyBillWave, FaExclamationCircle, FaExclamationTriangle  } from "react-icons/fa";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

function Services() {

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "virtual",
    fecha: "",
    hora: ""
  });

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [success, setSuccess] = useState(false);
  const [citaGuardada, setCitaGuardada] = useState(null);
  const FRIDAY_START = new Date("2026-04-10T00:00:00");
  const phoneNumber = "5492994666559";

  const horariosBase = ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
  const whatsappRef = useRef(null);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const esViernesActivo = (fechaObj) => {
  const MS_DIA = 1000 * 60 * 60 * 24;

  // 🔥 fecha base: viernes 10 abril 2026 (NO atención)
  const base = new Date(2026, 3, 10);

  const actual = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );

  const diffDias = Math.round((actual - base) / MS_DIA);

  const semana = Math.floor(diffDias / 7);

  const ciclo = ((semana % 3) + 3) % 3; // 🔥 ciclo de 3

  // patrón: [0 ❌, 1 ✅, 2 ✅]
  return ciclo === 1 || ciclo === 2;
};
  // 🔥 Cargar horarios disponibles
useEffect(() => {
  if (!form.fecha) return;

  const cargarHorarios = async () => {
    const fechaObj = new Date(form.fecha + "T00:00:00");

    const diaSemana = fechaObj
      .toLocaleDateString("es-AR", { weekday: "long" })
      .toLowerCase();

    const generarHorarios = (inicio, fin) => {
      const horarios = [];
      for (let h = inicio; h <= fin; h++) {
        horarios.push(`${h}:00`);
        horarios.push(`${h}:30`);
      }
      return horarios;
    };

    const getWeekNumber = (date) => {
      const firstJan = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + firstJan.getDay() + 1) / 7);
    };

    const week = getWeekNumber(fechaObj);

    // 🔥 patrón viernes: [no, si, si, no]
    const viernesActivo = (() => {
      const pattern = week % 4;
      return pattern === 1 || pattern === 2; // semanas 2 y 3
    })();

    let horariosBase = [];

    // ❌ MIÉRCOLES
    if (diaSemana === "miércoles") {
      setHorariosDisponibles([]);
      return;
    }

    // 🟢 LUNES Y MARTES
    if (diaSemana === "lunes" || diaSemana === "martes") {
      horariosBase = [
        "15:00", "15:30",
        "16:00", "16:30",
        "17:00", "17:30",
        "18:00"
      ];
    }

    // 🟡 JUEVES
    else if (diaSemana === "jueves") {
      horariosBase = generarHorarios(9, 12);
    }

    // 🔴 VIERNES (ciclo 4 semanas)
    else if (diaSemana === "viernes") {
  if (!esViernesActivo(fechaObj)) {
    setHorariosDisponibles([]);
    return;
  }

  horariosBase = generarHorarios(15, 18);
}

    // 🔵 SÁBADO (solo virtual)
    else if (diaSemana === "sábado") {
      horariosBase = generarHorarios(8, 18);
    }

    // ❌ DOMINGO
    else if (diaSemana === "domingo") {
      setHorariosDisponibles([]);
      return;
    }

    // 🔥 traer ocupados
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

  // 🔥 GUARDAR CITA
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.hora) {
      alert("Selecciona un horario");
      return;
    }

    try {
      await addDoc(collection(db, "citas"), {
        ...form,
        estado: "confirmada",
        createdAt: new Date()
      });

      // ✅ guardar datos
      setCitaGuardada(form);

      // ✅ notificación
      toast.success("✅ Cita agendada correctamente");

      // ✅ mostrar botón WhatsApp
      setSuccess(true);
      // 👇 SCROLL automático
      setTimeout(() => {
  if (whatsappRef.current) {
    const yOffset = -80; // ajusta si quieres más arriba
    const y =
      whatsappRef.current.getBoundingClientRect().top +
      window.pageYOffset +
      yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth"
    });
  }
}, 600); // ⬅️ más tiempo para móvil

      // ✅ limpiar form
      setForm({
        nombre: "",
        email: "",
        telefono: "",
        tipo: "virtual",
        fecha: "",
        hora: ""
      });

      
      
      setHorariosDisponibles([]);

    } catch (error) {
      console.error(error);
      alert("Error al guardar la cita");
    }
  };

  // 📲 Link dinámico WhatsApp
  const whatsappLink = citaGuardada
    ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        `Hola Dr. Reuma, agendé una cita.

- Nombre: ${citaGuardada.nombre}
- Fecha: ${citaGuardada.fecha}
- Hora: ${citaGuardada.hora}
- Tipo: ${citaGuardada.tipo}

¡Gracias!`
      )}`
    : "#";

  return (
    <section id="servicios" className="services-section">
      <div className="container py-5">

        <h3 className="subtitle-general mb-5">
          <span className="subtitle-celeste">¿QUE SERVICIOS</span>
          <span className="subtitle-negro"> OFRECEMOS? </span>
        </h3>

        {/* CARDS */}
        <div className="row g-4 mb-5">

          <div className="col-12 col-md-6">
            <ServiceCard 
            title="Receta médica" 
            message="Hola Dr. Reuma, vengo desde la página web. Quisiera solicitar una receta médica."
            description="Emisión y renovación de recetas médicas." />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard 
            title="Aptitud física" 
            message="Hola Dr. Reuma, vengo desde la página web. Quisiera consultar por un certificado de aptitud física."
            description="Emisión y renovación de recetas médicas." />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard 
            title="Charlas y educación" 
            message="Hola Dr. Reuma, vengo desde la página web. Quisiera información sobre charlas y educación."
            description="Charlas sobre salud reumatológica." />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard 
            title="Consulta presencial" 
            description="Ubicación: San Martín 1355 (Consultorios Externos - Clínica San Agusntín.)" 
            mapLink="https://maps.app.goo.gl/u5aRXf6BsRKKMhYf7"
            showButton={false} />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard title="Consulta por videollamada" description="Atención médica online." showButton={false} />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard title="Consulta a domicilio" description="Próximamente..... !!!" disabled badge="NO DISPONIBLE" />
          </div>

        </div>

        {/* FORMULARIO */}
        <div className="card card-general p-4 shadow-sm">
          <div className="mb-4 text-center">
            <FaCalendarCheck size={30} />
            <h4 className="mb-3 fw-bold">AGENDA TU CITA</h4>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              <div className="col-md-6">
                <input type="text" name="nombre" placeholder="Nombre completo" className="form-control" required value={form.nombre} onChange={handleChange}/>
              </div>

              <div className="col-md-6">
                <input type="email" name="email" placeholder="Correo electrónico" className="form-control" required value={form.email} onChange={handleChange}/>
              </div>

              <div className="col-md-6">
                <input type="text" name="telefono" placeholder="Teléfono" className="form-control" required value={form.telefono} onChange={handleChange}/>
              </div>

              <div className="col-md-6">
                <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    📅 Fecha de la cita
                  </label>

                  <input
                    type="date"
                    name="fecha"
                    className="form-control"
                    required
                    value={form.fecha}
                    onChange={handleChange}
                  />

                  <small className="text-muted">
                    Selecciona una fecha disponible
                  </small>
                </div>

              <div className="col-md-6">
                <select name="hora" className="form-select" required value={form.hora} onChange={handleChange}>
                  <option value="">Selecciona una hora</option>
                  {horariosDisponibles.length > 0 ? (
                    horariosDisponibles.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))
                  ) : (
                    <option disabled>
                      {form.fecha ? "No hay horarios disponibles 😢" : "Primero selecciona una fecha"}
                    </option>
                  )}
                </select>
              </div>

            </div>

            <div className="d-flex justify-content-center">
              <button className="btn btn-dark fw-bold mt-4">
                <FaSave size={20}/> Guardar Cita
              </button>
            </div>

            <div className="info-card mt-4">

  <p className="info-title">📌 Información importante</p>
    <div className="info-item warning">
    <FaExclamationTriangle />
    <span>Después de agendar la cita, presiona el botón de WhatsApp para notificar al médico.</span>
  </div>

  <div className="info-item success">
    <FaMoneyBillWave />
    <span>El pago se realizará al finalizar la consulta médica.</span>
  </div>

  <div className="info-item danger">
    <FaExclamationCircle />
    <span>
      En caso de inconvenientes o cancelación, comunícate con el médico para reprogramar la cita.
    </span>
  </div>

  <div className="info-item primary">
    <FaCalendarAlt />
    <span>
      Para citas los viernes o fines de semana, comunícate directamente con el médico.
    </span>
  </div>

</div>
          </form>

          {/* ✅ BOTÓN WHATSAPP */}
          {success && (
  <div ref={whatsappRef}>
  {success && (
    <div className="text-center mt-4">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp"
        onClick={() => setSuccess(false)}
      >
        Enviar al doctor por WhatsApp
      </a>
    </div>
  )}
</div>
)}

        </div>
      </div>
    </section>
  );
}

export default Services;