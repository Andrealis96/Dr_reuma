import { useEffect,useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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

function HistoriaPaciente() {
  const { id } = useParams();
const [searchParams] = useSearchParams();

const citaIdAgenda = searchParams.get("citaId");

  const [paciente, setPaciente] = useState(null);
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

  const [consultaAbierta, setConsultaAbierta] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState("Consulta guardada");
  
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

  const calcularEdad = (fecha) => {
    if (!fecha) return "";

    const hoy = new Date();
    const nacimiento = new Date(`${fecha}T00:00:00`);

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

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";

    const [anio, mes, dia] = fechaISO.split("-");
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
VIVE EN NEUQUEN

OCUPACION : 
APF: 
APP :
PESO:

HTA : 
FUMA : 
HIJOS :
ABORTOS :
CIRUGIAS : 
FRACTURAS : 
FUM : 
GIMNASIA : 
ANTECEDENTES:

MEDICACIÓN HABITUAL :

ENFERMEDAD ACTUAL :

EXAMEN FISICO:



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
  };

  useEffect(() => {
  if (consultaEditando) return;
  if (historia.trim()) return;

  setHistoria(plantillas.primeravez.trim());
}, [consultaEditando]);

const toggleDiagnostico = (nombre) => {
  const nombreFormateado = nombre.toUpperCase();

  setDiagnosticosSeleccionados((prev) =>
    prev.includes(nombreFormateado)
      ? prev.filter((d) => d !== nombreFormateado)
      : [...prev, nombreFormateado]
  );
};

const limpiarFormularioConsulta = () => {
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

  const datosAsistencia = {
    estadoCita: "asistio",
    estadoAsistencia: "asistio",
    estadoConfirmacion: "confirmado",
    asistenciaActualizadaAt: new Date(),
    historiaClinicaId: id
  };

  // Caso 1: viene desde Pacientes de hoy con citaId
  if (citaIdAgenda) {
    await updateDoc(doc(db, "citas", citaIdAgenda), datosAsistencia);
    return;
  }

  // Caso 2: buscar si tiene cita hoy por DNI
  const hoy = obtenerFechaHoyLocal();

  const q = query(
    collection(db, "citas"),
    where("fecha", "==", hoy)
  );

  const snap = await getDocs(q);

  const dniPaciente = limpiarDni(paciente.dni);

  const citaDeHoy = snap.docs
    .map((d) => ({
      id: d.id,
      ...d.data()
    }))
    .find((cita) => {
      const dniCita = limpiarDni(cita.Dni || cita.dni);
      return dniPaciente && dniCita === dniPaciente;
    });

  // Si tenía cita, solo la marcamos como asistida
  if (citaDeHoy) {
    await updateDoc(doc(db, "citas", citaDeHoy.id), datosAsistencia);
    return;
  }

  // Caso 3: NO tenía cita, pero se atendió igual
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
    Dni: paciente.dni || "",
    telefono: paciente.telefono || telefonoPrevio || "",

    fecha: hoy,

    // 00:00 es solo para que salga arriba en la tabla.
    // No ocupa turnos reales.
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

await marcarCitaComoAsistio(dataConsulta);

  limpiarFormularioConsulta();
  setMensajeGuardado("Consulta guardada");
  setMostrarModal(true);

  setTimeout(() => {
    setMostrarModal(false);
  }, 2500);
};

  const eliminarConsulta = async (cid) => {
    if (window.confirm("¿Eliminar consulta?")) {
      await deleteDoc(
        doc(db, "historiasClinicas", id, "consultas", cid)
      );
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

const cancelarEdicionConsulta = () => {
  limpiarFormularioConsulta();
};

  const generarPDF = (consulta) => {
    const pdf = new jsPDF();
    const edad = calcularEdad(paciente.fechaNacimiento);

    const dibujarHeader = () => {
      pdf.addImage(logo, "PNG", 14, 10, 26, 26);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("DR. REUMA", 45, 18);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("Dr. Tony Vélez", 45, 24);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("Especialista en Reumatología y Enfermedades Autoinmunes", 45, 29);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("San Martín 1355 - Consultorios Externos de la Clínica San Agustín", 45, 34);

      pdf.setLineWidth(0.5);
      pdf.line(14, 38, 196, 38);
    };

    dibujarHeader();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("DATOS DEL PACIENTE:", 14, 48);

    const iconoUsuario = obtenerIconoSexo();
    pdf.addImage(iconoUsuario, "PNG", 160, 52, 28, 28);

    pdf.setDrawColor(220);
    pdf.rect(12, 50, 184, 45);

    let y = 58;

    const fila = (label, valor) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(label, 16, y);

      pdf.setFont("helvetica", "normal");
      pdf.text(valor || "-", 60, y);

      y += 6;
    };

    fila("Nombre:", paciente.nombre);
    fila("Edad:", `${edad} años`);
    fila("DNI:", paciente.dni);
    fila("Nacimiento:", formatearFecha(paciente.fechaNacimiento));
    fila("Obra social:", paciente.obraSocial);
    fila("Sexo:", paciente.sexo);

    pdf.line(14, y + 2, 196, y + 2);

    y += 12;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("CONSULTA MÉDICA", 14, y);

    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Fecha: ${consulta.fecha}`, 14, y);

    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(textoDiagnosticosConsulta(consulta).toUpperCase(), 105, y, {
    align: "center"
    });

    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const texto = pdf.splitTextToSize(consulta.historia || "", 180);

    texto.forEach((linea) => {
      if (y > 270) {
        pdf.addPage();
        dibujarHeader();
        y = 45;
      }

      pdf.text(linea, 14, y);
      y += 6;
    });

    if (y > 230) {
      pdf.addPage();
      dibujarHeader();
      y = 45;
    }

    pdf.addImage(firma, "PNG", 145, y, 28, 16);
    pdf.line(130, y + 18, 185, y + 18);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("DR. TONY VÉLEZ", 160, y + 24, {
      align: "center"
    });

    pdf.setFontSize(9);
    pdf.text("REUMATÓLOGO", 160, y + 29, {
      align: "center"
    });
    pdf.text("MN 178050", 160, y + 33, {
      align: "center"
    });
    pdf.text("MP 9762", 160, y + 37, {
      align: "center"
    });
    pdf.text("ME 5655", 160, y + 41, {
      align: "center"
    });

    /* Texto de contacto a la izquierda */
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
pdf.setTextColor(80, 80, 80);

pdf.text(
  "Para consultas sobre este documento:",
  14,
  y + 26
);

pdf.setFont("helvetica", "bold");
pdf.text(
  "tonygregoryvelez@gmail.com",
  14,
  y + 32
);

/* Volver a color negro normal */
pdf.setTextColor(0, 0, 0);

    const fechaActual = new Date().toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    const totalPaginas = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPaginas; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.text(`Documento generado: ${fechaActual}`, 14, 285);
      pdf.text(`Página ${i} de ${totalPaginas}`, 200, 285, {
        align: "right"
      });
    }

    pdf.save(`Consulta-${paciente.nombre}-${consulta.fecha}.pdf`);
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

      {!paciente ? null : (
        <div className="container-fluid historia-paciente-container py-4 mb-5">

          {/* HEADER */}
          <div className="historia-paciente-header mb-4">

            <div>
              <div className="historia-paciente-badge">
                <FaFilePdf />
                Historia clínica digital
              </div>

              <h2 className="subtitle-general text-start mb-2">
                <span className="subtitle-celeste">HISTORIA CLÍNICA</span>{" "}
                <span className="subtitle-celeste">DEL PACIENTE</span>
              </h2>

              <div className="historia-paciente-fecha-hoy">
                {fechaHoyHistoriaPacienteTexto.toUpperCase()}
              </div>

              <p className="historia-paciente-subtitle">
                Registro evolutivo, plantillas médicas, diagnósticos y generación de PDF.
              </p>
            </div>

            <div className="historia-paciente-header-actions">

  <Link
    to="/admin/citas"
    className="historia-header-action historia-header-agenda"
  >
    <FaCalendarAlt />
    Agendar cita
  </Link>

  <Link
    to="/admin/historias"
    className="historia-header-action historia-header-volver"
  >
    <FaFolderOpen />
    Historias clínicas
  </Link>

  <button
    type="button"
    className="historia-paciente-count historia-paciente-count-btn"
    onClick={irAConsultasRegistradas}
    title="Ver consultas registradas"
  >
    <strong>{consultas.length}</strong>
    <span>Consultas</span>
  </button>

</div>

          </div>

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

                  <button className="historia-save-consulta-btn mt-4">
                    <FaPlus className="me-2" />
                    {consultaEditando ? "Actualizar consulta" : "Guardar consulta"}
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
                    onChange={(e) => setHistoria(e.target.value)}
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