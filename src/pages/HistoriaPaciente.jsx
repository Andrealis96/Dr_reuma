import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase";

import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaFilePdf,
  FaPencilAlt,
  FaTimes
} from "react-icons/fa";

import jsPDF from "jspdf";
import logo from "../assets/DrReumaLogo.png";
import firma from "../assets/firma.png";
import userMale from "../assets/user-male.png";
import userFemale from "../assets/user-female.png";

function HistoriaPaciente() {
  const { id } = useParams();

  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);

  const [diagnosticosSeleccionados, setDiagnosticosSeleccionados] = useState([]);
  const [historia, setHistoria] = useState("");
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState("");
  const [consultaEditando, setConsultaEditando] = useState(null);

  const [consultaAbierta, setConsultaAbierta] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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
Antecedentes :
Medicacion habitual reumatologica : 
Enfermedad actual :
Examen fisico :
-Musculoesqueletico : 
    Rigidez matinal: NO
    Deformidades: NO
    Limitacion articular :NO
    Artralgias o Artritis :NO
    Lasegue : negativo
    Fabere :negativo
    Otras manifestaciones Musculoesqueleticas : NO
-Lesiones cutaneas : NO
-Respiratorio : Bmv , beab , sra , sat 98 % 
-Cardiovascular : R1 R2 4 focos , silencios libres 
-Abdomen: Blando, depresible , diuresis y catarsis conservada
-Neurologico : Sin foco neurologico aparente
Examenes complementarios de relevancia reumatologica:
Impresion diagnostica y nota evolutiva:
Conducta :
Medidas Generales 
Pautas de Alarma 
Actividad Fisica 
Dieta mediterranea 
Si dolor Paracetamol 1g
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

const toggleDiagnostico = (nombre) => {
  const nombreFormateado = nombre.toUpperCase();

  setDiagnosticosSeleccionados((prev) =>
    prev.includes(nombreFormateado)
      ? prev.filter((d) => d !== nombreFormateado)
      : [...prev, nombreFormateado]
  );
};

const limpiarFormularioConsulta = () => {
  setHistoria("");
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

const agregarDiagnostico = async () => {
  if (!nuevoDiagnostico.trim()) return;

  const nombre = nuevoDiagnostico.trim().toUpperCase();

  await addDoc(collection(db, "diagnosticos"), {
    nombre
  });

  setDiagnosticosSeleccionados((prev) =>
    prev.includes(nombre) ? prev : [...prev, nombre]
  );

  setNuevoDiagnostico("");
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

  limpiarFormularioConsulta();
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

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.text("Especialista en Enfermedades Autoinmunes", 45, 29);

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

  return (
    <div className="historia-paciente-page">

      {mostrarModal && (
        <div className="historia-toast">
          ✅ Consulta guardada con éxito
        </div>
      )}

      {!paciente ? (
        <div className="historia-loading">
          <h3 className="fw-bold">
            Cargando paciente...
          </h3>
        </div>
      ) : (
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
                <span className="subtitle-negro">DEL PACIENTE</span>
              </h2>

              <p className="historia-paciente-subtitle">
                Registro evolutivo, plantillas médicas, diagnósticos y generación de PDF.
              </p>
            </div>

            <div className="historia-paciente-count">
              <strong>{consultas.length}</strong>
              <span>Consultas</span>
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
  Diagnósticos
</h5>

<div className="historia-diagnosticos-box mb-3">

  {diagnosticos.map((d, index) => {
    const nombreDiag = d.nombre?.toUpperCase() || "";

    return (
      <label
        key={d.id}
        className={`historia-diagnostico-check ${
          diagnosticosSeleccionados.includes(nombreDiag) ? "activo" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={diagnosticosSeleccionados.includes(nombreDiag)}
          onChange={() => toggleDiagnostico(nombreDiag)}
        />

        <span>
          <strong className="diag-opcion-num">
            {index + 1}.
          </strong>{" "}
          {nombreDiag}
        </span>
      </label>
    );
  })}

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

                  <h5 className="historia-panel-title">
                    Plantillas rápidas
                  </h5>

                  <div className="historia-plantillas">

                    <button
                      type="button"
                      onClick={() => usarPlantilla("aptitudfisica")}
                    >
                      Certificado aptitud física
                    </button>

                    <button
                      type="button"
                      onClick={() => usarPlantilla("primeravez")}
                    >
                      Historia reumatológica
                    </button>

                    <button
                      type="button"
                      onClick={() => usarPlantilla("evolucion")}
                    >
                      Evolución clínica
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

                  <div className="historia-editor-header">
                    <div>
                      <h5>Historia clínica</h5>
                      <p>
                        Escribe la evolución, examen físico, conducta y plan terapéutico.
                      </p>
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
          <div className="historia-consultas-section mt-5">

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
                    <h5>{c.fecha}</h5>

                        <div className="historia-consulta-diagnosticos mt-2">
                          {obtenerDiagnosticosConsulta(c).map((diag) => (
                            <small key={diag}>
                              {diag}
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