import { useEffect,useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase";

import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaFilePdf,
  FaPencilAlt,
  FaTimes,
  FaCalendarAlt,
  FaFolderOpen
} from "react-icons/fa";

import jsPDF from "jspdf";
import logo from "../assets/DrReumaLogo.png";
import firma from "../assets/firma.png";
import userMale from "../assets/user-male.png";
import userFemale from "../assets/user-female.png";
import Swal from "sweetalert2";

function HistoriaPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

const citaIdAgenda = searchParams.get("citaId");

  const [paciente, setPaciente] = useState(() => {
  try {
    const cache = localStorage.getItem(`paciente-cache-${id}`);

    if (!cache) return null;

    const data = JSON.parse(cache);

    const cacheVencido = Date.now() - data.ts > 1000 * 60 * 15;

    if (cacheVencido) {
      localStorage.removeItem(`paciente-cache-${id}`);
      return null;
    }

    return data.paciente || null;
  } catch (error) {
    return null;
  }
});
  const [consultas, setConsultas] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);

  const inicioAtencionRef = useRef(new Date());
  const [segundosAtencion, setSegundosAtencion] = useState(0);

  const [diagnosticosSeleccionados, setDiagnosticosSeleccionados] = useState([]);
  const [busquedaDiagnostico, setBusquedaDiagnostico] = useState("");
  const [historia, setHistoria] = useState("");

  const [nuevoDiagnostico, setNuevoDiagnostico] = useState("");
  const [consultaEditando, setConsultaEditando] = useState(null);
  
  const [diagnosticoRecienteId, setDiagnosticoRecienteId] = useState(null);
  const diagnosticosBoxRef = useRef(null);
  const consultasRegistradasRef = useRef(null);
  const sincronizandoAgendaHoyRef = useRef(false);
  const [consultaAbierta, setConsultaAbierta] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState("Consulta guardada");
  const cambiosSinGuardarRef = useRef(false);
const [hayCambiosSinGuardar, setHayCambiosSinGuardar] = useState(false);

const marcarConsultaComoModificada = () => {
  cambiosSinGuardarRef.current = true;
  setHayCambiosSinGuardar(true);
};

const marcarConsultaComoGuardada = () => {
  cambiosSinGuardarRef.current = false;
  setHayCambiosSinGuardar(false);
};

const limpiarMarcaCambiosConsulta = () => {
  cambiosSinGuardarRef.current = false;
  setHayCambiosSinGuardar(false);
};

