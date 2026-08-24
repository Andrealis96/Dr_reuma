import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import ModalCita from "../components/ModalCita";
import ModalDetalle from "../components/ModalDetalle";
import html2canvas from "html2canvas";
import logo from "../assets/DrReumaLogo.png";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaWhatsapp,
  FaStethoscope,
  FaUserClock,
  FaSearch,
  FaIdCard,
  FaUser,
  FaUsers, 
  FaVideo,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaSun,
  FaCloudSun,
  FaStickyNote,
  FaDownload,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserMd, 
  FaFolderOpen
} from "react-icons/fa";

import { Link } from "react-router-dom";
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

  const [mostrarCitaGuardada, setMostrarCitaGuardada] = useState(false);
  const [mensajeCitaGuardada, setMensajeCitaGuardada] = useState("CITA AGENDADA");
  const [mostrarConfirmacionEstado, setMostrarConfirmacionEstado] = useState(false);
  const [mensajeConfirmacionEstado, setMensajeConfirmacionEstado] = useState("");

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
  const [bloqueosHora, setBloqueosHora] = useState([]);
  const [showDetalle, setShowDetalle] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  //notas 
  const [notasAgenda, setNotasAgenda] = useState([]);
  const [showModalNota, setShowModalNota] = useState(false);
  const [notaDia, setNotaDia] = useState("");

  //imagen cita
  const comprobanteRef = useRef(null);
  const [citaParaDescargar, setCitaParaDescargar] = useState(null);
  const [descargandoComprobante, setDescargandoComprobante] = useState(false); 
  const [previewComprobanteUrl, setPreviewComprobanteUrl] = useState(null);
  const [previewComprobanteFile, setPreviewComprobanteFile] = useState(null);
  const [citaComprobanteActual, setCitaComprobanteActual] = useState(null);

  // ================= FIRESTORE =================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "citas"), (snap) => {
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setCitasDB(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
  const eventosCitas = citasDB.map(c => ({
    id: c.id,
    title: c.nombre,
    start: `${c.fecha}T${c.hora}`,
    classNames: [`evento-${c.tipo}`],
    extendedProps: {
      ...c,
      tipoEvento: "cita"
    }
  }));

  const eventosHorasBloqueadas = bloqueosHora
    .filter(b => b.activo)
    .map(b => ({
      id: `bloqueo-hora-${b.id}`,
      title: "Bloqueada",
      start: `${b.fecha}T${normalizarHora(b.hora)}`,
      classNames: ["evento-hora-bloqueada"],
      extendedProps: {
        ...b,
        tipoEvento: "bloqueoHora"
      }
    }));

  setEventos([...eventosCitas, ...eventosHorasBloqueadas]);
}, [citasDB, bloqueosHora]);

useEffect(() => {
  if (!diaSeleccionado) return;

  const horarios = obtenerHorariosDisponibles(diaSeleccionado);
  setHorariosDisponibles(horarios);
}, [diaSeleccionado, citasDB, viernesAgenda, bloqueos, bloqueosHora]);

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

