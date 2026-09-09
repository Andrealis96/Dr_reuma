import { useState, useEffect } from "react";
import { useRef } from "react";
import { collection, addDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import ServiceCard from "./ServiceCard";
import { FaMapMarkerAlt , FaMoneyBillWave, FaExclamationCircle, FaExclamationTriangle  } from "react-icons/fa";
import DrReumaLogo from "../assets/DrReumaLogo.png";
import ReactCountryFlag from "react-country-flag";
import html2canvas from "html2canvas";
import {
  FaWhatsapp,
  FaVideo,
  FaClinicMedical,
  FaPrescriptionBottleAlt,
  FaDumbbell,
  FaHome,
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaCheckCircle,
  FaCalendarAlt,
  FaSave, 
  FaImage,
  FaClock,
  FaUserMd,
FaUser,
FaPhoneAlt,
FaIdCard,
FaBirthdayCake,
FaVenusMars,
FaShieldAlt,
FaNotesMedical
} from "react-icons/fa";
function Services() {

const [form, setForm] = useState({
  nombre: "",
  telefono: "",
  Dni: "",

  fechaNacimiento: "",
  sexo: "",
  obraSocial: "",
  motivoConsulta: "",

  tipo: "presencial",
  fecha: "",
  hora: ""
});

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [bloqueosHora, setBloqueosHora] = useState([]);
  const [success, setSuccess] = useState(false);
  const [citaGuardada, setCitaGuardada] = useState(null);
  const FRIDAY_START = new Date("2026-04-10T00:00:00");
  const phoneNumber = "5492995095471"; // Número de WhatsApp del Dr. Reuma

  const horariosBase = ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
  const whatsappRef = useRef(null);
  const comprobantePacienteRef = useRef(null);

const [mostrarCitaAgendada, setMostrarCitaAgendada] = useState(false);
const [generandoComprobante, setGenerandoComprobante] = useState(false);
const [guardandoCita, setGuardandoCita] = useState(false);
const [previewComprobanteUrl, setPreviewComprobanteUrl] = useState(null);
const [previewComprobanteFile, setPreviewComprobanteFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const [viernesAgenda, setViernesAgenda] = useState([]);
const codigoTurno =
  `https://drreuma.com/verificacion?paciente=${encodeURIComponent(citaGuardada?.nombre || "")}&fecha=${encodeURIComponent(citaGuardada?.fecha || "")}&hora=${encodeURIComponent(citaGuardada?.hora || "")}`;


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

useEffect(() => {
  const unsub = onSnapshot(collection(db, "bloqueosHora"), (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    setBloqueosHora(data);
  });

  return () => unsub();
}, []);

const getConfiguracionViernes = (fecha) => {
  return viernesAgenda.find(v => v.fecha === fecha);
};

const diaEstaBloqueado = (fecha) => {
  return bloqueos.some(b => b.fecha === fecha && b.activo);
};

const normalizarHora = (hora = "") => {
  return hora.toString().trim().slice(0, 5);
};

const limpiarDniPaciente = (valor = "") => {
  return valor.toString().replace(/\D/g, "").trim();
};

const limpiarTelefono10 = (telefono = "") => {
  let numero = telefono.toString().replace(/\D/g, "");

  if (!numero) return "";

  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }

  if (numero.startsWith("549") && numero.length >= 13) {
    numero = numero.slice(3);
  }

  if (numero.startsWith("54") && numero.length >= 12) {
    numero = numero.slice(2);
  }

  if (numero.startsWith("9") && numero.length === 11) {
    numero = numero.slice(1);
  }

  if (numero.startsWith("0") && numero.length === 11) {
    numero = numero.slice(1);
  }

  if (numero.length > 10) {
    numero = numero.slice(-10);
  }

  return numero;
};

const buscarOCrearHistoriaDesdeServices = async (dataCita = {}) => {
  const dniLimpio = limpiarDniPaciente(
    dataCita.Dni ||
    dataCita.dni ||
    dataCita.DNI ||
    ""
  );

  if (!dniLimpio) {
    return "";
  }

  const qHistoriasDni = query(
    collection(db, "historiasClinicas"),
    where("dni", "==", dniLimpio)
  );

  const snapHistoriasDni = await getDocs(qHistoriasDni);

  if (!snapHistoriasDni.empty) {
    return snapHistoriasDni.docs[0].id;
  }

  const qHistoriasDniMayus = query(
    collection(db, "historiasClinicas"),
    where("Dni", "==", dniLimpio)
  );

  const snapHistoriasDniMayus = await getDocs(qHistoriasDniMayus);

  if (!snapHistoriasDniMayus.empty) {
    return snapHistoriasDniMayus.docs[0].id;
  }

  const nuevaHistoria = await addDoc(collection(db, "historiasClinicas"), {
    nombre: dataCita.nombre?.trim() || "",
    dni: dniLimpio,
    Dni: dniLimpio,
    telefono: limpiarTelefono10(dataCita.telefono || ""),
    fechaNacimiento: dataCita.fechaNacimiento || "",
    obraSocial: dataCita.obraSocial?.trim() || "",
    sexo: dataCita.sexo || "",

    cantidadConsultas: 0,
    diagnosticosResumen: [],
    ultimaConsultaTexto: "",
    ultimaConsultaAtMillis: 0,

    origen: "web",
    creado: new Date()
  });

  return nuevaHistoria.id;
};

const horaEstaBloqueada = (fecha, hora) => {
  return bloqueosHora.some(
    (b) =>
      b.fecha === fecha &&
      normalizarHora(b.hora) === normalizarHora(hora) &&
      b.activo
  );
};

  // 🔥 Cargar horarios disponibles
useEffect(() => {
  if (!form.fecha) return;

  const cargarHorarios = async () => {
    if (diaEstaBloqueado(form.fecha)) {
  setHorariosDisponibles([]);
  setForm(prev => ({
    ...prev,
    hora: ""
  }));
  return;

}
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

// ❌ MIÉRCOLES NO LO TOCAMOS (queda dentro del grupo)
if (diaSemana === "domingo") {
  setHorariosDisponibles([]);
  return;
}

// 🔴 VIERNES EN AGENDA PÚBLICA / SERVICIOS
// El doctor puede tener horarios extra en Citas.jsx,
// pero el paciente público solo puede sacar turno viernes de mañana.
if (diaSemana === "viernes") {
  const configViernes = getConfiguracionViernes(form.fecha);

  if (!configViernes) {
    setHorariosDisponibles([]);
    setForm((prev) => ({
      ...prev,
      hora: ""
    }));
    return;
  }

  if (configViernes.turno === "mañana") {
    horariosBase = ["10:00", "10:30", "11:00"];
  }

  if (configViernes.turno === "tarde") {
    setHorariosDisponibles([]);
    setForm((prev) => ({
      ...prev,
      hora: ""
    }));
    return;
  }
}

// 🟢 LUNES - MARTES - MIÉRCOLES
if (
  diaSemana === "lunes" ||
  diaSemana === "martes" ||
  diaSemana === "miércoles"
) {
  horariosBase = [
    "15:00", "15:30",
    "16:00", "16:30",
    "17:00", "17:30"
  ];
}

// 🟡 JUEVES (mañana)
else if (diaSemana === "jueves") {
    horariosBase =["10:00","10:30","11:00"];
}

// 🔵 SÁBADO (solo virtual)
else if (diaSemana === "sábado") {
  horariosBase = [
    "10:00", "10:30","11:00",
    "11:30", "12:00"
  ];
}
    // 🔥 traer ocupados
    const q = query(
      collection(db, "citas"),
      where("fecha", "==", form.fecha)
    );

const snapshot = await getDocs(q);

const ocupados = snapshot.docs.map((doc) =>
  normalizarHora(doc.data().hora)
);

const bloqueadas = bloqueosHora
  .filter((b) => b.fecha === form.fecha && b.activo)
  .map((b) => normalizarHora(b.hora));

const disponibles = horariosBase.filter((h) => {
  const hora = normalizarHora(h);

  return (
    !ocupados.includes(hora) &&
    !bloqueadas.includes(hora)
  );
});

setHorariosDisponibles(disponibles);
};
  cargarHorarios();
}, [form.fecha, bloqueos, viernesAgenda, bloqueosHora]);

useEffect(() => {
  if (!form.fecha) return;

  const fechaObj = new Date(form.fecha + "T00:00:00");

  const diaSemana = fechaObj
    .toLocaleDateString("es-AR", { weekday: "long" })
    .toLowerCase();

  if (diaSemana === "sábado") {
    setForm((prev) => ({
      ...prev,
      tipo: "virtual"
    }));

    return;
  }

  setForm((prev) => ({
    ...prev,
    tipo: "presencial"
  }));
}, [form.fecha]);

  // 🔥 GUARDAR CITA
const handleSubmit = async (e) => {
  e.preventDefault();

  if (guardandoCita) return;

  const camposObligatorios = [
    "nombre",
    "telefono",
    "Dni",
    "fechaNacimiento",
    "sexo",
    "obraSocial",
    "motivoConsulta",
    "tipo",
    "fecha",
    "hora"
  ];

  const hayCamposVacios = camposObligatorios.some(
    (campo) => !form[campo]?.toString().trim()
  );

  if (hayCamposVacios) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }

  if (!form.hora) {
    alert("Selecciona un horario");
    return;
  }

  setGuardandoCita(true);

  try {
    const bloqueosHoraSnap = await getDocs(
      query(
        collection(db, "bloqueosHora"),
        where("fecha", "==", form.fecha)
      )
    );

    const horaBloqueada = bloqueosHoraSnap.docs.some((doc) => {
      const data = doc.data();

      return (
        data.activo &&
        normalizarHora(data.hora) === normalizarHora(form.hora)
      );
    });

    if (horaBloqueada) {
      alert("Ese horario ya no está disponible. Por favor selecciona otro horario.");

      setForm((prev) => ({
        ...prev,
        hora: ""
      }));

      return;
    }

    const citasSnap = await getDocs(
      query(
        collection(db, "citas"),
        where("fecha", "==", form.fecha)
      )
    );

    const citaYaExiste = citasSnap.docs.some((doc) => {
      const data = doc.data();
      return normalizarHora(data.hora) === normalizarHora(form.hora);
    });

    if (citaYaExiste) {
      alert("Ese horario acaba de ser reservado. Por favor selecciona otro horario.");

      setForm((prev) => ({
        ...prev,
        hora: ""
      }));

      return;
    }

    const fechaTipoObj = new Date(form.fecha + "T00:00:00");

    const diaTipoSemana = fechaTipoObj
      .toLocaleDateString("es-AR", { weekday: "long" })
      .toLowerCase();

    if (diaTipoSemana === "sábado" && form.tipo !== "virtual") {
      alert("Los sábados solo se permiten consultas virtuales.");
      return;
    }

    if (diaTipoSemana !== "sábado" && form.tipo !== "presencial") {
      alert("De lunes a viernes solo se permiten consultas presenciales.");
      return;
    }

    const dniLimpio = limpiarDniPaciente(form.Dni);
    const telefonoLimpio = limpiarTelefono10(form.telefono);

    const historiaClinicaId = await buscarOCrearHistoriaDesdeServices({
      ...form,
      Dni: dniLimpio,
      telefono: telefonoLimpio
    });

    const citaFinal = {
      ...form,
      Dni: dniLimpio,
      telefono: telefonoLimpio,

      historiaClinicaId,
      pacienteId: historiaClinicaId,

      estadoCita: "pendiente",
      estadoConfirmacion: "pendiente",
      estadoAsistencia: "pendiente",

      origen: "web",
      createdAt: new Date()
    };

    await addDoc(collection(db, "citas"), citaFinal);

    setCitaGuardada(citaFinal);

    setMostrarCitaAgendada(true);
    setTimeout(() => {
      setMostrarCitaAgendada(false);
    }, 1800);

    setSuccess(true);

    // ✅ Que NO se quede abajo: vuelve al cuadro principal de agenda
    setTimeout(() => {
      const agenda = document.getElementById("agenda-cita");
      if (!agenda) return;

      const y =
        agenda.getBoundingClientRect().top +
        window.pageYOffset -
        95;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    }, 120);

    setForm({
      nombre: "",
      telefono: "",
      Dni: "",

      fechaNacimiento: "",
      sexo: "",
      obraSocial: "",
      motivoConsulta: "",

      tipo: "presencial",
      fecha: "",
      hora: ""
    });

    setHorariosDisponibles([]);
  } catch (error) {
    console.error(error);
    alert("Error al guardar la cita");
  } finally {
    setGuardandoCita(false);
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
    
const formatearFechaComprobante = (fecha) => {
  if (!fecha) return "-";

  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const obtenerLugarComprobante = (cita) => {
  if (cita?.tipo === "virtual") {
    return "Consulta por videollamada";
  }

  return "Consultorios Externos de la Clínica San Agustín - San Martín 1355,  Neuquén Capital";
};

const obtenerValorConsultaComprobante = (cita) => {
  const tipo = cita?.tipo?.toLowerCase()?.trim();

  if (tipo === "virtual") {
    return "$30.000";
  }

  return "$60.000";
};

const generarComprobanteImagenPaciente = async () => {
  if (!citaGuardada || generandoComprobante) return;

  try {
    setGenerandoComprobante(true);

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    if (!comprobantePacienteRef.current) return;

    const canvas = await html2canvas(comprobantePacienteRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    canvas.toBlob((blob) => {
      if (!blob) return;

      const nombreSeguro = (citaGuardada.nombre || "paciente")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const file = new File(
        [blob],
        `cita-${nombreSeguro}-${citaGuardada.fecha}-${citaGuardada.hora}.png`,
        { type: "image/png" }
      );

      const url = URL.createObjectURL(blob);

      setPreviewComprobanteFile(file);
      setPreviewComprobanteUrl(url);
      setGenerandoComprobante(false);
    }, "image/png");

  } catch (error) {
    console.error("Error al generar comprobante:", error);
    setGenerandoComprobante(false);
  }
};

const compartirComprobantePaciente = async () => {
  if (!previewComprobanteFile) return;

  try {
    if (
      navigator.canShare &&
      navigator.canShare({ files: [previewComprobanteFile] })
    ) {
      await navigator.share({
        files: [previewComprobanteFile],
        title: "Comprobante de cita - Dr. Reuma",
        text: "Te envío el comprobante de tu cita con Dr. Reuma.",
      });

      return;
    }

    descargarComprobantePaciente();
  } catch (error) {
    console.error("No se pudo compartir:", error);
  }
};

const descargarComprobantePaciente = () => {
  if (!previewComprobanteUrl || !previewComprobanteFile) return;

  const link = document.createElement("a");
  link.href = previewComprobanteUrl;
  link.download = previewComprobanteFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const cerrarPreviewComprobantePaciente = () => {
  if (previewComprobanteUrl) {
    URL.revokeObjectURL(previewComprobanteUrl);
  }

  setPreviewComprobanteUrl(null);
  setPreviewComprobanteFile(null);
};

  return (
    <section id="servicios" className="services-section">
      <div className="container py-5">

        {mostrarCitaAgendada && (
  <div className="servicio-cita-overlay">
    <div className="servicio-cita-card">
      <div className="servicio-cita-icon">
        <FaCalendarCheck />
      </div>

      <h4>Cita agendada</h4>

      <p>
        Tu turno fue reservado correctamente.
      </p>
    </div>
  </div>
)}

{generandoComprobante && (
  <div className="servicio-cita-overlay">
    <div className="servicio-cita-card">
      <div className="servicio-cita-icon">
        <FaImage />
      </div>

      <h4>Generando comprobante</h4>

      <p>
        Preparando imagen para WhatsApp...
      </p>

      <div className="servicio-loading-bar">
        <span />
      </div>
    </div>
  </div>
)}

        <h3 className="subtitle-general mb-5">
          <span className="subtitle-celeste">CONSULTAS Y SERVICIOS</span>
          <span className="subtitle-negro"> DE REUMATOLOGÍA </span>
        </h3>
        
        <p className="services-description mb-5">
          Ofrecemos atención <span className="fw-bold"> Presencial en Neuquén Capital, en los consultorios externos de la Clínica San Agustín  y consultas online </span> desde la comodidad
          de tu hogar por si no puedes venir, para personas con dolor articular, inflamación, cansancio,
          rigidez o síntomas reumatológicos.
        </p>
    
           
        <p className="services-description text-center mb-5">

          <span className="fw-bold celeste ">"QUE EL DOLOR CONSTANTE NO ES NORMAL,
            UNA ENFERMEDAD REUMATOLÓGICA NO TIENE EDAD." 
          </span>
        </p>

{/* FORMULARIO */}
<div id="agenda-cita" className="agenda-shell mb-5">
  <div className="agenda-inner-card">
        
          {!success ? (
            

<form onSubmit={handleSubmit} className="agenda-pro-form">
<div className="agenda-pro-header">
  <div className="agenda-pro-header-icon">
    <FaCalendarCheck />
  </div>

  <h4>AGENDA TU CITA</h4>

  <p>
    Completa tus datos y reserva tu consulta con Dr. Reuma.
  </p>
</div>
  <div className="agenda-pro-grid">

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaUser />
      </div>

      <div className="agenda-pro-control">
        <label>Nombre completo</label>
        <input
          type="text"
          name="nombre"
          placeholder="Ingresa tu nombre completo"
          className="form-control"
          required
          value={form.nombre}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaPhoneAlt />
      </div>

      <div className="agenda-pro-control">
        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          placeholder="Ingresa tu número de teléfono"
          className="form-control"
          required
          value={form.telefono}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaIdCard />
      </div>

      <div className="agenda-pro-control">
        <label>DNI</label>
        <input
          type="text"
          name="Dni"
          placeholder="Ingresa tu número de DNI"
          className="form-control"
          required
          value={form.Dni}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaBirthdayCake />
      </div>

      <div className="agenda-pro-control">
        <label>Fecha de nacimiento</label>
        <input
          type="date"
          name="fechaNacimiento"
          className="form-control"
          required
          value={form.fechaNacimiento}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaVenusMars />
      </div>

      <div className="agenda-pro-control">
        <label>Sexo</label>
        <select
          name="sexo"
          className="form-select select-con-flecha"
          required
          value={form.sexo}
          onChange={handleChange}
        >
          <option value="">Selecciona una opción</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
        </select>
      </div>
    </div>

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaShieldAlt />
      </div>

      <div className="agenda-pro-control">
        <label>Obra social</label>
        <input
          type="text"
          name="obraSocial"
          placeholder="Ej: ISSN, OSDE, Particular"
          className="form-control"
          required
          value={form.obraSocial}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="agenda-pro-field agenda-pro-field-wide">
      <div className="agenda-pro-icon">
        <FaNotesMedical />
      </div>

      <div className="agenda-pro-control">
        <label>Motivo de consulta</label>
        <textarea
          name="motivoConsulta"
          placeholder="Cuéntanos brevemente el motivo de tu consulta"
          className="form-control"
          rows="3"
          required
          value={form.motivoConsulta}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaMapMarkerAlt />
      </div>

      <div className="agenda-pro-control">
        <label>Modalidad</label>
        <select
          name="tipo"
          className="form-select select-con-flecha"
          value={form.tipo}
          onChange={handleChange}
          required
        >
          <option
            value="presencial"
            disabled={
              form.fecha &&
              new Date(form.fecha + "T00:00:00")
                .toLocaleDateString("es-AR", { weekday: "long" })
                .toLowerCase() === "sábado"
            }
          >
            Presencial
          </option>

          <option
            value="virtual"
            disabled={
              form.fecha &&
              new Date(form.fecha + "T00:00:00")
                .toLocaleDateString("es-AR", { weekday: "long" })
                .toLowerCase() !== "sábado"
            }
          >
            Virtual
          </option>
        </select>

        {form.fecha &&
          new Date(form.fecha + "T00:00:00")
            .toLocaleDateString("es-AR", { weekday: "long" })
            .toLowerCase() === "sábado" && (
            <small className="agenda-pro-help danger">
              ⚠️ Los sábados solo se permiten consultas virtuales.
            </small>
        )}

        {form.fecha &&
          new Date(form.fecha + "T00:00:00")
            .toLocaleDateString("es-AR", { weekday: "long" })
            .toLowerCase() !== "sábado" && (
            <small className="agenda-pro-help success">
              ✅ De lunes a viernes la consulta es únicamente presencial.
            </small>
        )}
      </div>
    </div>

    <div className="agenda-pro-field">
      <div className="agenda-pro-icon">
        <FaCalendarAlt />
      </div>

      <div className="agenda-pro-control">
        <label>Fecha de la cita</label>
        <input
          type="date"
          name="fecha"
          className="form-control"
          required
          value={form.fecha}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="agenda-pro-field agenda-pro-field-wide">
      <div className="agenda-pro-icon">
        <FaClock />
      </div>

      <div className="agenda-pro-control">
        <label>Selecciona una hora</label>
        <select
          name="hora"
          className="form-select select-con-flecha"
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

  </div>

  <div className="agenda-pro-actions">
    <button
        type="submit"
        className="agenda-pro-submit"
        disabled={guardandoCita}
      >
        <FaSave />
        <span>{guardandoCita ? "Guardando..." : "Guardar Cita"}</span>
      </button>
  </div>

  <div className="agenda-pro-info">
    <div className="agenda-pro-info-icon">
      <FaExclamationCircle />
    </div>

    <div>
      <h5>Información importante</h5>
      <p>
        El pago se realizará al finalizar la consulta médica.
        En caso de cancelación o reprogramación, comunícate con el médico.
      </p>
    </div>
  </div>

</form>

) : (

<div className="success-card success-card-premium text-center">

  <div className="success-actions-top">
    <button
      className="btn btn-agendar fw-semibold"
      onClick={() => {
        setSuccess(false);
        setCitaGuardada(null);

        setForm({
          nombre: "",
          telefono: "",
          Dni: "",

          fechaNacimiento: "",
          sexo: "",
          obraSocial: "",
          motivoConsulta: "",

          tipo: "presencial",
          fecha: "",
          hora: ""
        });
      }}
    >
      Nueva cita
    </button>

    <button
      type="button"
      className="btn btn-pdf"
      onClick={generarComprobanteImagenPaciente}
    >
      <FaImage className="me-2" />
      Comprobante
    </button>
  </div>

  <img
    src={DrReumaLogo}
    alt="Dr. Reuma"
    className="success-logo"
    crossOrigin="anonymous"
  />

  <div className="success-check-big">
    <FaCheckCircle />
  </div>

  <h4 className="fw-bold">
    ¡Cita agendada correctamente!
  </h4>

  <p>
    Tu turno fue reservado exitosamente.
  </p>

  <div className="appointment-summary appointment-summary-premium">

    <div>
      <span>Paciente</span>
      <strong>{citaGuardada.nombre}</strong>
    </div>

    <div>
      <span>Fecha</span>
      <strong>{formatearFechaComprobante(citaGuardada.fecha)}</strong>
    </div>

    <div>
      <span>Hora</span>
      <strong>{citaGuardada.hora} hs</strong>
    </div>

    <div>
      <span>Tipo</span>
      <strong>{citaGuardada.tipo}</strong>
    </div>

    <div>
      <span>Especialidad</span>
      <strong>Reumatología - Dr. Tony Vélez</strong>
    </div>

    <div>
      <span>Ubicación</span>
      <strong>{obtenerLugarComprobante(citaGuardada)}</strong>
    </div>

  </div>

  <small className="d-block fw-semibold mb-3">
    📲 Presiona el botón para notificar al médico.
  </small>

  <a
    href={whatsappLink}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-whatsapp"
  >
    <FaWhatsapp />
    NOTIFICAR POR WHATSAPP
  </a>

</div>

)}

{citaGuardada && (
  <div className="servicio-comprobante-hidden">
    <div ref={comprobantePacienteRef} className="servicio-comprobante-card">

      <div className="servicio-comprobante-topbar" />

      <div className="servicio-comprobante-header">
        <img
          src={DrReumaLogo}
          alt="Dr. Reuma"
          className="servicio-comprobante-logo"
          crossOrigin="anonymous"
        />

        <div className="servicio-comprobante-badge">
          <FaCheckCircle />
          Turno confirmado
        </div>

        <h2>COMPROBANTE DE CITA</h2>
        <p>Dr. Reuma · Especialista en Enfermedades Autoinmunes y Reumatologicas </p>
      </div>

      <div className="servicio-comprobante-paciente">
        <span>Paciente</span>
        <h3>{citaGuardada.nombre}</h3>

        <div className="servicio-comprobante-chips">
          <div>
            <FaCalendarAlt />
            {formatearFechaComprobante(citaGuardada.fecha)}
          </div>

          <div>
            <FaClock />
            {citaGuardada.hora} hs
          </div>
        </div>
      </div>

      <div className="servicio-comprobante-box">
        <h4>
          <FaMapMarkerAlt />
          Lugar
        </h4>

        <p>{obtenerLugarComprobante(citaGuardada)}</p>
      </div>

      <div className="servicio-comprobante-box servicio-comprobante-medico-unico">
  <div className="servicio-comprobante-medico-info">
    <h4>
      <FaUserMd />
      Médico
    </h4>

    <p>
      Dr. Tony Vélez - Reumatólogo
    </p>
  </div>

  <div className="servicio-comprobante-valor-inline">
    <span>Valor consulta</span>
    <strong>{obtenerValorConsultaComprobante(citaGuardada)}</strong>
    <small>
      {citaGuardada?.tipo === "virtual"
        ? "Consulta virtual"
        : "Efectivo / Transferencia" }
    </small>
  </div>
</div>

      <div className="servicio-comprobante-note">
        <strong>Nota importante</strong>

        <p>
          En caso de cancelación, por favor avisar con antelación.
          Presentarse 15 minutos antes del horario asignado.
        </p>
      </div>

      <div className="servicio-comprobante-footer">
        <strong>
          <FaWhatsapp />
          WhatsApp: +54 9 299 509 5471
        </strong>

        <small>
          Gracias por confiar en Dr. Reuma
        </small>
      </div>

    </div>
  </div>
)}
  </div>
</div>

<br />

        {/* CARDS */}
        <div className="row g-4 mb-5 ">

          <div className="col-12 col-md-6">
            <ServiceCard 
              icon={<FaVideo />}
              title="CONSULTA POR VIDEOLLAMADA $30.000" 
              message="Hola Dr. Reuma, vengo desde la página web. Quisiera solicitar una consulta por videollamada."
              description="Consulta reumatológica online por videollamada para pacientes de Argentina, Ecuador y Estados Unidos desde la comodidad de su hogar."

              extra={
                
                <div className="flags mb-2">
                  <img src="https://flagcdn.com/ar.svg" alt="Argentina" />
                  <img src="https://flagcdn.com/ec.svg" alt="Ecuador" />
                  <img src="https://flagcdn.com/us.svg" alt="USA" />
                </div>
              }
              
            />
          </div>

          <div className="col-12 col-md-6 ">
            <ServiceCard 
            icon={<FaPrescriptionBottleAlt />}
            title="RECETA MÉDICA $10.000" 
            message="Hola Dr. Reuma, vengo desde la página web. Quisiera solicitar una receta médica."
            description="Emisión y renovación de recetas médicas, para tratamientos reumatológicos, enfermedades autoinmues o malestar en general para todas las obras sociales." />
          </div>

          <div className="col-12 col-md-6 ">
            <ServiceCard 
            icon={<FaPrescriptionBottleAlt />}
            title="CERTIFICADO MÉDICO DE TRABAJO $15.000" 
            message="Hola Dr. Reuma, vengo desde la página web. Quisiera solicitar una receta médica."
            description="Emisión de certificados médicos de trabajo." />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard 
            icon={<FaDumbbell />}
            title="APTITUD FÍSICA $30.000" 
            message="Hola Dr. Reuma, vengo desde la página web. Quisiera consultar por un certificado de aptitud física."
            description="Realizamos Aptos físicos en Neuquén, mediante un control clínico." />
          </div>

          <div className="col-12 col-md-6">
            <ServiceCard 
            icon={<FaChalkboardTeacher />}
            title="CHARLAS Y EDUCACÍON " 
            message="Hola Dr. Reuma, vengo desde la página web. Quisiera información sobre charlas y educación."
            description="Charlas sobre salud reumatológica." />
          </div>
          <div className="col-12 col-md-6">
            <ServiceCard 
            title="CONSULTA A DOMICILIO" 
            icon={<FaHome />}
            description="Próximamente..... !!!" 
            disabled badge="NO DISPONIBLE" />
          </div>

            <div className="">
            <ServiceCard 
            icon={<FaClinicMedical />}
            title="CONSULTA PRESENCIAL - NEUQUÉN  $60.000" 
            description="
            Atención reumatológica presencial en Neuquén Capital, ubicados en la  
            Clínica San Agustín en Neuquén (Consultorios Externos - San Martín 1355)." 
            mapLink="https://maps.app.goo.gl/WgDkBRvfiKK3cP1y7"
            extra={
                <>

        <div className="flags mb-3">
          <img
            src="https://flagcdn.com/ar.svg"
            alt="Argentina"
          />
        </div>

        <div className="mini-map-container">

          <iframe
            title="Mapa Clínica San Agustín"
            src="https://www.google.com/maps?q=San+Martín+1355+Neuquén&output=embed"
            width="100%"
            height="180"
            style={{
              border: 0,
              borderRadius: "15px"
            }}
            allowFullScreen=""
            loading="lazy"
          />

        </div>
      </>
              }
            showButton={false} />
          </div>

            <p className="services-description text-center mb-4">

            Agenda tu consulta presencial o virtual
            con <span className="fw-bold celeste">Dr. Reuma </span>
            y recibe atención especializada en <span className="fw-bold">
            {" "}enfermedades reumatológicas,
            autoinmunes y dolor articular. </span>

            </p>


        </div>

{previewComprobanteUrl && (
  <div className="comprobante-preview-overlay">
    <div className="comprobante-preview-card">

      <button
        type="button"
        className="comprobante-preview-close"
        onClick={cerrarPreviewComprobantePaciente}
      >
        ×
      </button>

      <h4>Comprobante generado</h4>
      <img
        src={previewComprobanteUrl}
        alt="Comprobante de cita"
        className="comprobante-preview-img"
      />

      <div className="comprobante-preview-actions">
        <button
          type="button"
          className="btn-comprobante-share"
          onClick={compartirComprobantePaciente}
        >
          Compartir / Guardar
        </button>

        <button
          type="button"
          className="btn-comprobante-download"
          onClick={descargarComprobantePaciente}
        >
          Descargar
        </button>
      </div>

    </div>
  </div>
)}
        
      </div>
    </section>
  );
}

export default Services;