const confirmarSalidaConCambios = async () => {
  if (!cambiosSinGuardarRef.current) return true;

  const result = await Swal.fire({
    icon: "warning",
    title: "Consulta sin guardar",
    html: `
      <div style="text-align:center">
        Hay una evolución con cambios sin guardar.<br/>
        Si sales ahora, podrías perder lo escrito.
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Salir igual",
    cancelButtonText: "Seguir escribiendo",
    reverseButtons: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#079db2",
    customClass: {
      popup: "modal-consulta-sin-guardar"
    }
  });

  return result.isConfirmed;
};

useEffect(() => {
  const bloquearCierre = (e) => {
    if (!cambiosSinGuardarRef.current) return;

    e.preventDefault();
    e.returnValue = "";
    return "";
  };

  window.addEventListener("beforeunload", bloquearCierre);

  return () => {
    window.removeEventListener("beforeunload", bloquearCierre);
  };
}, []);

  const guardandoConsultaRef = useRef(false);
const [guardandoConsulta, setGuardandoConsulta] = useState(false);

  useEffect(() => {
    const obtenerPaciente = async () => {
      const ref = doc(db, "historiasClinicas", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setPaciente(snap.data());
      }
    };

    obtenerPaciente();

    const consultasRef = collection(
      db,
      "historiasClinicas",
      id,
      "consultas"
    );

    const unsubConsultas = onSnapshot(consultasRef, (snap) => {
      const datos = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      datos.sort((a, b) => {
        const fechaA = new Date(a.fecha?.split("/").reverse().join("-"));
        const fechaB = new Date(b.fecha?.split("/").reverse().join("-"));
        return fechaB - fechaA;
      });

      setConsultas(datos);
    });

    const diagRef = collection(db, "diagnosticos");

    const unsubDiag = onSnapshot(diagRef, (snap) => {
      const datos = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      datos.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", {
          sensitivity: "base"
        })
      );

      setDiagnosticos(datos);
    });

    return () => {
      unsubConsultas();
      unsubDiag();
    };
  }, [id]);

const convertirFechaNacimientoADate = (valor = "") => {
  if (!valor) return null;

  const texto = valor.toString().trim();

  // Formato viejo: AAAA-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [anio, mes, dia] = texto.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  }

  // Formato con slash tipo: AAAA/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(texto)) {
    const [anio, mes, dia] = texto.split("/").map(Number);
    return new Date(anio, mes - 1, dia);
  }

  // Formato nuevo: DD-MM-AAAA o DD/MM/AAAA
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(texto)) {
    const partes = texto.split(/[-/]/).map(Number);
    const [dia, mes, anio] = partes;
    return new Date(anio, mes - 1, dia);
  }

  const fechaTemporal = new Date(texto);
  return isNaN(fechaTemporal.getTime()) ? null : fechaTemporal;
};

const calcularEdad = (fecha) => {
  const nacimiento = convertirFechaNacimientoADate(fecha);

  if (!nacimiento) return null;

  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 && hoy.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
};

  const obtenerIconoSexo = () => {
    const sexo = paciente?.sexo?.toLowerCase()?.trim();

    if (sexo === "femenino" || sexo === "f") {
      return userFemale;
    }

    return userMale;
  };

const formatearFecha = (valor = "") => {
  if (!valor) return "";

  const fecha = convertirFechaNacimientoADate(valor);

  if (!fecha) return valor;

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
};

  const plantillas = {
    aptitudfisica: `
Por medio de la presente certifico que la Sra./Sr.
DNI Nº:
ha sido evaluada/o mediante interrogatorio clínico , examen físico completo , laboratorio y electrocardiograma en el día de la fecha, no encontrándose alteraciones clínicas que contraindiquen la realización de actividades laborales /academicas 
En base a lo expuesto, se considera APTO/A desde el punto de vista clínico para el desempeño de tareas en el ámbito …….
Se extiende el presente certificado a solicitud del interesado/a para ser presentado ante las autoridades correspondientes:
`,

    primeravez: `
VIVE EN 

OCUPACION : 
APF: 
APP :
FUMA : 
HIJOS :
ABORTOS :
CIRUGIAS : 
FRACTURAS : 
FUM : 

ACTIVIDAD FÍSICA : 

MEDICACIÓN HABITUAL :

ENFERMEDAD ACTUAL :

EXAMEN FISICO:
PESO:

EXAMENES COMPLEMENTARIOS:

IDX :

CONDUCTA:
`,

    evolucion: `
Paciente en mención el día de la fecha acudió a consultorios de reumatología para valoración médica .
    `,

    reposo: `
Certifico que la paciente en mención fue evaluada/o en el día de la fecha, cursando un cuadro clínico compatible con 
Lo que justifica su inasistencia a sus actividades habituales 
Se indica reposo médico  por 24 horas 
Se extiende el presente certificado a solicitud del interesado/a para ser presentado ante quien corresponda.
`,

    receta: `
Rp/
Ibuprofeno 400 mg  
Tomar 1 comprimido cada 8 horas por 5 días  

Omeprazol 20 mg  
Tomar 1 cápsula en ayunas por 7 días  

Indicaciones: Reposo relativo
`
  };

  const usarPlantilla = (nombre) => {
    setHistoria(plantillas[nombre] || "");
    marcarConsultaComoModificada();
  };

  useEffect(() => {
  if (consultaEditando) return;
  if (historia.trim()) return;

  setHistoria(plantillas.primeravez.trim());
}, [consultaEditando]);

const toggleDiagnostico = (nombre) => {
  marcarConsultaComoModificada();

  const nombreFormateado = nombre.toUpperCase();

  setDiagnosticosSeleccionados((prev) =>
    prev.includes(nombreFormateado)
      ? prev.filter((d) => d !== nombreFormateado)
      : [...prev, nombreFormateado]
  );
};

const limpiarFormularioConsulta = () => {
  marcarConsultaComoGuardada();

  setHistoria(plantillas.primeravez.trim());
  setDiagnosticosSeleccionados([]);
  setConsultaEditando(null);
};

const obtenerDiagnosticosConsulta = (consulta) => {
  if (Array.isArray(consulta.diagnosticos) && consulta.diagnosticos.length > 0) {
    return consulta.diagnosticos;
  }

  if (consulta.diagnostico) {
    return consulta.diagnostico
      .split(" - ")
      .map((d) => d.trim())
      .filter(Boolean);
  }

  return [];
};

const textoDiagnosticosConsulta = (consulta) => {
  const lista = obtenerDiagnosticosConsulta(consulta);

  if (lista.length === 0) {
    return "Consulta médica";
  }

  return lista.join(" - ");
};

const convertirConsultaADateResumen = (consulta) => {
  const fecha = consulta.fecha || consulta.fechaConsulta || "";
  const hora = consulta.hora || "00:00";

  let fechaDate = null;

  if (consulta.creado?.toDate) {
    fechaDate = consulta.creado.toDate();
  } else if (consulta.createdAt?.toDate) {
    fechaDate = consulta.createdAt.toDate();
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
    const [dia, mes, anio] = fecha.split("/").map(Number);
    fechaDate = new Date(anio, mes - 1, dia);
  } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(fecha)) {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    fechaDate = new Date(anio, mes - 1, dia);
  }

  if (!fechaDate || isNaN(fechaDate.getTime())) return null;

  const matchHora = hora.toString().match(/^(\d{1,2}):(\d{2})/);

  if (matchHora) {
    fechaDate.setHours(Number(matchHora[1]), Number(matchHora[2]), 0, 0);
  }

  return fechaDate;
};

const formatearFechaResumenPaciente = (fechaDate) => {
  return fechaDate
    .toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric"
    })
    .replace(",", "")
    .replace(/^./, (letra) => letra.toUpperCase());
};

const recalcularResumenPaciente = async () => {
  const consultasSnap = await getDocs(
    collection(db, "historiasClinicas", id, "consultas")
  );

  const diagnosticosSet = new Set();
  let ultimaConsulta = null;

  consultasSnap.docs.forEach((consultaDoc) => {
    const consulta = {
      id: consultaDoc.id,
      ...consultaDoc.data()
    };

    obtenerDiagnosticosConsulta(consulta).forEach((diag) => {
      const limpio = diag?.toString().trim().toUpperCase();
      if (limpio) diagnosticosSet.add(limpio);
    });

    const fechaDate = convertirConsultaADateResumen(consulta);

    if (fechaDate) {
      if (!ultimaConsulta || fechaDate > ultimaConsulta.fechaDate) {
        ultimaConsulta = {
          fechaDate,
          hora: consulta.hora || ""
        };
      }
    }
  });

  const cantidadConsultas = consultasSnap.docs.length;

  const diagnosticosResumen = Array.from(diagnosticosSet).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  const ultimaConsultaTexto = ultimaConsulta
    ? `${formatearFechaResumenPaciente(ultimaConsulta.fechaDate)}${
        ultimaConsulta.hora ? ` - ${ultimaConsulta.hora} hs` : ""
      }`
    : "";

  await updateDoc(doc(db, "historiasClinicas", id), {
    cantidadConsultas,
    diagnosticosResumen,
    ultimaConsultaTexto,
    ultimaConsultaAtMillis: ultimaConsulta?.fechaDate?.getTime() || 0,
    resumenActualizadoAt: new Date()
  });
};

/*
useEffect(() => {
  if (!paciente) return;
  if (!Array.isArray(consultas)) return;

  const cantidadReal = consultas.length;
  const cantidadResumen = Number(paciente.cantidadConsultas || 0);

  if (cantidadReal !== cantidadResumen) {
    recalcularResumenPaciente();
  }
}, [paciente, consultas.length]);
*/

useEffect(() => {
  if (!diagnosticoRecienteId) return;

  const timer = setTimeout(() => {
    const elemento = diagnosticosBoxRef.current?.querySelector(
      `[data-diagnostico-id="${diagnosticoRecienteId}"]`
    );

    if (elemento) {
      elemento.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, 400);

  return () => clearTimeout(timer);
}, [diagnosticos, diagnosticoRecienteId]);

const agregarDiagnostico = async () => {
  if (!nuevoDiagnostico.trim()) return;

  const nombre = nuevoDiagnostico.trim().toUpperCase();

  const diagnosticoExistente = diagnosticos.find(
    (d) => d.nombre?.trim().toUpperCase() === nombre
  );

  if (diagnosticoExistente) {
    setDiagnosticosSeleccionados((prev) =>
      prev.includes(nombre) ? prev : [...prev, nombre]
    );

    setBusquedaDiagnostico("");
    setNuevoDiagnostico("");
    setDiagnosticoRecienteId(diagnosticoExistente.id);

    setTimeout(() => {
      setDiagnosticoRecienteId(null);
    }, 3000);

    return;
  }

  const nuevoRef = await addDoc(collection(db, "diagnosticos"), {
    nombre
  });

  setDiagnosticosSeleccionados((prev) =>
    prev.includes(nombre) ? prev : [...prev, nombre]
  );

  setBusquedaDiagnostico("");
  setDiagnosticoRecienteId(nuevoRef.id);
  setNuevoDiagnostico("");

  setTimeout(() => {
    setDiagnosticoRecienteId(null);
  }, 3000);
};


const eliminarDiagnostico = async (diagnostico) => {
  const nombre = diagnostico.nombre?.toUpperCase() || "";

  if (!nombre) return;

  const confirmar = window.confirm(
    `¿Eliminar el diagnóstico "${nombre}" de la lista?`
  );

  if (!confirmar) return;

  await deleteDoc(doc(db, "diagnosticos", diagnostico.id));

  setDiagnosticosSeleccionados((prev) =>
    prev.filter((d) => d !== nombre)
  );
};

const obtenerFechaHoyLocal = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();

  return new Date(ahora.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const limpiarDni = (valor = "") => {
  return valor.toString().replace(/\D/g, "");
};

const buscarTelefonoPrevioPorDni = async () => {
  if (!paciente?.dni) return "";

  const dniPaciente = limpiarDni(paciente.dni);

  const snap = await getDocs(collection(db, "citas"));

  const citasDelPaciente = snap.docs
    .map((d) => ({
      id: d.id,
      ...d.data()
    }))
    .filter((cita) => {
      const dniCita = limpiarDni(cita.Dni || cita.dni);
      return dniCita && dniCita === dniPaciente && cita.telefono;
    })
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha || "1900-01-01"}T${a.hora || "00:00"}`);
      const fechaB = new Date(`${b.fecha || "1900-01-01"}T${b.hora || "00:00"}`);

      return fechaB - fechaA;
    });

  return citasDelPaciente[0]?.telefono || "";
};

