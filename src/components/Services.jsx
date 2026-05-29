import { useState, useEffect } from "react";
import { useRef } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ServiceCard from "./ServiceCard";
import { FaCalendarCheck, FaCheckCircle, FaCalendarAlt, FaSave } from "react-icons/fa";
import { FaMapMarkerAlt , FaMoneyBillWave, FaExclamationCircle, FaExclamationTriangle  } from "react-icons/fa";
import DrReumaLogo from "../assets/DrReumaLogo.png";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import ReactCountryFlag from "react-country-flag";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import marcaDeAgua from "../assets/marcaDeAgua.png";
import FirmaDoctor from "../assets/firma.png";
import {
  FaVideo,
  FaClinicMedical,
  FaPrescriptionBottleAlt,
  FaDumbbell,
  FaHome,
  FaChalkboardTeacher
} from "react-icons/fa";
function Services() {

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "presencial",
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

const codigoTurno =
  `https://drreuma.com/verificacion?paciente=${encodeURIComponent(citaGuardada?.nombre || "")}&fecha=${encodeURIComponent(citaGuardada?.fecha || "")}&hora=${encodeURIComponent(citaGuardada?.hora || "")}`;

const descargarPDF = async () => {

  const element = document.getElementById("pdf-turno");

  if (!element) return;

  try {

    const canvas = await html2canvas(element, {

      scale: 1.5,

      useCORS: true,

      backgroundColor: "#ffffff",

      logging: false
    });

    const imgData = canvas.toDataURL(
      "image/jpeg",
      0.9// 🔥 compresión
    );

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;

    const pdfHeight =
      (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "JPEG", // 🔥 más rápido que PNG
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save(`turno-${citaGuardada?.nombre}.pdf`);

  } catch (error) {

    console.error(error);

  }
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

// ❌ MIÉRCOLES NO LO TOCAMOS (queda dentro del grupo)
if (diaSemana === "domingo") {
  setHorariosDisponibles([]);
  return;
}

// 🔴 VIERNES BLOQUEADO
if (diaSemana === "viernes") {
  setHorariosDisponibles([]);
  return;
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
    "17:00", "17:30",
    "18:00"
  ];
}

// 🟡 JUEVES (mañana)
else if (diaSemana === "jueves") {
  horariosBase = generarHorarios(9, 11);
}

// 🔵 SÁBADO (solo virtual)
else if (diaSemana === "sábado") {
  horariosBase = generarHorarios(8, 18);
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
  }
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
          <span className="subtitle-celeste">CONSULTAS Y SERVICIOS</span>
          <span className="subtitle-negro"> DE REUMATOLÓGICA </span>
        </h3>
        
        <p className="services-description mb-5">
          Ofrecemos atención <span className="fw-bold"> (Presencial en Neuquén - Capital y consultas online) </span> desde la comodidad
          de tu hogar por si no puedes venir, para personas con dolor articular, inflamación, cansancio,
          rigidez o síntomas reumatológicos.
        </p>
    
           
        <p className="services-description text-center mb-5">

          <span className="fw-bold celeste ">"QUE EL DOLOR CONSTANTE NO ES NORMAL,
            UNA ENFERMEDAD REUMATOLÓGICA NO TIENE EDAD." 
          </span>
        </p>
        {/* CARDS */}
        <div className="row g-4 mb-5 ">

          <div className="col-12 col-md-6">
            <ServiceCard 
              icon={<FaVideo />}
              title="CONSULTA POR VIDEOLLAMADA $25.000" 
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
            title="CONSULTA PRESENCIAL - NEUQUÉN  $50.000" 
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

        {/* FORMULARIO */}
        <div className="card card-general p-4 shadow-sm">
        
          {!success ? (
            

<form onSubmit={handleSubmit}>

  <div className="row g-3">

    <div className="col-12">
      <div className="mb-4 text-center">
            <div className="service-icon mx-auto">
              <FaCalendarCheck />
            </div>

            <h4 className="mb-3 fw-bold">
              AGENDA TU CITA
            </h4>

          </div>
      </div>

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

      </select>

      {form.fecha &&
        new Date(form.fecha + "T00:00:00")
          .toLocaleDateString("es-AR", { weekday: "long" })
          .toLowerCase() === "sábado" && (
          <small className="text-danger d-block mt-1">
            ⚠️ Los sábados solo se permiten consultas virtuales.
          </small>
      )}

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

    </div>

    <div className="col-md-6">

      <select
        name="hora"
        className="form-select"
        required
        value={form.hora}
        onChange={handleChange}
      >

        <option value="">
          Selecciona una hora
        </option>

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

    <button className="btn btn-dark fw-bold mt-4">
      <FaSave size={20}/>
      Guardar Cita
    </button>

  </div>

  <div className="info-card mt-4">

    <p className="info-title">
      📌 Información importante
    </p>

    <div className="info-item success">
      <FaMoneyBillWave />
      <span>
        El pago se realizará al finalizar la consulta médica.
      </span>
    </div>

    <div className="info-item danger">
      <FaExclamationCircle />
      <span>
        En caso de cancelación, comunícate con el médico.
      </span>
    </div>

  </div>

</form>

) : (

<div className="success-card text-center">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <button
  className="btn btn-agendar fw-semibold "
  onClick={() => {

    setSuccess(false);

    setCitaGuardada(null);

    setForm({
      nombre: "",
      email: "",
      telefono: "",
      tipo: "virtual",
      fecha: "",
      hora: ""
    });

  }}
>
Nueva cita
</button>

 <button className="btn btn-pdf" onClick={descargarPDF}>
      PDF turno
    </button>
  
  </div>
  <div>
     <img 
        src={DrReumaLogo} 
        alt="Dr. Reuma" 
        className="success-logo"
          crossOrigin="anonymous"
     />
  </div>

  <h4 className="fw-bold">
     <FaCheckCircle /> ¡Cita agendada correctamente!
  </h4>

  <p className="">
    Tu turno fue reservado exitosamente.
  </p>

  <div className="row justify-content-center ">
  <div className="col-md-8"> 
  <div id="turno-print" className=" appointment-summary">
    
    <p>
      <strong>Paciente:</strong>
      {" "}
      {citaGuardada.nombre}
    </p>

    <p>
      <strong>Fecha:</strong>
      {" "}
      {citaGuardada.fecha}
    </p>

    <p>
      <strong>Hora:</strong>
      {" "}
      {citaGuardada.hora}
    </p>

    <p>
      <strong>Tipo:</strong>
      {" "}
      {citaGuardada.tipo}
    </p>

    <p>
      <strong>Especialidad: </strong>
      Reumatología - Dr.Tony Vélez (Dr.Reuma)
    </p>
    <p>
      <strong>Ubicación: </strong>
      San Martín 1355, Neuquén Capital (Consultorios Externos)
    </p>
</div>
  </div>
  </div>

  <small className="d-block  fw-semibold mb-3">
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
<br /> 

</div>

)}

<div
  id="pdf-turno"
  style={{
  position: "fixed",
  top: "-99999px",
  left: "-99999px",

  width: "800px",

  background: "#fff",

  padding: "40px"
}}
>
  {/* MARCA DE AGUA */}
  <img
  src={marcaDeAgua}
  className="pdf-watermark"
  crossOrigin="anonymous"
/>

  {/* HEADER */}
  <div className="pdf-header">

    <img src={DrReumaLogo} className="pdf-logo" />
    <h2>Dr. Reuma - Especialista en Reumatología</h2>
    <p>Turno médico oficial verificado</p>
    <p>Cita agendada correctamente</p>

  </div>

  <hr />

  {/* DATOS PACIENTE */}
  <div className="pdf-body">

    <div><strong>Paciente:</strong> {citaGuardada?.nombre}</div>
    <div><strong>Fecha:</strong> {citaGuardada?.fecha}</div>
    <div><strong>Hora:</strong> {citaGuardada?.hora}</div>
    <div><strong>Tipo:</strong> {citaGuardada?.tipo}</div>

  </div>
  {/* FIRMA */}
  <div className="pdf-signature">

    <img 
    src={FirmaDoctor} 
    crossOrigin="anonymous"
    />

    <p>Firma digital del profesional</p>

  </div>
{/* DOCTOR */}
  <div className="pdf-doctor">

    <p><strong>Dr. Tony Vélez</strong></p>
    <p>MN 178050</p>
    <p> MP 9762</p>
  </div>

  {/* FOOTER */}
  <div className="pdf-footer">

    <p>📍 San Martín 1355 - Neuquén Capital</p>
    <p>🏥 Clínica San Agustín - Consultorios Externos</p>

    <p className="pdf-note">
      Documento oficial generado automáticamente
    </p>

  </div>

</div>

        </div>
      </div>
    </section>
  );
}

export default Services;