useEffect(() => {
  const unsub = onSnapshot(collection(db, "bloqueosHora"), (snap) => {
    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setBloqueosHora(data);
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
    base = ["09:00", "09:30","10:00","10:30","11:00","13:20"];
  //horarios viernes
  else if (day === 5) {
  const configViernes = getConfiguracionViernes(fecha);

  if (!configViernes) {
    return [];
  }

  if (configViernes.turno === "mañana") {
    base = ["13:20"];
  }

  if (configViernes.turno === "tarde") {
    base = ["14:45", "15:00", "15:30", "16:00" , "16:30"];
  }
}
  else if (day === 6)
    base = generarHorarios("09:30", "13:00");
  else
    return [];

  const ocupados = citasDB
    .filter(c => c.fecha === fecha)
    .map(c => String(c.hora).trim().slice(0, 5));
return base.filter(
  h =>
    !ocupados.includes(h.trim().slice(0, 5)) &&
    !horaEstaBloqueada(fecha, h)
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
  
  const bloqueosHoraDelDia = bloqueosHora
  .filter(b => b.fecha === diaSeleccionado && b.activo)
  .map(b => ({
    id: b.id,
    hora: normalizarHora(b.hora),
    tipo: "bloqueoHora"
  }));

const agendaDelDia = [
  ...pacientesDelDia.map(c => ({
    tipo: "cita",
    hora: normalizarHora(c.hora),
    data: c
  })),

  ...bloqueosHoraDelDia.map(b => ({
    tipo: "bloqueoHora",
    hora: normalizarHora(b.hora),
    data: b
  }))
].sort((a, b) => a.hora.localeCompare(b.hora));

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

  const obtenerClavePaciente = (cita) => {
  const dniPaciente = cita?.Dni || cita?.dni || "";

  if (dniPaciente.toString().trim()) {
    return `dni-${dniPaciente.toString().replace(/\D/g, "")}`;
  }

  return `nombre-${(cita?.nombre || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()}`;
};

const obtenerNumeroCitaPaciente = (cita) => {
  if (!cita) return 1;

  const clavePaciente = obtenerClavePaciente(cita);

  const citasPaciente = citasDB
    .filter((c) => obtenerClavePaciente(c) === clavePaciente)
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora || "00:00"}`);
      const fechaB = new Date(`${b.fecha}T${b.hora || "00:00"}`);

      return fechaA - fechaB;
    });

  const posicion = citasPaciente.findIndex((c) => c.id === cita.id);

  return posicion === -1 ? 1 : posicion + 1;
};

const confirmarCita = async (cita) => {
  if (!cita?.id) return;

  await updateDoc(doc(db, "citas", cita.id), {
    estadoCita: "confirmado",

    // Compatibilidad con lo anterior
    estadoConfirmacion: "confirmado",
    estadoAsistencia: "pendiente"
  });

  setCitaSeleccionada((prev) =>
    prev?.id === cita.id
      ? {
          ...prev,
          estadoCita: "confirmado",
          estadoConfirmacion: "confirmado",
          estadoAsistencia: "pendiente"
        }
      : prev
  );
};

const confirmarCitaDesdeDetalle = async (cita) => {
  if (!cita?.id) return;

  await confirmarCita(cita);

  setShowDetalle(false);
  setMensajeConfirmacionEstado("CITA CONFIRMADA");
  setMostrarConfirmacionEstado(true);

  setTimeout(() => {
    setMostrarConfirmacionEstado(false);
    setMensajeConfirmacionEstado("");
  }, 1800);
};

const textoNumeroCitaPaciente = (numero) => {
  if (numero === 1) return "Primera vez";
  if (numero === 2) return "Segunda vez";
  if (numero === 3) return "Tercera vez";

  return `${numero}ª vez`;
};

const obtenerHoyLocal = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();

  return new Date(ahora.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const obtenerEstadoCitaTexto = (cita) => {
  if (cita.estadoCita === "asistio" || cita.estadoAsistencia === "asistio") {
    return "Asistió";
  }

  if (cita.estadoCita === "noAsistio" || cita.estadoAsistencia === "noAsistio") {
    return "No asistió";
  }

  if (cita.estadoCita === "confirmado" || cita.estadoConfirmacion === "confirmado") {
    return "Confirmado";
  }

  if (cita.fecha < obtenerHoyLocal()) {
    return "No asistió";
  }

  return "Pendiente";
};

const obtenerEstadoCitaClase = (cita) => {
  const estado = obtenerEstadoCitaTexto(cita);

  if (estado === "Asistió") return "estado-asistio";
  if (estado === "No asistió") return "estado-no-asistio";
  if (estado === "Confirmado") return "estado-confirmado";

  return "estado-pendiente";
};

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

const limpiarTelefono10 = (telefono = "") => {
  let numero = telefono.toString().replace(/\D/g, "");

  if (!numero) return "";

  // 0054...
  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }

  // +54 9 2942...
  if (numero.startsWith("549") && numero.length >= 13) {
    numero = numero.slice(3);
  }

  // +54 2942...
  if (numero.startsWith("54") && numero.length >= 12) {
    numero = numero.slice(2);
  }

  // 9 + número nacional
  if (numero.startsWith("9") && numero.length === 11) {
    numero = numero.slice(1);
  }

  // 0 + número nacional
  if (numero.startsWith("0") && numero.length === 11) {
    numero = numero.slice(1);
  }

  // Si quedó más largo, toma los últimos 10 dígitos
  if (numero.length > 10) {
    numero = numero.slice(-10);
  }

  return numero;
};

const mostrarMensajeGuardadoCita = (mensaje) => {
  setMensajeCitaGuardada(mensaje);
  setMostrarCitaGuardada(true);

  setTimeout(() => {
    setMostrarCitaGuardada(false);
  }, 1600);
};

  // ================= GUARDAR =================
const guardarCita = async (data) => {
  const dataLimpia = {
  ...data,
  telefono: limpiarTelefono10(data.telefono),

  estadoConfirmacion:
    data.estadoConfirmacion || citaEditar?.estadoConfirmacion || "pendiente",

  estadoAsistencia:
    data.estadoAsistencia || citaEditar?.estadoAsistencia || "pendiente"
};

  const q = query(
    collection(db, "citas"),
    where("fecha", "==", dataLimpia.fecha),
    where("hora", "==", dataLimpia.hora)
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

    return false;
  }

  if (citaEditar) {
    await updateDoc(
      doc(db, "citas", citaEditar.id),
      dataLimpia
    );

    setCitaEditar(null);
    setShowModal(false);
    mostrarMensajeGuardadoCita("Cita actualizada");

    return true;
  }

  await addDoc(
    collection(db, "citas"),
    {
      ...dataLimpia,
      createdAt: new Date()
    }
  );

  setShowModal(false);
  mostrarMensajeGuardadoCita("CITA AGENDADA");

  return true;
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

const formatearFechaComprobante = (fecha) => {
  if (!fecha) return "-";

  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const obtenerLugarCita = (cita) => {
  if (cita.tipo === "virtual") {
    return "Consulta por videollamada";
  }

  return "San Martín 1355, Consultorios Externos de la Clínica San Agustín - Neuquén Capital";
};

const descargarComprobanteImagen = (cita) => {
  if (descargandoComprobante) return;

  setDescargandoComprobante(true);
  setCitaParaDescargar(cita);
};

useEffect(() => {
  if (!citaParaDescargar || !descargandoComprobante) return;

  let cancelado = false;

  const generarImagen = async () => {
    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      if (!comprobanteRef.current) return;

      const canvas = await html2canvas(comprobanteRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      canvas.toBlob((blob) => {
        if (!blob || cancelado) return;

        const nombreSeguro = (citaParaDescargar.nombre || "paciente")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");

        const horaSegura = (citaParaDescargar.hora || "")
          .replace(/:/g, "-")
          .replace(/[^\w-]/g, "");

        const fechaSegura = (citaParaDescargar.fecha || "")
          .replace(/[^\w-]/g, "");

        const file = new File(
          [blob],
          `cita-${nombreSeguro}-${fechaSegura}-${horaSegura}.jpg`,
          { type: "image/jpeg" }
        );

        const url = URL.createObjectURL(blob);

        setPreviewComprobanteFile(file);
        setPreviewComprobanteUrl(url);
        setCitaComprobanteActual(citaParaDescargar);

        setCitaParaDescargar(null);
        setDescargandoComprobante(false);
              }, "image/jpeg", 0.95);

    } catch (error) {
      console.error("Error al generar comprobante:", error);
      setCitaParaDescargar(null);
      setDescargandoComprobante(false);
    }
  };

  generarImagen();

  return () => {
    cancelado = true;
  };
}, [citaParaDescargar, descargandoComprobante]);

const compartirComprobante = async () => {
  if (!previewComprobanteFile) return;

  try {
    if (
      navigator.canShare &&
      navigator.canShare({ files: [previewComprobanteFile] })
    ) {
      await navigator.share({
        files: [previewComprobanteFile],
        title: "Comprobante de cita - Dr. Reuma",
        text: "Te envío el comprobante de tu cita.",
      });

      return;
    }

    descargarPreviewComprobante();
  } catch (error) {
    console.error("No se pudo compartir:", error);
  }
};

const descargarPreviewComprobante = async () => {
  if (!previewComprobanteFile) return;

  const nombreArchivo = previewComprobanteFile.name
    .replace(/:/g, "-")
    .replace(/[^\w.\-]/g, "");

  try {
    // Mejor opción para PC / Chrome / Edge
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: nombreArchivo,
        types: [
          {
            description: "Imagen PJP",
            accept: {
              "image/jpeg": [".jpg", ".jpeg"],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(previewComprobanteFile);
      await writable.close();

      return;
    }

    // Fallback para navegador común
    const url = URL.createObjectURL(previewComprobanteFile);

    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 300);
  } catch (error) {
    if (error?.name === "AbortError") return;

    console.error("No se pudo descargar el comprobante:", error);
  }
};

const cerrarPreviewComprobante = () => {
  if (previewComprobanteUrl) {
    URL.revokeObjectURL(previewComprobanteUrl);
  }

  setPreviewComprobanteUrl(null);
  setPreviewComprobanteFile(null);
  setCitaComprobanteActual(null);
};

const normalizarTelefonoWhatsapp = (telefono = "", usarNueve = true) => {
  const numero10 = limpiarTelefono10(telefono);

  if (!numero10) return "";

  return usarNueve ? `549${numero10}` : `54${numero10}`;
};

const abrirWhatsappBusinessPaciente = (usarNueve = true) => {
  if (!citaComprobanteActual?.telefono) {
    alert("Esta cita no tiene teléfono registrado.");
    return;
  }

  const numero = normalizarTelefonoWhatsapp(
    citaComprobanteActual.telefono,
    usarNueve
  );

  console.log("TELÉFONO ORIGINAL:", citaComprobanteActual.telefono);
  console.log("TELÉFONO WHATSAPP:", numero);

  const mensaje = encodeURIComponent(
    `Hola ${capitalizarNombre(citaComprobanteActual.nombre || "")}, te enviamos el comprobante de tu cita con Dr. Reuma. Te esperamos.\n\n` +
    `Fecha: ${formatearFechaComprobante(citaComprobanteActual.fecha)}\n` +
    `Hora: ${citaComprobanteActual.hora} hs\n` +
    `Lugar: ${obtenerLugarCita(citaComprobanteActual)}`
  );

  const urlWeb = `https://wa.me/${numero}?text=${mensaje}`;
  const esAndroid = /Android/i.test(navigator.userAgent);

  if (esAndroid) {
    window.location.href =
      `intent://send?phone=${numero}&text=${mensaje}` +
      `#Intent;scheme=whatsapp;package=com.whatsapp.w4b;` +
      `S.browser_fallback_url=${encodeURIComponent(urlWeb)};end`;

    return;
  }

  window.open(urlWeb, "_blank");
};

const abrirWhatsappCita = (cita, usarNueve = true, tipoMensaje = "recordatorio") => {
  if (!cita?.telefono) {
    alert("Esta cita no tiene teléfono registrado.");
    return;
  }

  const numero = normalizarTelefonoWhatsapp(cita.telefono, usarNueve);

  console.log("TELÉFONO ORIGINAL:", cita.telefono);
  console.log("TELÉFONO WHATSAPP:", numero);

  let texto = "";

  if (tipoMensaje === "recordatorio") {
    texto =
      `Hola ${capitalizarNombre(cita.nombre || "")}, te recordamos tu cita con Dr. Reuma.\n\n` +
      `Fecha: ${formatearFechaComprobante(cita.fecha)}\n` +
      `Hora: ${cita.hora} hs\n` +
      `Lugar: ${obtenerLugarCita(cita)}\n\n` +
      `Te esperamos.`;
  }

  if (tipoMensaje === "comprobante") {
    texto =
      `Hola ${capitalizarNombre(cita.nombre || "")}, te enviamos el comprobante de tu cita con Dr. Reuma. Te esperamos.\n\n` +
      `Fecha: ${formatearFechaComprobante(cita.fecha)}\n` +
      `Hora: ${cita.hora} hs\n` +
      `Lugar: ${obtenerLugarCita(cita)}`;
  }

  const mensaje = encodeURIComponent(texto);
  const urlWeb = `https://wa.me/${numero}?text=${mensaje}`;
  const esAndroid = /Android/i.test(navigator.userAgent);

  if (esAndroid) {
    window.location.href =
      `intent://send?phone=${numero}&text=${mensaje}` +
      `#Intent;scheme=whatsapp;package=com.whatsapp.w4b;` +
      `S.browser_fallback_url=${encodeURIComponent(urlWeb)};end`;

    return;
  }

  window.open(urlWeb, "_blank");
};

const horaEstaBloqueada = (fecha, hora) => {
  return bloqueosHora.some(
    b =>
      b.fecha === fecha &&
      normalizarHora(b.hora) === normalizarHora(hora) &&
      b.activo
  );
};

const toggleBloqueoHora = async (hora) => {
  if (!diaSeleccionado || !hora) return;

  const bloqueoActivo = bloqueosHora.find(
    b =>
      b.fecha === diaSeleccionado &&
      normalizarHora(b.hora) === normalizarHora(hora) &&
      b.activo
  );

  if (bloqueoActivo) {
    await updateDoc(doc(db, "bloqueosHora", bloqueoActivo.id), {
      activo: false,
      updatedAt: new Date()
    });

    return;
  }

  await addDoc(collection(db, "bloqueosHora"), {
    fecha: diaSeleccionado,
    hora: normalizarHora(hora),
    activo: true,
    createdAt: new Date()
  });
};

const cambiarConfirmacionCita = async (cita) => {
  if (!cita?.id) return;

  const nuevoEstado =
    cita.estadoConfirmacion === "confirmado" ? "pendiente" : "confirmado";

  await updateDoc(doc(db, "citas", cita.id), {
    estadoConfirmacion: nuevoEstado
  });
};

const cambiarAsistenciaCita = async (cita, estadoAsistencia) => {
  if (!cita?.id) return;

  await updateDoc(doc(db, "citas", cita.id), {
    estadoAsistencia
  });
};

return (

    <div className="container py-4">

      {mostrarCitaGuardada && (
  <div className="cita-save-overlay">
    <div className="cita-save-card">

      <div className="cita-save-icon">
        <FaCheckCircle />
      </div>

      <h4>{mensajeCitaGuardada}</h4>
    </div>
  </div>
)}

{mostrarConfirmacionEstado && (
  <div className="cita-save-overlay">
    <div className="cita-save-card">

      <div className="cita-save-icon">
        <FaCheckCircle />
      </div>

      <h4>{mensajeConfirmacionEstado}</h4>
    </div>
  </div>
)}

      {descargandoComprobante && (
  <div className="comprobante-loading-overlay">
    <div className="comprobante-loading-card">

      <div className="comprobante-loading-icon">
        <FaDownload />
      </div>

      <h4>Generando comprobante</h4>

      <p>
        Preparando la imagen de la cita...
      </p>

      <div className="comprobante-loading-bar">
        <span />
      </div>

    </div>
  </div>
)}

      {/* HEADER */}
     <div className="citas-header-top mb-4">

  <div></div>

  <h3 className="subtitle-general text-center mb-0">
    <span className="subtitle-celeste">CALENDARIO DE</span>
    <span className="subtitle-negro"> CITAS</span>
  </h3>

  <Link
    to="/admin/historias"
    className="citas-ir-historias-btn"
  >
    <FaFolderOpen />
    Historias clínicas
  </Link>

</div>
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
            <table className="table table-sm mb-0 tabla-pacientes-hoy">
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
                      <FaUserClock className="me-2 celeste" /> <br />
                      <span className="celeste">
                        Vez
                      </span>
                    </th>

                    <th>
                      <FaStethoscope className="me-2 celeste" /> <br />
                      <span className="celeste">
                        Motivo
                      </span>
                    </th>

                    <th>
                      <FaCheckCircle className="me-2 celeste" /> <br />
                      <span className="celeste">
                        Estado
                      </span>
                    </th>
                </tr>
              </thead>

              <tbody className="text-center">
                {pacientesHoy.map(c => (
                  <tr key={c.id}>
                    <td>
                      {c.sinAgenda ? (
                        <span className="hora-sin-agenda">
                          Sin hora
                        </span>
                      ) : (
                        c.hora
                      )}
                    </td>
                    <td>{capitalizarNombre(c.nombre)}</td>
                    <td>{c.Dni}</td>
                    <td>
                      {c.telefono ? (
                        <button
                          type="button"
                          className="btn-whatsapp-tabla"
                          onClick={() => abrirWhatsappCita(c, true, "recordatorio")}
                          title="Enviar recordatorio por WhatsApp Business"
                        >
                          <FaWhatsapp />
                          {limpiarTelefono10(c.telefono)}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>

                  <td>
                    {(() => {
                      const numeroCita = obtenerNumeroCitaPaciente(c);

                      return (
                        <span
                          className={`badge-vez-paciente ${
                            numeroCita === 1 ? "badge-primera-vez" : "badge-repetido"
                          }`}
                        >
                          {textoNumeroCitaPaciente(numeroCita)}
                        </span>
                      );
                    })()}
                  </td>

                      <td>
                      <span
                        className="motivo-tabla-cita"
                        title={c.motivoConsulta || "Sin motivo"}
                      >
                        {c.motivoConsulta || "Sin motivo"}
                      </span>
                    </td>

                    <td>
                      <span className={`estado-cita-simple ${obtenerEstadoCitaClase(c)}`}>
                        {obtenerEstadoCitaTexto(c)}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>


{/* BUSCADOR DE PACIENTES */}
<div className="buscador-citas-card mt-4 mb-4">

  <div className="buscador-citas-title">
    <FaSearch />
    <span>Buscar paciente en agenda</span>
  </div>

  <div className="buscador-citas-input-wrap">
    <FaSearch className="buscador-citas-icon" />

    <input
      type="text"
      className="form-control buscador-citas-input"
      placeholder="Buscar por nombre o DNI..."
      value={busquedaPaciente}
      onChange={(e) => setBusquedaPaciente(e.target.value)}
    />

    {busquedaPaciente && (
      <button
        type="button"
        className="buscador-citas-clear"
        onClick={() => setBusquedaPaciente("")}
      >
        ×
      </button>
    )}
  </div>

  {busquedaPaciente.trim() !== "" && (
    <div className="buscador-citas-resultados">

      {resultadosBusqueda.length === 0 ? (
        <div className="buscador-citas-vacio">
          No se encontraron pacientes
        </div>
      ) : (
        resultadosBusqueda.slice(0, 8).map((c) => (
          <div
            key={c.id}
            className="buscador-citas-item"
            onClick={() => {
              setCitaSeleccionada(c);
              setShowDetalle(true);
            }}
          >
            <div>
              <strong>{capitalizarNombre(c.nombre)}</strong>

              <span>
                DNI: {c.Dni || "Sin DNI"}
              </span>

              <small>
                {c.fecha} · {c.hora} hs · {c.tipo === "presencial" ? "Presencial" : "Virtual"}
              </small>
            </div>

            <button
              type="button"
              className="buscador-citas-whatsapp"
              onClick={(e) => {
                e.stopPropagation();
                abrirWhatsappCita(c, true, "recordatorio");
              }}
              title="Enviar WhatsApp"
            >
              <FaWhatsapp />
            </button>
          </div>
        ))
      )}

    </div>
  )}

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

  const clases = [];

  if (diaEstaBloqueado(fecha)) {
    clases.push("dia-bloqueado");
  }

  const tieneNota = notasAgenda.some(
    n => n.fecha === fecha && n.texto?.trim()
  );

  if (tieneNota) {
    clases.push("dia-con-nota");
  }

  return clases;
}}

 dayCellContent={(arg) => {
  const fecha = arg.date.toISOString().split("T")[0];
const configViernes = getConfiguracionViernes(fecha);

const tieneNota = notasAgenda.some(
  n => n.fecha === fecha && n.texto?.trim()
);



const obtenerHoyLocal = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();

  return new Date(ahora.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const obtenerEstadoCitaTexto = (cita) => {
  if (cita.estadoCita === "asistio" || cita.estadoAsistencia === "asistio") {
    return "Asistió";
  }

  if (cita.estadoCita === "confirmado" || cita.estadoConfirmacion === "confirmado") {
    return "Confirmado";
  }

  if (cita.fecha < obtenerHoyLocal()) {
    return "No asistió";
  }

  return "Pendiente";
};

const obtenerEstadoCitaClase = (cita) => {
  const estado = obtenerEstadoCitaTexto(cita);

  if (estado === "Asistió") return "estado-asistio";
  if (estado === "No asistió") return "estado-no-asistio";
  if (estado === "Confirmado") return "estado-confirmado";

  return "estado-pendiente";
};

  return (
    <div className="dia-celda-custom">

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
        notaDelDia ? "btn-warning" : "btn-outline-warning"
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
    <div className="alert alert-warning py-2 px-3 mt-2 mb-0 nota-dia-alert">
      <strong className="d-block">📝 NOTA DEL DÍA:</strong>
      <span className="d-block">{notaDelDia.texto}</span>
    </div>
  )}

</div>

{agendaDelDia.length === 0 ? (
  <p>No hay pacientes ni horarios bloqueados</p>
) : (
  agendaDelDia.map((item) => {

    if (item.tipo === "bloqueoHora") {
      return (
        <div
          key={`bloqueo-${item.data.id}`}
          className="btn-pacientecita cita-hora-bloqueada-listado"
        >
          <div className="d-flex justify-content-between align-items-center">

            <div className="paciente-cita-info">

              <div className="hora-linea-cita">
                <span className="estado-cita-dot estado-bloqueado" />

                <div className="hora-paciente">
                  {item.hora}
                </div>
              </div>

              <div className="nombre-paciente-dia">
                Hora bloqueada
              </div>

            </div>

            <button
              type="button"
              className="btn-bloquear-hora activo"
              title="Desbloquear hora"
              onClick={(e) => {
                e.stopPropagation();
                toggleBloqueoHora(item.hora);
              }}
            >
              <FaLock />
            </button>

          </div>
        </div>
      );
    }

    const c = item.data;

    return (
      <div
        key={c.id}
        className="btn-pacientecita"
        onClick={() => {
          setCitaSeleccionada(c);
          setShowDetalle(true);
        }}
      >

        <div className="d-flex justify-content-between align-items-center">

          <div className="paciente-cita-info">

            <div className="hora-linea-cita">
              <span
                className={`estado-cita-dot ${
                  c.tipo === "presencial" ? "estado-presencial" : "estado-virtual"
                }`}
                title={c.tipo === "presencial" ? "Consulta presencial" : "Consulta virtual"}
              />

              <div className="hora-paciente">
                {c.hora}
              </div>
            </div>

            <div className="nombre-paciente-dia">
              {capitalizarNombre(c.nombre)}
            </div>

          </div>

          <button
            type="button"
            className="btn-comprobante-cita"
            title="Descargar comprobante"
            disabled={descargandoComprobante}
            onClick={(e) => {
              e.stopPropagation();
              descargarComprobanteImagen(c);
            }}
          >
            <FaDownload />
          </button>

        </div>
      </div>
    );
  })
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
horariosDisponibles.map(h => {
  const bloqueada = horaEstaBloqueada(diaSeleccionado, h);

  return (
    <div key={h} className="horario-admin-slot">

      <button
        type="button"
        className={`btn btn-horario ${bloqueada ? "hora-bloqueada" : ""}`}
        disabled={bloqueada}
        title={bloqueada ? "Hora bloqueada" : "Agendar cita"}
        onClick={() => {
          if (bloqueada) return;

          setCitaEditar(null);
          setFechaSeleccionada(diaSeleccionado);
          setHoraPreseleccionada(h);
          setShowModal(true);
        }}
      >
        <FaClock className="me-1" />
        {h}
      </button>

      <button
        type="button"
        className={`btn-bloquear-hora ${bloqueada ? "activo" : ""}`}
        title={bloqueada ? "Desbloquear hora" : "Bloquear hora"}
        onClick={() => toggleBloqueoHora(h)}
      >
        <FaLock />
      </button>

    </div>
  );
})
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
  onWhatsapp={(cita) => abrirWhatsappCita(cita, true, "recordatorio")}
  onConfirmar={confirmarCitaDesdeDetalle}
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

{citaParaDescargar && (
  <div className="servicio-comprobante-hidden">
    <div ref={comprobanteRef} className="servicio-comprobante-card">

      <div className="servicio-comprobante-topbar" />

      <div className="servicio-comprobante-header">
        <img
          src={logo}
          alt="Dr. Reuma"
          className="servicio-comprobante-logo"
          crossOrigin="anonymous"
        />

        <div className="servicio-comprobante-badge">
          <FaCheckCircle />
          Turno confirmado
        </div>

        <h2>COMPROBANTE DE CITA</h2>

        <p>
          Dr. Reuma · Especialista en enfermedades Autoinmunes y Reumatológicas
        </p>
      </div>

      <div className="servicio-comprobante-paciente">
        <span>Paciente</span>

        <h3>
          {capitalizarNombre(citaParaDescargar?.nombre || "Paciente")}
        </h3>

        <div className="servicio-comprobante-chips">
          <div>
            <FaCalendarAlt />
            {formatearFechaComprobante(citaParaDescargar?.fecha)}
          </div>

          <div>
            <FaClock />
            {citaParaDescargar?.hora || "--:--"} hs
          </div>
        </div>
      </div>

      <div className="servicio-comprobante-box">
        <h4>
          <FaMapMarkerAlt />
          Lugar:
        </h4>

        <p>
          {obtenerLugarCita(citaParaDescargar)}
        </p>
      </div>

      <div className="servicio-comprobante-box">
        <h4>
          <FaUserMd />
          Médico Especialista:
        </h4>

        <p>
          Dr. Tony Vélez - Reumatólogo
        </p>
      </div>

      <div className="servicio-comprobante-note">
        <strong>Nota importante</strong>

        <p>
          En caso de cancelación, por favor avisar al médico con antelación.  <br />
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

{previewComprobanteUrl && (
  <div className="comprobante-preview-overlay">
    <div className="comprobante-preview-card">

      <button
        type="button"
        className="comprobante-preview-close"
        onClick={cerrarPreviewComprobante}
      >
        ×
      </button>

      <img
        src={previewComprobanteUrl}
        alt="Comprobante de cita"
        className="comprobante-preview-img"
      />

<div className="comprobante-preview-actions">
  <button
    type="button"
    className="btn-comprobante-download"
    onClick={descargarPreviewComprobante}
  >
    Descargar imagen
  </button>

<button
  type="button"
  className="btn-comprobante-whatsapp-business"
  onClick={() => abrirWhatsappBusinessPaciente(true)}
>
  Abrir WhatsApp Business
</button>

<button
  type="button"
  className="btn-comprobante-whatsapp-alt"
  onClick={() => abrirWhatsappBusinessPaciente(false)}
>
  Abrir sin 9
</button>

</div>

    </div>
  </div>
)}

</div>
  ); 
}



export default Citas;