const marcarCitaComoAsistio = async (consultaGuardada = {}) => {
  if (!paciente) return;

  const hoy = obtenerFechaHoyLocal();

  const datosAsistencia = {
    estadoCita: "asistio",
    estadoAsistencia: "asistio",
    estadoConfirmacion: "confirmado",
    asistenciaActualizadaAt: new Date(),
    historiaClinicaId: id
  };

  const dniPaciente = limpiarDni(paciente.dni || paciente.Dni || "");

  const normalizarNombrePaciente = (valor = "") =>
    valor
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const nombrePaciente = normalizarNombrePaciente(paciente.nombre || "");

  const q = query(
    collection(db, "citas"),
    where("fecha", "==", hoy)
  );

  const snap = await getDocs(q);

  const citasDelPacienteHoy = snap.docs
    .map((d) => ({
      id: d.id,
      ...d.data()
    }))
    .filter((cita) => {
      const historiaIdCita = cita.historiaClinicaId || cita.pacienteId || "";

      if (historiaIdCita && historiaIdCita === id) {
        return true;
      }

      const dniCita = limpiarDni(cita.Dni || cita.dni || cita.DNI || "");

      if (dniPaciente && dniCita && dniPaciente === dniCita) {
        return true;
      }

      const nombreCita = normalizarNombrePaciente(cita.nombre || "");

      return nombrePaciente && nombreCita && nombrePaciente === nombreCita;
    });

  if (citasDelPacienteHoy.length > 0) {
    for (const cita of citasDelPacienteHoy) {
      await updateDoc(doc(db, "citas", cita.id), datosAsistencia);
    }

    return;
  }

  const horaAtencion =
    consultaGuardada.hora ||
    new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

  const telefonoPrevio = await buscarTelefonoPrevioPorDni();

  await addDoc(collection(db, "citas"), {
    nombre: paciente.nombre || "",
    Dni: paciente.dni || paciente.Dni || "",
    telefono: paciente.telefono || telefonoPrevio || "",

    fecha: hoy,
    hora: "00:00",
    horaAtencion,

    sinAgenda: true,
    origen: "sinAgenda",

    tipo: "presencial",

    fechaNacimiento: paciente.fechaNacimiento || "",
    obraSocial: paciente.obraSocial || "",
    sexo: paciente.sexo || "",

    motivoConsulta: "Sin cita / Atención espontánea",

    ...datosAsistencia,

    createdAt: new Date()
  });
};

