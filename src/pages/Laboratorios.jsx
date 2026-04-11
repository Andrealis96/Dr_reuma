import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { FaSearch, FaFilePdf } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import logo from "../assets/DrReumaLogo.png";
import marcaDeAgua from "../assets/marcaDeAgua.png";
import firma from "../assets/firma.png";

function Laboratorios() {
const auth = getAuth();
const user = auth.currentUser;
const nombreMedico = user?.displayName || "Dr. Tony Gregory Vélez Macias";
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState("");
  const [estudiosSeleccionados, setEstudiosSeleccionados] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);

  // 🔥 NUEVO
  const [medico, setMedico] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [otros, setOtros] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 5;
  const [loading, setLoading] = useState(true);

  /* 📦 GRUPOS */
  const gruposEstudios = {
    hemograma: [
      "Glucemia","Hemoglobina glicosilada","Uremia",
      "Creatinina","Hepatograma","VSG","Proteína C reactiva",
      "Ácido úrico","Triglicéridos","Colesterol total",
      "Colesterol LDL","Colesterol HDL","Ionograma",
      "Calcio","Vitamina D"
    ],
    serologias: ["HIV","Hepatitis B","Hepatitis C"],
    anticuerpos: [
      "Factor reumatoideo","Anti CCP","FAN","Anti DNA",
      "Anti SM","Anti URNP","ANCA C","ANCA P"
    ]
  };

  /* 🔄 CARGAR PACIENTES */
  useEffect(() => {
    const ref = collection(db, "historiasClinicas");

    const unsub = onSnapshot(ref, (snap) => {
      const datos = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setPacientes(datos);
      
    });

    return () => unsub();
  }, []);

  useEffect(() => {
  const ref = collection(db, "laboratorios");

  const unsub = onSnapshot(ref, (snap) => {
    const datos = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setLaboratorios(datos);
    setLoading(false);
  });

  return () => unsub();
}, []);

  /* ✅ TOGGLE */
  const toggleEstudio = (e) => {
    if (estudiosSeleccionados.includes(e)) {
      setEstudiosSeleccionados(estudiosSeleccionados.filter(x => x !== e));
    } else {
      setEstudiosSeleccionados([...estudiosSeleccionados, e]);
    }
  };

  /* 🔥 SELECCIONAR GRUPO */
  const seleccionarGrupo = (grupo) => {
    const lista = gruposEstudios[grupo];

    const todos = lista.every(e => estudiosSeleccionados.includes(e));

    if (todos) {
      setEstudiosSeleccionados(estudiosSeleccionados.filter(e => !lista.includes(e)));
    } else {
      setEstudiosSeleccionados([
        ...new Set([...estudiosSeleccionados, ...lista])
      ]);
    }
  };

  /* 💾 GUARDAR */
  const guardarLaboratorio = async () => {
    if (!pacienteSeleccionado || estudiosSeleccionados.length === 0) {
      alert("Selecciona paciente y estudios");
      return;
    }

    const refPaciente = doc(db, "historiasClinicas", pacienteSeleccionado);
    const snap = await getDoc(refPaciente);
    const paciente = snap.data();

    await addDoc(collection(db, "laboratorios"), {
      pacienteId: pacienteSeleccionado,
      pacienteNombre: paciente.nombre,
      sexo: paciente.sexo || "",
      dni: paciente.dni || "",
      obraSocial: paciente.obraSocial || "",
      diagnostico,
      otros,
      fecha: new Date(),
      estudios: estudiosSeleccionados
    });

    setEstudiosSeleccionados([]);
    setPacienteSeleccionado("");
    setMedico("");
    setDiagnostico("");
    setOtros("");
  };

  const eliminarLaboratorio = async (id) => {
  try {
    await deleteDoc(doc(db, "laboratorios", id));
    console.log("Eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
};


  /* 📄 PDF PRO */
const generarPDF = (lab) => {
    const pdf = new jsPDF();
  
    // 🔥 ESPACIADOS PRO
    const line = 5;
    const small = 4;
    const space = 8;

  const dibujarHeader = () => {
    pdf.addImage(logo, "PNG", 14, 10, 24, 24);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text("DR. REUMA", 42, 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(nombreMedico, 42, 24);

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.text("Especialista en Enfermedades Autoinmunes", 42, 29);

    pdf.line(14, 36, 196, 36);
  };
  // 🧠 MARCA DE AGUA
  pdf.addImage(
    marcaDeAgua,
    "PNG",
    50,
    90,
    115,
    115
  );

  const checkPage = (y) => {
    if (y > 270) {
      pdf.addPage();
      dibujarHeader();
      return 45;
    }
    return y;
  };

  dibujarHeader();

  let y = 45;

  // 🧾 DATOS
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("DATOS:", 14, y);
  y += space;
  pdf.setFontSize(11);
  pdf.setDrawColor(200);
  pdf.rect(12, y - 5, 184, 28);

  const col1X = 16;
  const col2X = 105;

  const filaDoble = (l1, v1, l2, v2) => {
  pdf.setFont("helvetica", "bold");
  pdf.text(String(l1 || ""), col1X, y);

  pdf.setFont("helvetica", "normal");
  pdf.text(String(v1 || "-"), col1X + 30, y);

  pdf.setFont("helvetica", "bold");
  pdf.text(String(l2 || ""), col2X, y);

  pdf.setFont("helvetica", "normal");
  pdf.text(String(v2 || "-"), col2X + 30, y);

  y += line;
};

  filaDoble("Paciente:", lab.pacienteNombre, "Sexo:", lab.sexo);
  filaDoble("DNI:", lab.dni, "Obra Social:", lab.obraSocial);
  filaDoble("Médico:", nombreMedico, "Fecha:", formatearFecha(lab.fecha));

  // diagnóstico
  pdf.setFont("helvetica", "bold");
  pdf.text("Diagnóstico:", 16, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(lab.diagnostico || "-"), 46, y);

  y += 18;

  // 🧪 TÍTULO
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("ORDEN DE LABORATORIO", 105, y, { align: "center" });

  y += small;
  pdf.setLineWidth(0.5);
  pdf.line(60, y, 150, y);

  y += space;
  pdf.setFontSize(11);

  // 📦 GRUPOS
  const imprimirGrupo = (titulo, lista = []) => {
    const seleccionados = lista.filter(est =>
      (lab.estudios || []).includes(est)
    );

    if (seleccionados.length === 0) return;

    y = checkPage(y);

    pdf.setFont("helvetica", "bold");
    pdf.text(titulo, 14, y);
    y += small;

    pdf.setFont("helvetica", "normal");

    let col = 0;

    seleccionados.forEach((est) => {
      const x = col === 0 ? 16 : 105;

      pdf.text(`• ${est}`, x, y);

      if (col === 1) y += small;

      col = col === 0 ? 1 : 0;
    });

    if (col === 1) y += small;

    pdf.setDrawColor(220);
    pdf.line(14, y, 195, y);

    y += line;
  };

  imprimirGrupo("HEMOGRAMA", gruposEstudios.hemograma);
  imprimirGrupo("SEROLOGÍAS", gruposEstudios.serologias);
  imprimirGrupo("ANTICUERPOS", gruposEstudios.anticuerpos);

  // 🧠 OTROS
  if (lab.otros) {
    y = checkPage(y);

    pdf.setFont("helvetica", "bold");
    pdf.text("OTROS ESTUDIOS", 14, y);
    y += small;

    pdf.setFont("helvetica", "normal");

    const texto = pdf.splitTextToSize(lab.otros, 175);
    pdf.text(texto, 16, y);

    y += texto.length * small;
  }

  // ✍ FIRMA (más compacta)
  y = checkPage(y + 10);

  pdf.addImage(firma, "PNG", 145, y, 32, 20);

  pdf.line(130, y + 15, 185, y + 15);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("DR. TONY VÉLEZ", 160, y + 20, { align: "center" });

  pdf.setFontSize(10);
  pdf.text("REUMATÓLOGO", 160, y + 24, { align: "center" });
  pdf.text("MN 178050", 160, y + 28, { align: "center" });
  pdf.text("MP 9762", 160, y + 32, { align: "center" });

  // 🧾 FOOTER
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
  pdf.text(`Documento generado: ${fechaActual}`, 14, 285);

  pdf.save(`Laboratorio-${lab.pacienteNombre}.pdf`);
};
const labsFiltrados = laboratorios

  .filter(l =>
    l.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase())
  )
  .sort((a, b) => {
  const parseFecha = (f) => {
    if (f?.seconds) return new Date(f.seconds * 1000);
    if (f instanceof Date) return f;
    if (typeof f === "string" && f.includes("/")) {
      return new Date(f.split("/").reverse().join("-"));
    }
    return new Date(f);
  };

  return parseFecha(b.fecha) - parseFecha(a.fecha);
});

  const indexUltimo = paginaActual * porPagina;
const indexPrimero = indexUltimo - porPagina;

const labsPaginados = labsFiltrados.slice(indexPrimero, indexUltimo);

const totalPaginas = Math.ceil(labsFiltrados.length / porPagina);

const getPaginas = () => {
  const paginas = [];

  let inicio = Math.max(1, paginaActual - 2);
  let fin = Math.min(totalPaginas, paginaActual + 2);

  for (let i = inicio; i <= fin; i++) {
    paginas.push(i);
  }

  return paginas;
};
const formatearFecha = (fecha) => {
  try {
    // 🟢 si es timestamp de Firebase
    if (fecha?.seconds) {
      return new Date(fecha.seconds * 1000).toLocaleDateString("es-AR");
    }

    // 🟢 si ya es Date
    if (fecha instanceof Date) {
      return fecha.toLocaleDateString("es-AR");
    }

    // 🟡 si es string tipo "29/03/2026"
    if (typeof fecha === "string" && fecha.includes("/")) {
      return new Date(fecha.split("/").reverse().join("-"))
        .toLocaleDateString("es-AR");
    }

    // 🟡 fallback normal
    return new Date(fecha).toLocaleDateString("es-AR");

  } catch (e) {
    return "Fecha inválida";
  }
};

  return (
 <div 
  className="container mt-4 mb-5" 
  style={{ minHeight: "calc(100vh - 120px)" }}
>
      <h2 className="subtitle-general text-center mb-4">
        <span className="subtitle-celeste">LABOR</span>
        <span className="subtitle-negro">ATORIOS</span>
      </h2>

      {/* PACIENTE */}
      <select
        className="form-control mb-3"
        value={pacienteSeleccionado}
        onChange={(e) => setPacienteSeleccionado(e.target.value)}
      >
        <option value="">Seleccionar paciente</option>
        {pacientes.map(p => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <input
        className="form-control mb-3"
        placeholder="Diagnóstico"
        value={diagnostico}
        onChange={(e) => setDiagnostico(e.target.value)}
      />

      {/* ESTUDIOS */}
      <div className="card p-3 mb-3">

        {Object.entries(gruposEstudios).map(([grupo, lista]) => (
          <div key={grupo} className="mb-3">

            <div className="d-flex justify-content-between">
              <h6 className="fw-bold text-uppercase">{grupo}</h6>

              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => seleccionarGrupo(grupo)}
              >
                Seleccionar todo
              </button>
            </div>

            <div className="row">
              {lista.map((e, i) => (
                <div key={i} className="col-md-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={estudiosSeleccionados.includes(e)}
                      onChange={() => toggleEstudio(e)}
                    />
                    <label>{e}</label>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}

      </div>

      {/* OTROS */}
      <textarea
        className="form-control mb-3"
        placeholder="Otros estudios..."
        value={otros}
        onChange={(e) => setOtros(e.target.value)}
      />

      <button
        className="btn btn-dark fw-bold mb-4"
        onClick={guardarLaboratorio}
      >
        Guardar orden
      </button>
      <div className="input-group mb-4">
          <span className="input-group-text">
          <FaSearch/>
          </span>
          <input
            className="form-control"
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
      </div>

      {/* LISTADO */}
      <h4>Órdenes generadas</h4>

    {loading ? (
  <p className="text-center">Cargando...</p>
) : (
  labsPaginados.map(lab => (
    <div
      key={lab.id}
      className="card card-ordenes p-3 mb-3 shadow-sm border-0"
      style={{ borderRadius: "12px" }}
    >
      <div className="d-flex justify-content-between align-items-center">

        <div>
          <h6 className="mb-1 fw-bold">{lab.pacienteNombre}</h6>
          <small className="text-muted">
            {formatearFecha(lab.fecha)}
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={() => eliminarLaboratorio(lab.id)}
          >
            <FaTrash />
          </button>

          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => generarPDF(lab)}
          >
            <FaFilePdf />
          </button>
        </div>

      </div>
    </div>
  ))
)}
<div className="d-flex justify-content-center mt-4 mb-5 flex-wrap gap-2">
  {/* botones */}
<button
  className="btn btn-outline-secondary btn-sm"
  disabled={paginaActual === 1}
  onClick={() => setPaginaActual(paginaActual - 1)}
>
  Anterior
</button>

{[...Array(totalPaginas)].map((_, i) => {
  const num = i + 1;

  return (
    <button
      key={i}
      className={`btn btn-sm ${
        paginaActual === num ? "btn-dark" : "btn-outline-dark"
      }`}
      onClick={() => {
        setPaginaActual(num);
      }}
    >
      {num}
    </button>
  );
})}

<button
  className="btn btn-outline-secondary btn-sm"
  disabled={paginaActual === totalPaginas}
  onClick={() => {
    setPaginaActual (paginaActual + 1)
  }}
>
  Siguiente
</button>

</div>
    </div>
  );
}
export default Laboratorios;