import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";

import { db } from "../firebase";

import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaFilePdf
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

  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState("");
  const [historia, setHistoria] = useState("");
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState("");

  const [consultaAbierta, setConsultaAbierta] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  /* OBTENER DATOS */
  useEffect(() => {
    const obtenerPaciente = async () => {
      const ref = doc(db, "historiasClinicas", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setPaciente(snap.data());
    };

    obtenerPaciente();

    const consultasRef = collection(db, "historiasClinicas", id, "consultas");

    const unsubConsultas = onSnapshot(consultasRef, (snap) => {
      const datos = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      datos.sort((a, b) => {
        const fechaA = new Date(a.fecha.split("/").reverse().join("-"));
        const fechaB = new Date(b.fecha.split("/").reverse().join("-"));
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
      setDiagnosticos(datos);
    });

    return () => {
      unsubConsultas();
      unsubDiag();
    };
  }, [id]);

  /* CALCULAR EDAD */
  const calcularEdad = (fecha) => {
    if (!fecha) return "";

    const hoy = new Date();
    const nacimiento = new Date(fecha);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  /* 🔥 FIX GLOBAL SEXO */
  const obtenerIconoSexo = () => {
    const sexo = paciente?.sexo?.toLowerCase()?.trim();

    if (sexo === "femenino" || sexo === "f") return userFemale;
    return userMale;
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";

    const [anio, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${anio}`;
  };
  
  /* 🔒 TUS PLANTILLAS */
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

    Indicaciones: Reposo relativo  `
  };

  const usarPlantilla = (nombre) => {
    setHistoria(plantillas[nombre] || "");
  };

  /* CRUD */
  const agregarDiagnostico = async () => {
    if (!nuevoDiagnostico) return;

    await addDoc(collection(db, "diagnosticos"), {
      nombre: nuevoDiagnostico
    });

    setNuevoDiagnostico("");
  };

  const guardarConsulta = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "historiasClinicas", id, "consultas"), {
      fecha: new Date().toLocaleDateString(),
      diagnostico: diagnosticoSeleccionado,
      historia
    });

    setHistoria("");
    setDiagnosticoSeleccionado("");

    setMostrarModal(true);

    setTimeout(() => {
      setMostrarModal(false);
    }, 2500);
  };

  const eliminarConsulta = async (cid) => {
    if (window.confirm("Eliminar consulta?")) {
      await deleteDoc(doc(db, "historiasClinicas", id, "consultas", cid));
    }
  };

  /* PDF */
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
    pdf.text("DATOS DEL PACIENTE: ", 14, 48);

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
    pdf.text(consulta.diagnostico.toUpperCase(), 105, y, {
      align: "center"
    });

    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const texto = pdf.splitTextToSize(consulta.historia, 180);

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
    pdf.text("DR. TONY VÉLEZ", 160, y + 24, { align: "center" });

    pdf.setFontSize(9);
    pdf.text("REUMATOLOGO", 160, y + 29, { align: "center" });
    pdf.text("MN 178050", 160, y + 33, { align: "center" });
    pdf.text("MP 9762", 160, y + 37, { align: "center" });

    const fechaActual = new Date().toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
    });

    pdf.setFontSize(8);
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

  /* ------------------- NUEVO LAYOUT FLEX PARA ALTURA MINIMA ------------------- */
  return (
    <div className="d-flex flex-column min-vh-100">
      {mostrarModal && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#198754",
          color: "white",
          padding: "15px 25px",
          borderRadius: "10px",
          zIndex: 9999
        }}>
          ✅ Consulta guardada con éxito
        </div>
      )}

      {!paciente ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <h3 className="fw-bold"> CARGANDO PACIENTE ..... </h3>
        </div>
      ) : (
        <div className="container-fluid  mt-4 mb-5">

          <h2 className="subtitle-general  text-center mb-4">
            <span className="subtitle-celeste">HISTORIA CLÍNICA </span>
            <span className="subtitle-negro">DEL PACIENTE</span>
          </h2>

          <div className="card p-4 mb-4">
            <div className="d-flex align-items-start">
              <img
                src={obtenerIconoSexo()} 
                alt="usuario"
                style={{ width: "150px", opacity: 0.7 }}
              />

              <div className="ms-4">
                <h3 className="nombre-paciente fw-bold text-uppercase mb-2">
                  {paciente.nombre}
                </h3>

                <div><span className="fw-semibold">Edad:</span> {calcularEdad(paciente.fechaNacimiento)} años</div>
                <div><span className="fw-semibold">DNI:</span> {paciente.dni}</div>
                <div><span className="fw-semibold">Nacimiento:</span> {formatearFecha(paciente.fechaNacimiento)}</div>
                <div><span className="fw-semibold">Obra social:</span> {paciente.obraSocial}</div>
                <div><span className="fw-semibold">Consultas médicas:</span> {consultas.length}</div>
              </div>
            </div>
          </div>

          <form onSubmit={guardarConsulta}>
            <div className="row">

              <div className="col-md-3">
                <h6 className="fw-bold">DIAGNÓSTICO</h6>

                <select
                  className="form-control mb-3"
                  value={diagnosticoSeleccionado}
                  onChange={(e) => setDiagnosticoSeleccionado(e.target.value)}
                  required
                >
                  <option value="">Seleccionar</option>

                  {diagnosticos.map((d) => (
                    <option key={d.id} value={d.nombre}>
                      {d.nombre}
                    </option>
                  ))}
                </select>

                <div className="d-flex mb-3">
                  <input
                    className="form-control me-2"
                    placeholder="Nuevo diagnóstico"
                    value={nuevoDiagnostico}
                    onChange={(e) => setNuevoDiagnostico(e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={agregarDiagnostico}
                  >
                    <FaPlus />
                  </button>
                </div>

                <h6 className="fw-bold">PLANTILLAS</h6>

                <button type="button" className="btn btn-outline-secondary btn-sm mb-2 w-100" onClick={()=>usarPlantilla("aptitudfisica")}>
                  Certificado de aptitud física
                </button>

                <button type="button" className="btn btn-outline-secondary btn-sm mb-2 w-100" onClick={()=>usarPlantilla("primeravez")}>
                  Historia clínica reumatológica
                </button>

                <button type="button" className="btn btn-outline-secondary btn-sm mb-2 w-100" onClick={()=>usarPlantilla("evolucion")}>
                  Evolución clínica
                </button>

                <button type="button" className="btn btn-outline-secondary btn-sm mb-2 w-100" onClick={()=>usarPlantilla("reposo")}>
                  Justificante médico reposo
                </button>

                <button type="button" className="btn btn-outline-secondary btn-sm mb-2 w-100" onClick={()=>usarPlantilla("receta")}>
                  Receta médica
                </button>

                <button className="btn btn-dark my-3 fw-bold">
                  GUARDAR CONSULTA
                </button>
              </div>

              <div className="col-md-9">
                <h6 className="fw-bold">HISTORIA CLÍNICA</h6>

                <textarea
                  className="form-control "
                  style={{ height: "520px" }}
                  value={historia}
                  onChange={(e) => setHistoria(e.target.value)}
                  required
                />
              </div>

            </div>
          </form>

          <hr className="my-5" />

          <h4 className=" historia-green fw-bold">CONSULTAS REGISTRADAS</h4> <br />

          {consultas.map((c) => (
            <div key={c.id} className="card mb-2 ">

              <div
                className="card-header d-flex justify-content-between header-consulta"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setConsultaAbierta(
                    consultaAbierta === c.id ? null : c.id
                  )
                }
              >
                <span>
                  <strong>{c.diagnostico}</strong> — {c.fecha}
                </span>

                {consultaAbierta === c.id ? <FaChevronUp/> : <FaChevronDown/>}
              </div>

              {consultaAbierta === c.id && (
                <div className="card-body">

                  <p style={{ whiteSpace: "pre-line" }}>
                    {c.historia}
                  </p>

                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => eliminarConsulta(c.id)}
                  >
                    <FaTrash />
                  </button>

                  <button
                    className="btn btn-dark btn-sm"
                    onClick={() => generarPDF(c)}
                  >
                    <FaFilePdf /> PDF
                  </button>

                </div>
              )}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default HistoriaPaciente;