const guardarConsulta = async (e) => {
  e.preventDefault();

  if (guardandoConsultaRef.current) return;

  guardandoConsultaRef.current = true;
  setGuardandoConsulta(true);

  try {
    const diagnosticosFinales = diagnosticosSeleccionados.map((d) =>
      d.toUpperCase()
    );

    if (diagnosticosFinales.length === 0) {
      alert("Selecciona al menos un diagnóstico.");
      return;
    }

    const dataConsulta = {
      fecha: consultaEditando?.fecha || new Date().toLocaleDateString("es-AR"),
      hora: consultaEditando?.hora || new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
      diagnosticos: diagnosticosFinales,
      diagnostico: diagnosticosFinales.join(" - "),
      historia,
      actualizado: new Date()
    };

    if (consultaEditando) {
      await updateDoc(
        doc(db, "historiasClinicas", id, "consultas", consultaEditando.id),
        dataConsulta
      );

      // ✅ La consulta ya quedó guardada: apagar alerta inmediatamente
      marcarConsultaComoGuardada();

      try {
        await recalcularResumenPaciente();
      } catch (errorResumen) {
        console.error("La consulta se guardó, pero no se pudo recalcular resumen:", errorResumen);
      }

      try {
        await marcarCitaComoAsistio(dataConsulta);
      } catch (errorAgenda) {
        console.error("La consulta se guardó, pero no se pudo sincronizar con agenda:", errorAgenda);
      }

      limpiarFormularioConsulta();
      setMensajeGuardado("Consulta actualizada");
      setMostrarModal(true);

      setTimeout(() => {
        setMostrarModal(false);
      }, 2500);

      return;
    }

    await addDoc(collection(db, "historiasClinicas", id, "consultas"), {
      ...dataConsulta,
      creado: new Date()
    });

    // ✅ La consulta ya quedó guardada: apagar alerta inmediatamente
    marcarConsultaComoGuardada();

    try {
      await recalcularResumenPaciente();
    } catch (errorResumen) {
      console.error("La consulta se guardó, pero no se pudo recalcular resumen:", errorResumen);
    }

    try {
      await marcarCitaComoAsistio(dataConsulta);
    } catch (errorAgenda) {
      console.error("La consulta se guardó, pero no se pudo sincronizar con agenda:", errorAgenda);
    }

    limpiarFormularioConsulta();
    setMensajeGuardado("Consulta guardada");
    setMostrarModal(true);

    setTimeout(() => {
      setMostrarModal(false);
    }, 2500);
  } catch (error) {
    console.error("Error guardando consulta:", error);
    alert("No se pudo guardar la consulta. Revisá la consola.");
  } finally {
    guardandoConsultaRef.current = false;
    setGuardandoConsulta(false);
  }
};

const eliminarConsulta = async (cid) => {
  if (window.confirm("¿Eliminar consulta?")) {
    await deleteDoc(
      doc(db, "historiasClinicas", id, "consultas", cid)
    );

    await recalcularResumenPaciente();
  }
};

