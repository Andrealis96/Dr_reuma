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
nombres: "",
apellidos: "",
telefono: "",
Dni: "",
numeroCredencial: "",

  fechaNacimiento: "",
  sexo: "",
  obraSocial: "",
  motivoConsulta: "",

  tipo: "presencial",
  fecha: "",
  hora: ""
});
  const [pasoTurno, setPasoTurno] = useState(1);
  const pasoAnteriorRef = useRef(1);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [bloqueosHora, setBloqueosHora] = useState([]);
  const [success, setSuccess] = useState(false);
  const [citaGuardada, setCitaGuardada] = useState(null);
  const [fechaNacimientoTexto, setFechaNacimientoTexto] = useState("");
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
  const { name, value } = e.target;

  setForm((prev) => {
    let valorFinal = value;

    
 // Nombres y apellidos: solo letras y formato correcto
if (name === "nombres" || name === "apellidos") {
  valorFinal = value
    .replace(/[^\p{L}\s]/gu, "")
    .toLocaleLowerCase("es-AR")
    .replace(/(^|\s)(\p{L})/gu, (texto) =>
      texto.toLocaleUpperCase("es-AR")
    );
}


   // DNI Y TELÉFONO: solamente números
    if (name === "Dni" || name === "telefono") {
      valorFinal = value.replace(/\D/g, "");
    }

    
// Obra social: letras, espacios y barra inclinada

if (name === "obraSocial") {
  valorFinal = value
    .replace(/[^\p{L}\s/-]/gu, "")
    .toLocaleUpperCase("es-AR");
}



    // Credencial: números y guiones
    if (name === "numeroCredencial") {
      valorFinal = value.replace(/[^\d-]/g, "");
    }

    const actualizado = {
      ...prev,
      [name]: valorFinal,
    };

    // Seguir enviando nombre completo a Agenda
    if (name === "nombres" || name === "apellidos") {
      actualizado.nombre = [
        actualizado.nombres,
        actualizado.apellidos,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
    }

    return actualizado;
  });
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
  return String(telefono)
    .replace(/\D/g, "")
    .slice(0, 13);
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
    nombres: dataCita.nombres?.trim() || "",
    apellidos: dataCita.apellidos?.trim() || "",
    numeroCredencial: dataCita.numeroCredencial?.trim() || "",
        
    
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

/* VIERNES: horarios públicos según turno del médico */

if (diaSemana === "viernes") {
  const configViernes = getConfiguracionViernes(form.fecha);

  // Sin configuración, no se ofrecen turnos.
  if (
    !configViernes ||
    !["mañana", "tarde"].includes(configViernes.turno)
  ) {
    setHorariosDisponibles([]);
    setForm(prev => ({
      ...prev,
      hora: ""
    }));
    return;
  }

  if (configViernes.turno === "mañana") {
    horariosBase = [
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30"
    ];
  } else if (configViernes.turno === "tarde") {
    horariosBase = [
      "15:00",
      "15:30",
      "16:00",
      "16:30"
    ];
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
    horariosBase =["09:30","10:00","10:30","11:00"];
}

// 🔵 SÁBADO (solo virtual)
else if (diaSemana === "sábado") {
  horariosBase = [
    "10:00", "10:30","11:00",
    "11:30"
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

setForm(prev => ({
  ...prev,
  hora: disponibles.includes(prev.hora) ? prev.hora : ""
}));

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

  
const nombresCampos = {
  nombre: "nombre y apellido",
  telefono: "teléfono",
  Dni: "DNI",
  fechaNacimiento: "fecha de nacimiento",
  sexo: "sexo",
  obraSocial: "obra social",
  motivoConsulta: "motivo de consulta",
  tipo: "modalidad",
  fecha: "fecha de la cita",
  hora: "horario"
};

const campoFaltante = camposObligatorios.find(
  (campo) => !String(form[campo] || "").trim()
);

if (campoFaltante) {
  alert(
    `Revisá el campo: ${nombresCampos[campoFaltante] || campoFaltante}.`
  );
  return;
}

if (!/^\d{7,9}$/.test(form.Dni)) {
  alert("Revisá el DNI.");
  return;
}

if (!/^\d{6,13}$/.test(form.telefono)) {
  alert("Revisá el teléfono");
  return;
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fechaNacimiento)) {
  alert("Revisá la fecha de nacimiento: ingresá una fecha válida en formato DD-MM-AAAA.");
  return;
}


  if (!form.hora) {
    alert("Selecciona un horario");
    return;
  }


  
const fechaReserva = new Date(`${form.fecha}T00:00:00`);

if (fechaReserva.getDay() === 5) {
  const configViernes = getConfiguracionViernes(form.fecha);

  const horariosViernesPublicos = {
    mañana: ["10:00", "10:30", "11:00", "11:30"],
    tarde: ["15:00", "15:30", "16:00", "16:30"]
  };

  const turno = configViernes?.turno;

  if (
    !turno ||
    !horariosViernesPublicos[turno]?.includes(form.hora) ||
    diaEstaBloqueado(form.fecha)
  ) {
    alert(
      "Este viernes u horario no está habilitado. Seleccioná otro turno."
    );
    return;
  }
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

    const nombreNormalizado = form.nombre
  .trim()
  .toLowerCase()
  .split(/\s+/)
  .map(
    palabra =>
      palabra.charAt(0).toUpperCase() +
      palabra.slice(1)
  )
  .join(" ");

    const historiaClinicaId = await buscarOCrearHistoriaDesdeServices({
  ...form,

  nombre: nombreNormalizado,

  Dni: dniLimpio,

  telefono: telefonoLimpio
});

    const citaFinal = {
  ...form,

  nombre: nombreNormalizado,

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
      nombres: "",
      apellidos: "",
      telefono: "",
      Dni: "",
      numeroCredencial: "",

      fechaNacimiento: "",
      sexo: "",
      obraSocial: "",
      motivoConsulta: "",

tipo: "presencial",
fecha: "",
hora: ""
});

setFechaNacimientoTexto("");
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


useEffect(() => {
  if (!success) return;

  const comprobante = document.querySelector(
    ".success-card"
  );

  if (comprobante) {
    comprobante.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [success]);


useEffect(() => {
  if (pasoAnteriorRef.current === pasoTurno) return;

  pasoAnteriorRef.current = pasoTurno;

  if (success) return;

  requestAnimationFrame(() => {
    const formulario = document.getElementById("agenda-cita");

    if (!formulario) return;

    const posicion =
      formulario.getBoundingClientRect().top +
      window.scrollY -
      105;

    window.scrollTo({
      top: Math.max(0, posicion),
      behavior: "smooth",
    });
  });
}, [pasoTurno, success]);

const comprobanteAutoRef = useRef("");

useEffect(() => {
  if (!success || !citaGuardada) return;

  const clave = [
    citaGuardada.nombre,
    citaGuardada.fecha,
    citaGuardada.hora
  ].join("|");

  if (comprobanteAutoRef.current === clave) return;

  comprobanteAutoRef.current = clave;
  generarComprobanteImagenPaciente();
}, [success, citaGuardada]);

  return (
    <section id="servicios" className="services-section">
      <div className="container ">

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


{/* FORMULARIO */}
<div id="agenda-cita" className="agenda-shell mb-5">
  <div className="agenda-inner-card">
        
          {!success ? (
            


<form onSubmit={handleSubmit} className="agenda-pro-form agenda-pasos">

  <div
    className="agenda-pasos-barra"
    aria-label={`Paso ${pasoTurno} de 3`}
  >
    {[1, 2, 3].map((n) => (
      <span
        key={n}
        className={n <= pasoTurno ? "activo" : ""}
      />
    ))}
  </div>

  <p className="agenda-pasos-indicador">
    PASO {pasoTurno} DE 3
  </p>

  {/* ====================================
      PASO 1: FECHA Y HORARIO
  ==================================== */}

  {pasoTurno === 1 && (
    <div className="agenda-pasos-panel">

      <h5>1. Elegí fecha y horario</h5>
      <p>
        Primero verificá los horarios disponibles para tu consulta.
      </p>

      <div className="agenda-pasos-precios">

        <div className="agenda-pasos-precio">
          <strong>CONSULTA PRESENCIAL</strong>
          <span>Lunes a viernes</span>
          <b>$60.000</b>
        </div>

        <div className="agenda-pasos-precio">
          <strong>CONSULTA VIRTUAL</strong>
          <span>Sábados</span>
          <b>$30.000</b>
        </div>

      </div>

      <div className="agenda-pro-grid">

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaCalendarAlt />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="fecha-servicios-pasos">
              Fecha de la cita
            </label>

            <input
              id="fecha-servicios-pasos"
              type="date"
              name="fecha"
              className="form-control"
              required
              value={form.fecha}
              onChange={(e) => {
                setHorariosDisponibles([]);
                setForm((prev) => ({
                  ...prev,
                  fecha: e.target.value,
                  hora: "",
                  tipo:
                    e.target.value &&
                    new Date(`${e.target.value}T12:00:00`).getDay() === 6
                      ? "virtual"
                      : "presencial",
                }));
              }}
            />
          </div>
        </div>

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaClock />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="hora-servicios-pasos">
              Horario disponible
            </label>

            <select
              id="hora-servicios-pasos"
              name="hora"
              className="form-select select-con-flecha"
              required
              value={form.hora}
              onChange={handleChange}
              disabled={
                !form.fecha ||
                horariosDisponibles.length === 0
              }
            >
              <option value="">
                {!form.fecha
                  ? "Primero seleccioná una fecha"
                  : horariosDisponibles.length === 0
                  ? "No hay horarios disponibles"
                  : "Seleccioná una hora"}
              </option>

              {horariosDisponibles.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {form.fecha && (
        <div className="agenda-pasos-modalidad">
          {form.tipo === "virtual"
            ? "Consulta por videollamada · $30.000  ✓✓"
            : "Consulta presencial · $60.000  ✓✓"}
        </div>
      )}

      <div className="agenda-pasos-acciones">
        <button
          type="button"
          className="agenda-pasos-siguiente"
          onClick={() => {
            if (
              !form.fecha ||
              !form.hora ||
              !horariosDisponibles.includes(form.hora)
            ) {
              alert(
                "Elegí una fecha y un horario disponible para continuar."
              );
              return;
            }

            setPasoTurno(2);
          }}
        >
          Continuar con mis datos →
        </button>
      </div>

    </div>
  )}

  {/* ====================================
      PASO 2: DATOS DEL PACIENTE
  ==================================== */}

  {pasoTurno === 2 && (
    <div className="agenda-pasos-panel">

      <h5>2. Datos del paciente</h5>
      <p>
        Completá tus datos personales para reservar el turno.
      </p>

      <div className="agenda-pro-grid">

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaUser />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="serv-nombres">
              Nombres
            </label>

            <input
              id="serv-nombres"
              type="text"
              name="nombres"
              className="form-control"
              placeholder="Tus nombres"
              autoComplete="given-name"
              required
              value={form.nombres || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaUser />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="serv-apellidos">
              Apellidos
            </label>

            <input
              id="serv-apellidos"
              type="text"
              name="apellidos"
              className="form-control"
              placeholder="Tus apellidos"
              autoComplete="family-name"
              required
              value={form.apellidos || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaPhoneAlt />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="serv-telefono">
              Teléfono
            </label>

            <input
              id="serv-telefono"
              type="tel"
              name="telefono"
              className="form-control"
              placeholder="Ej.: 2991234567"
              inputMode="numeric"
              maxLength={13}
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
            <label htmlFor="serv-dni">
              DNI
            </label>

            <input
              id="serv-dni"
              type="text"
              inputMode="numeric"
              name="Dni"
              className="form-control"
              placeholder="Número de documento"
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
            <label htmlFor="serv-nacimiento">
              Fecha de nacimiento
            </label>

           
<input
  id="serv-nacimiento"
  type="text"
  inputMode="numeric"
  autoComplete="bday"
  className="form-control"
  placeholder="DD-MM-AAAA"
  maxLength={13}
  required
  value={fechaNacimientoTexto}
  onChange={(e) => {
    const digitos = e.target.value.replace(/\D/g, "").slice(0, 8);

    let texto = digitos.slice(0, 2);
    if (digitos.length > 2) {
      texto += "-" + digitos.slice(2, 4);
    }
    if (digitos.length > 4) {
      texto += "-" + digitos.slice(4, 8);
    }

    setFechaNacimientoTexto(texto);

    let fechaISO = "";

    if (digitos.length === 8) {
      const dia = Number(digitos.slice(0, 2));
      const mes = Number(digitos.slice(2, 4));
      const anio = Number(digitos.slice(4, 8));

      const fecha = new Date(
        Date.UTC(anio, mes - 1, dia)
      );

      const esValida =
        anio >= 1900 &&
        anio <= new Date().getFullYear() &&
        fecha.getUTCFullYear() === anio &&
        fecha.getUTCMonth() === mes - 1 &&
        fecha.getUTCDate() === dia &&
        fecha.getTime() <= Date.now();

      if (esValida) {
        fechaISO =
          `${anio}-${String(mes).padStart(2, "0")}` +
          `-${String(dia).padStart(2, "0")}`;
      }
    }

    setForm((prev) => ({
      ...prev,
      fechaNacimiento: fechaISO,
    }));
  }}
/>

          </div>
        </div>

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaVenusMars />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="serv-sexo">
              Sexo
            </label>

            <select
              id="serv-sexo"
              name="sexo"
              className="form-select select-con-flecha"
              required
              value={form.sexo}
              onChange={handleChange}
            >
              <option value="">
                Seleccioná una opción
              </option>
              <option value="Femenino">
                Femenino
              </option>
              <option value="Masculino">
                Masculino
              </option>
            </select>
          </div>
        </div>

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaShieldAlt />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="serv-obra">
              Obra social (1 o más)
            </label>

            <input
              id="serv-obra"
              name="obraSocial"
              className="form-control"
              required
              placeholder="ISSN / OSDE / PARTICULAR"
              value={form.obraSocial}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="agenda-pro-field">
          <div className="agenda-pro-icon">
            <FaIdCard />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="serv-credencial">
              N.º de credencial
            </label>

            <input
              id="serv-credencial"
              name="numeroCredencial"
              type="text"
              className="form-control"
              inputMode="text"
              placeholder="Número de credencial"
              value={form.numeroCredencial || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="agenda-pro-field agenda-pro-field-wide">
          <div className="agenda-pro-icon">
            <FaNotesMedical />
          </div>

          <div className="agenda-pro-control">
            <label htmlFor="serv-motivo">
              Motivo de consulta
            </label>

            <textarea
              id="serv-motivo"
              name="motivoConsulta"
              className="form-control"
              rows="3"
              placeholder="Describí brevemente el motivo"
              required
              value={form.motivoConsulta}
              onChange={handleChange}
            />
          </div>
        </div>

      </div>

      <div className="agenda-pasos-acciones">

        <button
          type="button"
          className="agenda-pasos-atras"
          onClick={() => setPasoTurno(1)}
        >
          ← Volver
        </button>

        <button
          type="button"
          className="agenda-pasos-siguiente"
          
onClick={() => {
  const campos = [
    ["nombres", "los nombres"],
    ["apellidos", "los apellidos"],
    ["telefono", "el teléfono"],
    ["Dni", "el DNI"],
    ["fechaNacimiento", "la fecha de nacimiento"],
    ["sexo", "el sexo"],
    ["obraSocial", "la obra social"],
    ["motivoConsulta", "el motivo de consulta"],
  ];

  const faltante = campos.find(
    ([campo]) => !String(form[campo] || "").trim()
  );

  if (faltante) {
    alert(`Por favor, revisá ${faltante[1]}.`);
    return;
  }

  if (!/^\d{7,9}$/.test(form.Dni)) {
    alert("Revisá el DNI: debe tener entre 7 y 9 números.");
    return;
  }

  if (!/^\d{6,13}$/.test(form.telefono)) {
    alert("Revisá el teléfono");
    return;
  }

  if (
    form.numeroCredencial &&
    !/^\d+(?:-\d+)*$/.test(form.numeroCredencial)
  ) {
    alert("Revisá la credencial: solo números y guiones.");
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fechaNacimiento)) {
    alert("Revisá la fecha de nacimiento. Usá DD-MM-AAAA.");
    return;
  }

  setPasoTurno(3);
}}

        >
          Revisar mi reserva →
        </button>

      </div>

    </div>
  )}

  {/* ====================================
      PASO 3: CONFIRMAR RESERVA
  ==================================== */}

  {pasoTurno === 3 && (
    <div className="agenda-pasos-panel">

      <h5>3. Revisá tu turno</h5>
      <p>
        Confirmá que todos los datos estén correctos.
      </p>

      <div className="agenda-pasos-resumen">

        <div>
          <span>Paciente</span>
          <strong>
            {`${form.nombres || ""} ${form.apellidos || ""}`.trim()}
          </strong>
        </div>

        <div>
          <span>Fecha</span>
          <strong>
            {form.fecha
              ? new Date(
                  `${form.fecha}T00:00:00`
                ).toLocaleDateString("es-AR")
              : "—"}
          </strong>
        </div>

        <div>
          <span>Hora</span>
          <strong>{form.hora}</strong>
        </div>

        <div>
          <span>Modalidad</span>
          <strong>
            {form.tipo === "virtual"
              ? "Videollamada"
              : "Presencial"}
          </strong>
        </div>

        <div>
          <span>Valor de la consulta</span>
          <strong>
            {form.tipo === "virtual"
              ? "$30.000"
              : "$60.000"}
          </strong>
        </div>

      </div>

<div className="agenda-aviso-pago">
  <FaExclamationCircle />
  <span>
    El pago se realizará una vez finalizada la consulta médica.
  </span>
</div>

      <div className="agenda-pasos-acciones">

        <button
          type="button"
          className="agenda-pasos-atras"
          disabled={guardandoCita}
          onClick={() => setPasoTurno(2)}
        >
          ← Corregir datos
        </button>

        <button
          type="submit"
          className="agenda-pro-submit"
          disabled={guardandoCita}
        >
          <FaSave />
          <span>
            {guardandoCita
              ? "Guardando..."
              : "Confirmar y guardar cita"}
          </span>
        </button>

      </div>

    </div>
  )}

</form>


) : (


<div className="success-card success-card-premium text-center">

  <div className="success-check-big">
    <FaCheckCircle />
  </div>

  <h4 className="fw-bold">
    ¡Cita agendada correctamente!
  </h4>

  {previewComprobanteUrl ? (
    <div className="comprobante-inline">
      <img
        src={previewComprobanteUrl}
        alt="Comprobante de cita del paciente"
        className="comprobante-inline-imagen"
      />
    </div>
  ) : (
    <p className="comprobante-inline-cargando">
      Preparando tu comprobante...
    </p>
  )}

  <div className="comprobante-inline-acciones">

    <button
      type="button"
      className="comprobante-inline-nueva"
      onClick={() => {
        cerrarPreviewComprobantePaciente();
        comprobanteAutoRef.current = "";

        setSuccess(false);
        setCitaGuardada(null);
        setFechaNacimientoTexto("");
        setPasoTurno(1);

        setForm({
          nombre: "",
          nombres: "",
          apellidos: "",
          telefono: "",
          Dni: "",
          numeroCredencial: "",
          fechaNacimiento: "",
          sexo: "",
          obraSocial: "",
          motivoConsulta: "",
          tipo: "presencial",
          fecha: "",
          hora: ""
        });

        setHorariosDisponibles([]);
      }}
    >
      <FaCalendarAlt />
      Reservar otro turno
    </button>

    <button
      type="button"
      className="comprobante-inline-descargar"
      onClick={descargarComprobantePaciente}
      disabled={!previewComprobanteUrl}
      title="Descargar comprobante"
      aria-label="Descargar comprobante"
    >
      <FaSave />
      Descargar
    </button>

  </div>

  <p className="comprobante-inline-nota">
    Guardá este comprobante para recordar tu turno.
  </p>

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

    <div
      ref={comprobantePacienteRef}
      className="comprobante-premium-b"
    >

      {/* HEADER */}
      <div className="premium-b-header">

        <div className="premium-b-identidad">

          <img
            src={DrReumaLogo}
            alt="Dr. Reuma"
            className="premium-b-logo"
            crossOrigin="anonymous"
          />

          <div>
            <strong>Dr. Tony Vélez</strong>
            <span>Médico Reumatólogo</span>
          </div>

        </div>


        <div className="premium-b-confirmado">

          <FaCheckCircle />

          <span>
            TURNO REGISTRADO
          </span>

        </div>

      </div>


      {/* TÍTULO */}
      <div className="premium-b-titulo">
        COMPROBANTE DE CITA
      </div>


      {/* CARD PRINCIPAL */}
      <div className="premium-b-card">

        {/* PACIENTE + PRECIO */}
        <div className="premium-b-paciente-row">

          <div className="premium-b-paciente">

            <small>
              PACIENTE
            </small>

            <h1>
              {citaGuardada.nombre}
            </h1>

          </div>


          <div className="premium-b-precio">

            <small>
              VALOR CONSULTA
            </small>

            <strong>
              {obtenerValorConsultaComprobante(
                citaGuardada
              )}
            </strong>

            <span>
              {citaGuardada?.tipo === "virtual"
                ? "Consulta virtual"
                : "Efectivo / Transferencia"}
            </span>

          </div>

        </div>


        {/* DATOS */}
        <div className="premium-b-grid">

          {/* FECHA */}
          <div className="premium-b-dato">

            <div className="premium-b-icono">
              <FaCalendarAlt />
            </div>

            <div>

              <small>
                FECHA
              </small>

              <strong>
                {formatearFechaComprobante(
                  citaGuardada.fecha
                )}
              </strong>

            </div>

          </div>


          {/* HORA */}
          <div className="premium-b-dato">

            <div className="premium-b-icono">
              <FaClock />
            </div>

            <div>

              <small>
                HORA
              </small>

              <strong>
                {citaGuardada.hora} hs
              </strong>

            </div>

          </div>


          {/* LUGAR */}
          <div className="premium-b-dato premium-b-full">

            <div className="premium-b-icono">
              <FaMapMarkerAlt />
            </div>

            <div>

              <small>
                LUGAR
              </small>

              {citaGuardada?.tipo === "virtual" ? (

                <strong>
                  Consulta por videollamada
                </strong>

              ) : (

                <strong>
                  San Martín 1355

                  <span>
                    Consultorios Externos · Clínica San Agustín
                  </span>

                  <span>
                    Neuquén Capital
                  </span>
                </strong>

              )}

            </div>

          </div>


          {/* MÉDICO */}
          <div className="premium-b-dato premium-b-full">

            <div className="premium-b-icono">
              <FaUserMd />
            </div>

            <div>

              <small>
                MÉDICO ESPECIALISTA
              </small>

              <strong>
                Dr. Tony Vélez

                <span>
                  Reumatólogo
                </span>
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* FOOTER */}
      <div className="premium-b-footer">

        <div className="premium-b-contacto">

          <FaWhatsapp />

          <div>

            <small>
              WHATSAPP
            </small>

            <strong>
              +54 9 299 509 5471
            </strong>

          </div>

        </div>


        <span>
          Clínica San Agustín · Neuquén
        </span>

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

{previewComprobanteUrl && !success && (
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