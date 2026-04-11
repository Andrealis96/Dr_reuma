import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ServiceCard from "./ServiceCard";
import { FaCalendarCheck, FaCalendarAlt } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // 
import { FaMoneyBillWave, FaExclamationCircle } from "react-icons/fa";
import { toast } from "react-toastify";
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
  
  const phoneNumber = "5491128524979";
  
  const horariosBase = ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
  const [citaGuardada, setCitaGuardada] = useState(null);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate(); // 🔥
  // 🔥 Cargar horarios disponibles
  useEffect(() => {
    if (!form.fecha) return;

    const cargarHorarios = async () => {

  const [year, month, dayNum] = form.fecha.split("-");
  const day = new Date(year, month - 1, dayNum).getDay();

  // ❌ bloquear viernes, sábado, domingo
  if (day === 5 || day === 6 || day === 0) {
    setHorariosDisponibles([]);
    return;
  }

  const q = query(
    collection(db, "citas"),
    where("fecha", "==", form.fecha)
  );

  const snapshot = await getDocs(q);

  const ocupados = snapshot.docs.map(doc => doc.data().hora);

  // 🔥 solo horarios válidos + libres
  const disponibles = horariosBase.filter(
    h => !ocupados.includes(h)
  );

  setHorariosDisponibles(disponibles);
};

    cargarHorarios();
  }, [form.fecha]);


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

// 🔥 guardamos los datos antes de limpiar
setCitaGuardada(form);

toast.success("✅ Cita agendada correctamente");

const mensaje = `Hola Dr. Reuma, agendé una cita.

- Nombre: ${form.nombre}
- Fecha: ${form.fecha}
- Hora: ${form.hora}
- Tipo: ${form.tipo}

¡Gracias !`;

const link = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensaje)}`;

window.location.href = link;
// limpiar form
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

  // 📲 WhatsApp con datos dinámicos
  const whatsappLink = citaGuardada
  ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      `Hola Dr. Reuma, agendé una cita.

👤 Nombre: ${citaGuardada.nombre}
📅 Fecha: ${citaGuardada.fecha}
⏰ Hora: ${citaGuardada.hora}
💻 Tipo: ${citaGuardada.tipo}

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
            <ServiceCard title="Receta médica" description="Emisión y renovación de recetas médicas." />
          </div>

            <div className="col-12 col-md-6">
            <ServiceCard title="Aptitud física" description="Emisión y renovación de recetas médicas." />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard title="Charlas y educación" description="Charlas sobre salud reumatológica." />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard title="Consulta presencial" description="Ubicación: Clínica San Agusntín." showButton={false} />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard title="Consulta por videollamada" description="Atención médica online."  showButton={false} />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard title="Consulta a domicilio" description="Próximamente..... !!!" disabled badge="NO DISPONIBLE" />
          </div>

          

        </div>

        {/* FORMULARIO */}
        <div className="card card-general p-4 shadow-sm">
          <div className="mb-4 text-center">
           <FaCalendarCheck size={30} color="#000000"/>
            <h4 className="mb-3 text-center fw-bold"> AGENDA TU CITA </h4>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              <div className="col-md-6">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  className="form-control"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  className="form-control"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <input
                  type="text"
                  name="telefono"
                  placeholder="Teléfono"
                  className="form-control"
                  required
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <select
                  name="tipo"
                  className="form-select"
                  value={form.tipo}
                  onChange={handleChange}
                >
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              <div className="col-md-6">
                <input
                  type="date"
                  name="fecha"
                  className="form-control"
                  required
                  value={form.fecha}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <select
                  name="hora"
                  className="form-select"
                  required
                  value={form.hora}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una hora</option>

                  {horariosDisponibles.length > 0 ? (
                    horariosDisponibles.map((h, i) => (
                      <option key={i} value={h}>
                        {h}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      {form.fecha
                        ? "No hay horarios disponibles 😢"
                        : "Primero selecciona una fecha"}
                    </option>
                  )}
                </select>
              </div>

            </div>
            <div className="d-flex justify-content-center">
                   <button className="btn btn-dark fw-bold mt-4 gap-5">
                  <FaSave size={25} />
                  <span> Guardar Cita</span> 
                  </button>
                  {/* 📝 NOTA */}
                  <div className="mt-4 p-3 align-items-start border rounded bg-light rounded small">

                  <div className="d-flex gap-3 mb-2">
                    <FaMoneyBillWave size={20} className="mt-1 text-success" />
                    <span className="fw-semibold text-success">
                      El pago se realizará al finalizar la consulta médica.
                    </span>
                  </div>

                  <div className="d-flex gap-3 mb-2">
                    <FaExclamationCircle size={20} className="mt-1 text-danger" />
                    <span className="fw-semibold text-danger">
                      En caso de inconvenientes o cancelación, comunícate con el médico para reprogramar la cita.
                    </span>
                  </div>
                  <div className="d-flex gap-3 mb-2">
                    <FaCalendarAlt size={20} className="mt-1 text-primary" />
                    <span className="fw-semibold text-primary">
                     Para citas los viernes o fines de semana, comunícate directamente con el médico.
                    </span>
                  </div>

                </div>
            </div>
          </form>

          {/* SUCCESS */}
          {success && (
  <div className="alert alert-success mt-4 text-center">
    <p className="mb-3 fw-bold">
      ✅ Tu cita ha sido agendada correctamente
    </p>

    <div className="d-flex justify-content-center gap-2">

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-success"
        onClick={() => setSuccess(false)} // 🔥 se cierra al hacer click
      >
        Ir a WhatsApp
      </a>

      <button
        className="btn btn-outline-secondary"
        onClick={() => setSuccess(true)} // 🔥 cerrar manual
      >
        Cerrar
      </button>

    </div>
  </div>
)}
        </div>

      </div>
    </section>
  );
}

export default Services;