const editarConsulta = (consulta) => {
  setConsultaEditando(consulta);
  setHistoria(consulta.historia || "");
  setDiagnosticosSeleccionados(
    obtenerDiagnosticosConsulta(consulta).map((d) => d.toUpperCase())
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

const cancelarEdicionConsulta = async () => {
  const puedeCancelar = await confirmarSalidaConCambios();

  if (!puedeCancelar) return;

  limpiarFormularioConsulta();
  limpiarMarcaCambiosConsulta();
};

const generarPDF = (consulta) => {
  const pdf = new jsPDF("p", "mm", "a4");

  const anchoPagina = 210;
  const altoPagina = 297;

  const margenIzq = 14;
  const margenDer = 196;
  const anchoUtil = margenDer - margenIzq;

  const celeste = [9, 154, 173];
  const grisTexto = [70, 70, 70];
  const grisClaro = [245, 248, 249];

  const edad = calcularEdad(paciente.fechaNacimiento);

  // ============================================
  // HEADER PROFESIONAL
  // ============================================
  const dibujarHeader = () => {
    pdf.setTextColor(0, 0, 0);

    // Logo más compacto
    pdf.addImage(logo, "PNG", 14, 9, 20, 20);

    // Marca
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(...celeste);
    pdf.text("DR. REUMA", 40, 14);

    // Médico
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Dr. Tony Vélez", 40, 19);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...grisTexto);

    pdf.text(
      "Especialista en Reumatología y Enfermedades Autoinmunes",
      40,
      24
    );

    pdf.text(
      "Consultorios Externos · Clínica San Agustín · Neuquén",
      40,
      28
    );

    // Matrículas a la derecha
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(0, 0, 0);

    pdf.text("REUMATÓLOGO", 196, 14, {
      align: "right"
    });

    pdf.setFont("helvetica", "normal");

    pdf.text("MN 178050", 196, 19, {
      align: "right"
    });

    pdf.text("MP 9762", 196, 23, {
      align: "right"
    });

    pdf.text("ME 5655", 196, 27, {
      align: "right"
    });

    // Línea institucional
    pdf.setDrawColor(...celeste);
    pdf.setLineWidth(0.8);
    pdf.line(margenIzq, 33, margenDer, 33);
  };

  // ============================================
  // FOOTER GENERAL
  // ============================================

  const dibujarFooter = (pagina, totalPaginas) => {
  const yFooter = 281;

  pdf.setDrawColor(210, 220, 223);
  pdf.setLineWidth(0.25);

  pdf.line(
    margenIzq,
    yFooter,
    margenDer,
    yFooter
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);

  pdf.text(
    "Dr. Tony Vélez · Reumatología y Enfermedades Autoinmunes",
    margenIzq,
    yFooter + 5
  );

  pdf.text(
    `Página ${pagina} de ${totalPaginas}`,
    margenDer,
    yFooter + 5,
    {
      align: "right"
    }
  );

  pdf.setTextColor(0, 0, 0);
};

  // ============================================
  // PRIMERA PÁGINA
  // ============================================
  dibujarHeader();

  let y = 43;

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);

  pdf.text("HISTORIA CLÍNICA · CONSULTA MÉDICA", margenIzq, y);

  y += 6;

  // ============================================
  // DATOS PACIENTE - COMPACTO
  // ============================================
  pdf.setFillColor(...grisClaro);
  pdf.setDrawColor(220, 225, 228);

  pdf.roundedRect(
    margenIzq,
    y,
    anchoUtil,
    31,
    2,
    2,
    "FD"
  );

  const yDatos = y + 7;

  const escribirDato = (label, valor, x, yy) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...grisTexto);

    pdf.text(label, x, yy);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    pdf.text(
      String(valor || "-"),
      x + 24,
      yy
    );
  };

  escribirDato(
    "Paciente:",
    paciente.nombre,
    18,
    yDatos
  );

  escribirDato(
    "DNI:",
    paciente.dni,
    112,
    yDatos
  );

  escribirDato(
    "Nacimiento:",
    formatearFecha(paciente.fechaNacimiento),
    18,
    yDatos + 7
  );

  escribirDato(
    "Edad:",
    edad !== null ? `${edad} años` : "-",
    112,
    yDatos + 7
  );

  escribirDato(
    "Obra social:",
    paciente.obraSocial,
    18,
    yDatos + 14
  );

  escribirDato(
    "Sexo:",
    paciente.sexo,
    112,
    yDatos + 14
  );

  escribirDato(
    "Fecha:",
    consulta.fecha,
    18,
    yDatos + 21
  );

  if (consulta.hora) {
    escribirDato(
      "Hora:",
      `${consulta.hora} hs`,
      112,
      yDatos + 21
    );
  }

  y += 39;

  // ============================================
  // DIAGNÓSTICO
  // ============================================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...celeste);

  pdf.text("DIAGNÓSTICO", margenIzq, y);

  y += 6;

  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);

  const diagnostico = pdf.splitTextToSize(
    textoDiagnosticosConsulta(consulta).toUpperCase(),
    anchoUtil
  );

  pdf.text(diagnostico, margenIzq, y);

  y += diagnostico.length * 5 + 5;

  // Línea fina
  pdf.setDrawColor(225, 225, 225);
  pdf.line(margenIzq, y, margenDer, y);

  y += 8;

  // ============================================
  // EVOLUCIÓN
  // ============================================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...celeste);

  pdf.text("EVOLUCIÓN / NOTA MÉDICA", margenIzq, y);

  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(20, 20, 20);

  const lineas = pdf.splitTextToSize(
    consulta.historia || "",
    anchoUtil
  );

  lineas.forEach((linea) => {
    // Reservamos lugar abajo para firma + footer
    if (y > 246) {
      pdf.addPage();
      dibujarHeader();

      y = 44;
    }

    pdf.text(linea, margenIzq, y);
    y += 5.2;
  });

  const formatearFechaDocumentoCorta = (valor) => {
  if (!valor) {
    const hoy = new Date();

    return `${hoy.getDate()}/${hoy.getMonth() + 1}/${String(
      hoy.getFullYear()
    ).slice(-2)}`;
  }

  const texto = valor.toString().trim();

  // DD/MM/AAAA
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(texto)) {
    const [dia, mes, anio] = texto.split("/");

    return `${Number(dia)}/${Number(mes)}/${anio.slice(-2)}`;
  }

  // DD-MM-AAAA
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(texto)) {
    const [dia, mes, anio] = texto.split("-");

    return `${Number(dia)}/${Number(mes)}/${anio.slice(-2)}`;
  }

  // AAAA-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(texto)) {
    const [anio, mes, dia] = texto.split("-");

    return `${Number(dia)}/${Number(mes)}/${anio.slice(-2)}`;
  }

  return texto;
};

// ============================================
// FIRMA + VALIDACIÓN DEL DOCUMENTO
// ============================================

// Espacio mínimo necesario para firma + texto institucional
const espacioFirma = 53;

// Si no entra completo, pasamos a otra página
if (y + espacioFirma > 270) {
  pdf.addPage();
  dibujarHeader();
  y = 46;
}

// La firma queda CERCA del final del texto
const yFirma = y + 9;

// ============================================
// BLOQUE IZQUIERDO - VALIDACIÓN / CONTACTO
// ============================================

pdf.setFont("helvetica", "italic");
pdf.setFontSize(7.5);
pdf.setTextColor(55, 55, 55);

const textoFirmaElectronica =
  "Este documento ha sido firmado electrónica o digitalmente según corresponda - por Dr. Tony Vélez";

const lineasFirmaElectronica = pdf.splitTextToSize(
  textoFirmaElectronica,
  92
);

pdf.text(
  lineasFirmaElectronica,
  margenIzq,
  yFirma + 8
);

let yInstitucional =
  yFirma + 8 + lineasFirmaElectronica.length * 3.8 + 3;

// Correo
pdf.setFont("helvetica", "bold");
pdf.setFontSize(7.5);
pdf.setTextColor(30, 30, 30);

pdf.text(
  "tonygregoryvelez@gmail.com",
  margenIzq,
  yInstitucional
);

yInstitucional += 5;

// Institución
pdf.setFont("helvetica", "normal");
pdf.setTextColor(70, 70, 70);

pdf.text(
  "Consultorios Externos · Clínica San Agustín",
  margenIzq,
  yInstitucional
);

yInstitucional += 5;

// Fecha del documento
pdf.setFont("helvetica", "bold");
pdf.setTextColor(0, 0, 0);

pdf.text(
  formatearFechaDocumentoCorta(consulta.fecha),
  margenIzq,
  yInstitucional
);

// ============================================
// BLOQUE DERECHO - FIRMA PROFESIONAL
// ============================================

pdf.addImage(
  firma,
  "PNG",
  148,
  yFirma,
  27,
  14
);

pdf.setDrawColor(145, 145, 145);
pdf.setLineWidth(0.25);

pdf.line(
  135,
  yFirma + 16,
  188,
  yFirma + 16
);

pdf.setTextColor(0, 0, 0);

pdf.setFont("helvetica", "bold");
pdf.setFontSize(9);

pdf.text(
  "DR. TONY VÉLEZ",
  161.5,
  yFirma + 21,
  {
    align: "center"
  }
);

pdf.setFontSize(8);

pdf.text(
  "MÉDICO · REUMATÓLOGO",
  161.5,
  yFirma + 25,
  {
    align: "center"
  }
);

pdf.setFont("helvetica", "normal");
pdf.setFontSize(7.5);

pdf.text(
  "MN 178050 · MP 9762 · ME 5655",
  161.5,
  yFirma + 29,
  {
    align: "center"
  }
);
  // ============================================
  // FOOTER EN TODAS LAS PÁGINAS
  // ============================================
  const totalPaginas = pdf.getNumberOfPages();

  for (let i = 1; i <= totalPaginas; i++) {
    pdf.setPage(i);
    dibujarFooter(i, totalPaginas);
  }

  // Nombre seguro
  const nombreArchivo = (paciente.nombre || "Paciente")
    .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ-]/g, "")
    .replace(/\s+/g, "-");

  pdf.save(
    `Consulta-${nombreArchivo}-${consulta.fecha}.pdf`
  );
};

  const obtenerInicialDiagnostico = (nombre = "") => {
  const inicial = nombre.trim().charAt(0).toUpperCase();

  return inicial
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const diagnosticosFiltrados = diagnosticos.filter((d) => {
  const nombre = d.nombre?.toUpperCase() || "";
  const texto = busquedaDiagnostico.trim().toUpperCase();

  return nombre.includes(texto);
});

const diagnosticosAgrupados = diagnosticosFiltrados.reduce((grupos, d, index) => {
  const nombre = d.nombre?.toUpperCase() || "";
  const inicial = obtenerInicialDiagnostico(nombre);

  if (!grupos[inicial]) {
    grupos[inicial] = [];
  }

  grupos[inicial].push({
    ...d,
    nombreMostrar: nombre,
    numero: index + 1
  });

  return grupos;
}, {});

const formatearFechaHoraConsultaPaciente = (consulta) => {
  const convertirFecha = (valor) => {
    if (!valor) return null;

    if (valor?.toDate) return valor.toDate();

    if (valor instanceof Date) return valor;

    if (typeof valor === "string") {
      const limpio = valor.trim();

      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(limpio)) {
        const [anio, mes, dia] = limpio.split("-").map(Number);
        return new Date(anio, mes - 1, dia);
      }

      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(limpio)) {
        const [dia, mes, anio] = limpio.split("/").map(Number);
        return new Date(anio, mes - 1, dia);
      }
    }

    return null;
  };

  const fechaDate =
    convertirFecha(consulta.fecha) ||
    convertirFecha(consulta.fechaConsulta) ||
    convertirFecha(consulta.creado) ||
    convertirFecha(consulta.createdAt);

  if (!fechaDate) return consulta.fecha || "Sin fecha";

  const fechaTexto = fechaDate
    .toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric"
    })
    .replace(",", "")
    .replace(/^./, (letra) => letra.toUpperCase());

  const horaTexto = consulta.hora ? ` - ${consulta.hora} hs` : "";

  return `${fechaTexto}${horaTexto}`.toUpperCase();
};

const fechaHoyHistoriaPacienteTexto = new Date()
  .toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })
  .replace(",", "")
  .replace(/^./, (letra) => letra.toUpperCase());


  useEffect(() => {
  const intervalo = setInterval(() => {
    const segundos = Math.floor(
      (new Date() - inicioAtencionRef.current) / 1000
    );

    setSegundosAtencion(segundos);
  }, 1000);

  return () => clearInterval(intervalo);
}, []);

const formatearTiempoAtencion = (segundos) => {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const seg = segundos % 60;

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
    2,
    "0"
  )}:${String(seg).padStart(2, "0")}`;
};

const reiniciarContadorAtencion = () => {
  inicioAtencionRef.current = new Date();
  setSegundosAtencion(0);
};

const irAConsultasRegistradas = () => {
  consultasRegistradasRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};

const cantidadConsultas = consultas.length;

  return (
    <div className="historia-paciente-page">

      {mostrarModal && (
  <div className="historia-save-overlay">
    <div className="historia-save-card">

      <div className="historia-save-check">
        <span>✓</span>
      </div>

      <h4>{mensajeGuardado}</h4>

      <p>
        Los cambios se registraron correctamente.
      </p>

    </div>
  </div>
)}

{!paciente ? (
  <div className="historia-loading-page">
    <div className="historia-loading-card">
      <img
        src={logo}
        alt="Dr. Reuma"
        className="historia-loading-logo"
      />

      <div className="historia-loading-spinner"></div>

      <h3>Cargando historia clínica</h3>
      <p>Preparando los datos del paciente...</p>
    </div>
  </div>
) : (
  <div className="container-fluid historia-paciente-container py-4 mb-5">
          {/* HEADER */}
          <div className="historia-paciente-hero">
  <div className="historia-paciente-hero-texto">
    <div className="historia-paciente-badge">
      <FaFilePdf />
      <span>Historia clínica digital</span>
    </div>

    <h1 className="subtitle-general text-start mb-2">
      <span className="subtitle-celeste">HISTORIA CLÍNICA</span>{" "}
      <span className="subtitle-celeste">DEL PACIENTE</span>
    </h1>

    <div className="historia-paciente-fecha-hoy">
      {fechaHoyHistoriaPacienteTexto.toUpperCase()}
    </div>

    <p className="historia-paciente-subtitle">
      Registro evolutivo, plantillas médicas, diagnósticos y generación de PDF.
    </p>
  </div>

  <div className="historia-paciente-hero-actions">

 <Link
  to="/admin/citas"
  className="historia-header-action historia-header-agenda"
  onClick={async (e) => {
    e.preventDefault();

    const puedeSalir = await confirmarSalidaConCambios();

    if (puedeSalir) {
      navigate("/admin/citas");
    }
  }}
>
  <FaCalendarAlt />
  Agendar cita
</Link>

<Link
  to="/admin/historias"
  className="historia-header-action historia-header-volver"
  onClick={async (e) => {
    e.preventDefault();

    const puedeSalir = await confirmarSalidaConCambios();

    if (puedeSalir) {
      navigate("/admin/historias");
    }
  }}
>
  <FaFolderOpen />
  Historias clínicas
</Link>

  <button
    type="button"
    className="historia-paciente-action-card historia-paciente-action-counter"
    onClick={irAConsultasRegistradas}
    title="Ver consultas registradas"
  >
    <strong>{cantidadConsultas}</strong>
    <span>Consultas</span>
  </button>

</div>

</div>
<br />

          {/* CARD PACIENTE */}
          <div className="historia-paciente-card mb-4">

            <div className="historia-paciente-info-main">

              <img
                src={obtenerIconoSexo()}
                alt="usuario"
                className="historia-paciente-avatar"
              />

              <div>
                <h3>{paciente.nombre}</h3>

                <div className="historia-paciente-grid">

                  <div>
                    <span>Edad</span>
                    <strong>{calcularEdad(paciente.fechaNacimiento)} años</strong>
                  </div>

                  <div>
                    <span>DNI</span>
                    <strong>{paciente.dni}</strong>
                  </div>

                  <div>
                    <span>Nacimiento</span>
                    <strong>{formatearFecha(paciente.fechaNacimiento)}</strong>
                  </div>

                  <div>
                    <span>Obra social</span>
                    <strong>{paciente.obraSocial}</strong>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* NUEVA CONSULTA */}
          <form onSubmit={guardarConsulta}>

            <div className="row g-4">

              {/* PANEL IZQUIERDO */}
              <div className="col-12 col-lg-3">

                <div className="historia-side-panel">

                <h5 className="historia-panel-title">
  Plantillas rápidas
</h5>

<div className="historia-plantillas mb-4">

  <button
    type="button"
    onClick={() => usarPlantilla("primeravez")}
  >
    Historia Clínica
  </button>

  <button
    type="button"
    onClick={() => usarPlantilla("evolucion")}
  >
    Evolución Clínica
  </button>

  <button
    type="button"
    onClick={() => usarPlantilla("aptitudfisica")}
  >
    Certificado aptitud física
  </button>

  <button
    type="button"
    onClick={() => usarPlantilla("reposo")}
  >
    Reposo médico
  </button>

  <button
    type="button"
    onClick={() => usarPlantilla("receta")}
  >
    Receta médica
  </button>

</div>

<h5 className="historia-panel-title">
  Diagnósticos
</h5>

<div className="historia-buscador-diagnostico mb-3">
  <input
    type="text"
    className="form-control historia-input"
    placeholder="Buscar diagnóstico"
    value={busquedaDiagnostico}
    onChange={(e) => setBusquedaDiagnostico(e.target.value)}
  />

  {busquedaDiagnostico && (
    <button
      type="button"
      onClick={() => setBusquedaDiagnostico("")}
    >
      ×
    </button>
  )}
</div>

<div ref={diagnosticosBoxRef} className="historia-diagnosticos-box mb-3">

{diagnosticosFiltrados.length === 0 && (
  <div className="diagnostico-no-encontrado">
    No se encontraron diagnósticos
  </div>
)}

  {Object.keys(diagnosticosAgrupados).map((letra) => (
    <div key={letra} className="diagnostico-grupo">

      <div className="diagnostico-letra-sticky">
        {letra}
      </div>

      {diagnosticosAgrupados[letra].map((d) => (
      <div
        key={d.id}
        data-diagnostico-id={d.id}
        className={`historia-diagnostico-row ${
          diagnosticoRecienteId === d.id ? "diagnostico-reciente" : ""
        }`}
      >

  <label
    className={`historia-diagnostico-check ${
      diagnosticosSeleccionados.includes(d.nombreMostrar) ? "activo" : ""
    }`}
  >
    <input
      type="checkbox"
      checked={diagnosticosSeleccionados.includes(d.nombreMostrar)}
      onChange={() => toggleDiagnostico(d.nombreMostrar)}
    />

    <span>
      <strong className="diag-opcion-num">
        {d.numero}.
      </strong>{" "}
      {d.nombreMostrar}
    </span>
  </label>

  <button
    type="button"
    className="historia-delete-diagnostico-btn"
    onClick={() => eliminarDiagnostico(d)}
    title="Eliminar diagnóstico"
  >
    <FaTrash />
  </button>

</div>
      ))}

    </div>
  ))}

</div>

{diagnosticosSeleccionados.length > 0 && (
  <div className="historia-diagnosticos-seleccionados mb-3">
    {diagnosticosSeleccionados.map((d, index) => (
      <span key={`${d}-${index}`}>
        <strong className="diag-num">{index + 1}.</strong>
        {d.toUpperCase()}
      </span>
    ))}
  </div>
)}


                  <div className="historia-new-diagnostico mb-4">
                    <input
                      className="form-control historia-input"
                      placeholder="Nuevo diagnóstico"
                      value={nuevoDiagnostico}
                      onChange={(e) => setNuevoDiagnostico(e.target.value)}
                    />

                    <button
                      type="button"
                      className="historia-add-btn"
                      onClick={agregarDiagnostico}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="historia-save-consulta-btn mt-4"
                    disabled={guardandoConsulta}
                  >
                    <FaPlus className="me-2" />
                    {guardandoConsulta
                      ? "Guardando..."
                      : consultaEditando
                        ? "Actualizar consulta"
                        : "Guardar consulta"}
                  </button>

                  {consultaEditando && (
                    <button
                      type="button"
                      className="historia-cancelar-edicion-btn mt-2"
                      onClick={cancelarEdicionConsulta}
                    >
                      <FaTimes className="me-2" />
                      Cancelar edición
                    </button>
                  )}

                </div>

              </div>

              {/* TEXTAREA */}
              <div className="col-12 col-lg-9">

                <div className="historia-editor-card">

                  <div className="historia-editor-header historia-editor-header-con-tiempo">
                    <div>
                      <h5>Historia clínica</h5>
                      <p>
                        Escribe la evolución médica del paciente.
                      </p>
                    </div>

                    <div className="historia-tiempo-atencion historia-tiempo-editor">
                      <span>Tiempo con paciente</span>

                      <strong>
                        {formatearTiempoAtencion(segundosAtencion)}
                      </strong>

                      <button
                        type="button"
                        onClick={reiniciarContadorAtencion}
                      >
                        Reiniciar
                      </button>
                    </div>
                  </div>

                      <textarea
                        className="form-control historia-textarea-modern"
                        value={historia}
                        onChange={(e) => {
                          setHistoria(e.target.value);
                          marcarConsultaComoModificada();
                        }}
                        placeholder="Escribe aquí la historia clínica del paciente..."
                        required
                      />

                </div>

              </div>

            </div>

          </form>

          {/* CONSULTAS REGISTRADAS */}
          <div
            ref={consultasRegistradasRef}
            className="historia-consultas-section mt-5"
          >
            <div className="historia-consultas-header mb-3">
              <div>
                <h4>
                  Consultas registradas
                </h4>

                <p>
                  Evoluciones previas ordenadas desde la más reciente.
                </p>
              </div>
            </div>

            {consultas.length === 0 ? (
              <div className="historia-empty-consultas">
                <FaFilePdf />

                <h5>
                  No hay consultas registradas
                </h5>

                <p>
                  Cuando guardes una evolución aparecerá aquí.
                </p>
              </div>
            ) : (
              consultas.map((c) => (
                <div key={c.id} className="historia-consulta-card">

                  <div
                    className="historia-consulta-header"
                    onClick={() =>
                      setConsultaAbierta(
                        consultaAbierta === c.id ? null : c.id
                      )
                    }
                  >

                    <div>
                    <h5 className="consulta-fecha-titulo">
                      {formatearFechaHoraConsultaPaciente(c)}
                    </h5>

                        <div className="historia-consulta-diagnosticos mt-2">
                          {obtenerDiagnosticosConsulta(c).map((diag) => (
                            <small key={diag}>
                              {diag.toUpperCase()}
                            </small>
                          ))}
                        </div>
                    </div>

                    <div className="historia-consulta-arrow">
                      {consultaAbierta === c.id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>

                  </div>

                  {consultaAbierta === c.id && (
                    <div className="historia-consulta-body">

                      <p>
                        {c.historia}
                      </p>

                      <div className="historia-consulta-actions">

                        <button
                          type="button"
                          className="historia-edit-consulta"
                          onClick={() => editarConsulta(c)}
                        >
                          <FaPencilAlt />
                          Editar
                        </button>

                        <button
                          type="button"
                          className="historia-delete-consulta"
                          onClick={() => eliminarConsulta(c.id)}
                        >
                          <FaTrash />
                          Eliminar
                        </button>

                        <button
                          type="button"
                          className="historia-pdf-consulta"
                          onClick={() => generarPDF(c)}
                        >
                          <FaFilePdf />
                          Generar PDF
                        </button>

                      </div>

                    </div>
                  )}

                </div>
              ))
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default HistoriaPaciente;