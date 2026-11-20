import { useEffect, useMemo, useState, useRef } from "react";

import {

  collection,

  addDoc,

  onSnapshot,

  deleteDoc,

  doc,

  updateDoc,

  query,


  getDocs,
  getDocsFromServer,
  runTransaction,
  serverTimestamp,

writeBatch,

  where

} from "firebase/firestore";



import { db } from "../firebase";

import { useNavigate } from "react-router-dom";





import {

  formatearNombre,

  soloNumeros,

  formatearCredencial,

  formatearObraSocial,

  formatearFechaNacimiento,

  validarFechaNacimiento,

  generarNombreCompleto

} from "../utils/validacionesPaciente";



import {

  FaPlus,

  FaSearch,

  FaTrash,

  FaPencilAlt,

  FaCheckCircle,

  FaChevronLeft,

  FaChevronRight,

  FaUserPlus,

  FaIdCard,

  FaBirthdayCake,

  FaShieldAlt,

  FaVenusMars,

  FaFolderOpen,

  FaTimes,

  FaUsers,

  FaStethoscope,

  FaCalendarAlt,

  FaUserCheck,

  FaClock,

  FaWhatsapp,

  FaPhoneAlt,
  FaFilePdf,
  FaChevronDown

} from "react-icons/fa";



import maleAvatar from "../assets/user-male.png";

import femaleAvatar from "../assets/user-female.png";

import "../styles/App.css";



// Cache breve para que la pantalla de Historias Clínicas se pinte

// de inmediato al volver desde la historia de un paciente.

const PACIENTES_CACHE_KEY = "historias-clinicas-pacientes-cache-v1";

const PACIENTES_CACHE_TTL = 1000 * 60 * 10; // 10 minutos



const leerPacientesCache = () => {

  try {

    const raw = sessionStorage.getItem(PACIENTES_CACHE_KEY);



    if (!raw) return [];



    const cache = JSON.parse(raw);



    const vencido =

      Date.now() - Number(cache?.ts || 0) > PACIENTES_CACHE_TTL;



    if (vencido || !Array.isArray(cache?.pacientes)) {

      sessionStorage.removeItem(PACIENTES_CACHE_KEY);

      return [];

    }



    return cache.pacientes;

  } catch (error) {

    return [];

  }

};



// DNI canónico para comparar registros antiguos y actuales.
const dniDuplicados = (p = {}) => [...new Set([p.dni, p.Dni, p.DNI]
  .map((valor) => String(valor ?? "").replace(/\D/g, ""))
  .filter(Boolean))];

// Activar solo después de verificar reglas, respaldo y subcolecciones en Firebase.
const HABILITAR_FUSION_HISTORIAS = false;

function HistoriasClinicas({ modo = "historias" }) {

  const navigate = useNavigate();



  const [pacientes, setPacientes] = useState(() => leerPacientesCache());
  const [soloDuplicados, setSoloDuplicados] = useState(false);
  const [revisionDuplicados, setRevisionDuplicados] = useState(null);
  const [revisandoDuplicados, setRevisandoDuplicados] = useState(false);
  const [errorRevisionDuplicados, setErrorRevisionDuplicados] = useState("");
  const revisionEnCursoRef = useRef(false);
  const fusionEnCursoRef = useRef(false);
  const [fusionando, setFusionando] = useState(false);

  const [guardandoPaciente, setGuardandoPaciente] = useState(false);
  const guardandoPacienteRef = useRef(false);
  const gruposDuplicados = useMemo(() => {
    const grupos = new Map();
    pacientes.forEach((p) => {
      dniDuplicados(p).forEach((numero) => {
        if (!grupos.has(numero)) grupos.set(numero, []);
        grupos.get(numero).push(p);
      });
    });
    return [...grupos.entries()].filter(([, historias]) => historias.length > 1);
  }, [pacientes]);
  const idsDuplicados = useMemo(() => new Set(
    gruposDuplicados.flatMap(([, historias]) => historias.map((p) => p.id))
  ), [gruposDuplicados]);

  // No depender de la caché ni de los pacientes ya cargados al guardar.
  const leerHistoriasParaValidarDni = async () => {
    const snap = await getDocsFromServer(collection(db, "historiasClinicas"));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  };



  const [citasAgenda, setCitasAgenda] = useState([]);



  const [cargandoCitas, setCargandoCitas] = useState(true);



  const [citaHoySeleccionadaId, setCitaHoySeleccionadaId] =

    useState(null);



  const nuevoPacienteRef = useRef(null);
const filtroEnfermedadRef = useRef(null);


  const [nombre, setNombre] = useState("");



  const [apellidos, setApellidos] = useState("");



  const [dni, setDni] = useState("");



  const [fechaNacimiento, setFechaNacimiento] = useState("");



  const [obraSocial, setObraSocial] = useState("");



  const [sexo, setSexo] = useState("");



  const [numeroCredencial, setNumeroCredencial] = useState("");



  const [filtroEnfermedad, setFiltroEnfermedad] = useState("");
  const [filtroEnfermedadAbierto, setFiltroEnfermedadAbierto] = useState(false);
  const [busquedaEnfermedad, setBusquedaEnfermedad] = useState("");
  const [busquedaAdmin, setBusquedaAdmin] = useState("");
  const [mostrarResultadosAdmin, setMostrarResultadosAdmin] = useState(false);

  const [busqueda, setBusqueda] = useState(() => {

    return sessionStorage.getItem("busquedaHistorias") || "";

  });



  const [pagina, setPagina] = useState(1);



  const [cargandoPacientes, setCargandoPacientes] = useState(

    () => leerPacientesCache().length === 0

  );



  const [fechaTablaAgenda, setFechaTablaAgenda] = useState(() => {

    const hoy = new Date();



    const anio = hoy.getFullYear();



    const mes = String(hoy.getMonth() + 1).padStart(2, "0");



    const dia = String(hoy.getDate()).padStart(2, "0");



    return `${anio}-${mes}-${dia}`;

  });



  const pacientesPorPagina = 6;



  const [editando, setEditando] = useState(null);



  const [mostrarConfirmacion, setMostrarConfirmacion] =

    useState(false);



  const [mensajeConfirmacion, setMensajeConfirmacion] =

    useState("");



  useEffect(() => {

    sessionStorage.setItem("busquedaHistorias", busqueda);

  }, [busqueda]);


/* CERRAR FILTRO DE ENFERMEDADES
   AL TOCAR FUERA DEL DESPLEGABLE */

useEffect(() => {
  if (!filtroEnfermedadAbierto) return;

  const cerrarFuera = (evento) => {
    if (
      filtroEnfermedadRef.current &&
      !filtroEnfermedadRef.current.contains(evento.target)
    ) {
      setFiltroEnfermedadAbierto(false);
    }
  };

  document.addEventListener("pointerdown", cerrarFuera);

  return () => {
    document.removeEventListener("pointerdown", cerrarFuera);
  };
}, [filtroEnfermedadAbierto]);


  const limpiarFormulario = () => {

    setNombre("");

    setApellidos("");

    setDni("");

    setFechaNacimiento("");

    setObraSocial("");

    setNumeroCredencial("");

    setSexo("");

  };



const convertirFechaNacimientoADate = (valor = "") => {

  if (!valor) return null;



  // Por si alguna vez llega un Timestamp de Firestore

  if (valor?.toDate) {

    const fecha = valor.toDate();

    return isNaN(fecha.getTime()) ? null : fecha;

  }



  const texto = valor.toString().trim();



  let dia;

  let mes;

  let anio;



  // AAAA-MM-DD o AAAA/MM/DD

  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(texto)) {

    const partes = texto.split(/[-/]/).map(Number);



    anio = partes[0];

    mes = partes[1];

    dia = partes[2];

  }



  // DD-MM-AAAA o DD/MM/AAAA

  else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(texto)) {

    const partes = texto.split(/[-/]/).map(Number);



    dia = partes[0];

    mes = partes[1];

    anio = partes[2];

  }



  else {

    return null;

  }



  const fecha = new Date(anio, mes - 1, dia);



  // Validar que JavaScript no haya corregido una fecha imposible

  if (

    fecha.getFullYear() !== anio ||

    fecha.getMonth() !== mes - 1 ||

    fecha.getDate() !== dia

  ) {

    return null;

  }



  return fecha;

};



const formatearFecha = (valor = "") => {

  const fecha = convertirFechaNacimientoADate(valor);



  if (!fecha) return "-";



  const dia = String(fecha.getDate()).padStart(2, "0");

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  const anio = fecha.getFullYear();



  return `${dia}/${mes}/${anio}`;

};



const calcularEdad = (valor = "") => {

  const nacimiento = convertirFechaNacimientoADate(valor);



  if (!nacimiento) return null;



  const hoy = new Date();



  let edad = hoy.getFullYear() - nacimiento.getFullYear();



  const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();



  if (

    diferenciaMes < 0 ||

    (diferenciaMes === 0 &&

      hoy.getDate() < nacimiento.getDate())

  ) {

    edad--;

  }



  return edad;

};



const obtenerUltimaConsultaCard = (paciente = {}) => {

  const texto = (paciente.ultimaConsultaTexto || "")

    .toString()

    .trim();



  // Una última consulta normal es un texto corto con fecha.

  // Si contiene una evolución entera, no lo mostramos.

  const textoPareceValido =

    texto &&

    texto.length <= 100 &&

    !texto.includes("\n");



  if (textoPareceValido) {

    return texto;

  }



  const millis = Number(paciente.ultimaConsultaAtMillis || 0);



  if (millis > 0) {

    const fecha = new Date(millis);



    if (!isNaN(fecha.getTime())) {

      const fechaTexto = fecha

        .toLocaleDateString("es-AR", {

          weekday: "long",

          day: "numeric",

          month: "numeric",

          year: "numeric"

        })

        .replace(",", "")

        .replace(/^./, (letra) => letra.toUpperCase());



      const horaTexto = fecha.toLocaleTimeString("es-AR", {

        hour: "2-digit",

        minute: "2-digit",

        hour12: false

      });



      return `${fechaTexto} - ${horaTexto} hs`;

    }

  }



  return "Sin consultas";

};



  const normalizarTexto = (texto = "") => {

    return texto

      .toString()

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .toLowerCase();

  };



  const capitalizarNombre = (nombre = "") => {

    return nombre

      .toString()

      .toLowerCase()

      .split(" ")

      .filter(Boolean)

      .map(

        (palabra) =>

          palabra.charAt(0).toUpperCase() +

          palabra.slice(1)

      )

      .join(" ");

  };



  const normalizarFechaNacimientoHistoria = (

    valor = ""

  ) => {

    if (!valor) return "";



    const texto = valor.toString().trim();



    // Ya viene como DD-MM-AAAA o DD/MM/AAAA

    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(texto)) {

      return texto.replace(/\//g, "-");

    }



    // Viene como AAAA-MM-DD desde registros viejos

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {

      const [anio, mes, dia] = texto.split("-");



      return `${dia}-${mes}-${anio}`;

    }



    return texto;

  };



  const convertirFechaFlexible = (

    valor,

    hora = ""

  ) => {

    if (!valor) return null;



    let fecha = null;



    // Firestore Timestamp

    if (valor?.toDate) {

      fecha = valor.toDate();

    }



    // Date normal

    else if (valor instanceof Date) {

      fecha = valor;

    }



    // Texto: 26/8/2026 o 26/08/2026 o 2026-08-26

    else if (typeof valor === "string") {

      const limpio = valor.trim();



      if (

        /^\d{4}-\d{1,2}-\d{1,2}$/.test(limpio)

      ) {

        const [anio, mes, dia] =

          limpio.split("-").map(Number);



        fecha = new Date(

          anio,

          mes - 1,

          dia

        );

      } else if (

        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(

          limpio

        )

      ) {

        const [dia, mes, anio] =

          limpio.split("/").map(Number);



        fecha = new Date(

          anio,

          mes - 1,

          dia

        );

      } else {

        const fechaTemporal =

          new Date(limpio);



        if (

          !isNaN(fechaTemporal.getTime())

        ) {

          fecha = fechaTemporal;

        }

      }

    }



    if (

      !fecha ||

      isNaN(fecha.getTime())

    ) {

      return null;

    }



    const horaLimpia =

      hora?.toString().trim();



    const matchHora =

      horaLimpia.match(

        /^(\d{1,2}):(\d{2})/

      );



    if (matchHora) {

      fecha.setHours(

        Number(matchHora[1]),

        Number(matchHora[2]),

        0,

        0

      );

    } else {

      fecha.setHours(

        12,

        0,

        0,

        0

      );

    }



    return fecha;

  };



  const formatearFechaCorta = (fecha) => {

    return fecha

      .toLocaleDateString("es-AR", {

        weekday: "long",

        day: "numeric",

        month: "numeric",

        year: "numeric"

      })

      .replace(",", "")

      .replace(

        /^./,

        (letra) => letra.toUpperCase()

      );

  };



  const obtenerFechaHoraConsulta = (

    consulta

  ) => {

    const fechaDate =

      convertirFechaFlexible(

        consulta.fecha,

        consulta.hora

      ) ||

      convertirFechaFlexible(

        consulta.fechaConsulta,

        consulta.hora

      ) ||

      convertirFechaFlexible(

        consulta.creado,

        consulta.hora

      ) ||

      convertirFechaFlexible(

        consulta.createdAt,

        consulta.hora

      );



    return {

      fecha: fechaDate

        ? formatearFechaCorta(fechaDate)

        : "Sin fecha",



      hora: consulta.hora || "",



      fechaDate

    };

  };



  // ==============================

  // CARGAR HISTORIAS CLÍNICAS

  // ==============================



  useEffect(() => {

    const qPacientes = collection(db, "historiasClinicas");

    const unsubscribe = onSnapshot(

      qPacientes,



      (snapshot) => {

        const creadoMillis = (p) => p.creado?.toMillis?.() ||
          (p.creado instanceof Date ? p.creado.getTime() : 0);
        const datos = snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id }))
          .sort((a, b) => creadoMillis(b) - creadoMillis(a));

        setPacientes(datos);



        setCargandoPacientes(false);



        // Guardamos una copia temporal.

        // Cuando volvés a Historias Clínicas,

        // los pacientes aparecen inmediatamente

        // mientras Firestore se sincroniza.

        try {

          sessionStorage.setItem(

            PACIENTES_CACHE_KEY,

            JSON.stringify({

              ts: Date.now(),

              pacientes: datos

            })

          );

        } catch (error) {

          console.warn(

            "No se pudo guardar cache de pacientes:",

            error

          );

        }

      },



      (error) => {

        console.error(

          "Error cargando historias clínicas:",

          error

        );



        setCargandoPacientes(false);

      }

    );



    return () =>

      unsubscribe();

  }, []);



  // ==============================

  // CARGAR CITAS SOLO DEL DÍA

  // ==============================

  //

  // Antes se descargaba TODA

  // la colección "citas".

  //

  // Ahora Firestore trae solamente

  // las citas del día visible.

  //

  // Esto mejora especialmente

  // celular y tablet.

  // ==============================



  useEffect(() => {

    setCargandoCitas(true);



    const qCitasDia = query(

      collection(

        db,

        "citas"

      ),



      where(

        "fecha",

        "==",

        fechaTablaAgenda

      )

    );



    const unsubscribe = onSnapshot(

      qCitasDia,



      (snapshot) => {

        const datos =

          snapshot.docs.map(

            (doc) => ({

              id: doc.id,

              ...doc.data()

            })

          );



        setCitasAgenda(datos);



        setCargandoCitas(false);

      },



      (error) => {

        console.error(

          "Error cargando citas del día:",

          error

        );



        setCitasAgenda([]);



        setCargandoCitas(false);

      }

    );



    return () =>

      unsubscribe();

  }, [fechaTablaAgenda]);



  useEffect(() => {

    setPagina(1);

  }, [busqueda, filtroEnfermedad, soloDuplicados]);



  const mostrarMensajeGuardado = (

    texto

  ) => {

    setMensajeConfirmacion(texto);



    setMostrarConfirmacion(true);



    setTimeout(() => {

      setMostrarConfirmacion(false);

    }, 1800);

  };



const crearPaciente = async (e) => {

  e.preventDefault();
  if (guardandoPacienteRef.current) return;
  guardandoPacienteRef.current = true;
  setGuardandoPaciente(true);
  try {



  if (

    fechaNacimiento &&

    !validarFechaNacimiento(fechaNacimiento)

  ) {

    alert("Ingresá una fecha de nacimiento válida.");

    return;

  }



    const dniNormalizado = soloNumeros(dni);
    if (!dniNormalizado) {
      alert("Ingresá el DNI del paciente.");
      return;
    }
    const historiasServidor = await leerHistoriasParaValidarDni();
    const existentes = historiasServidor.filter((p) => dniDuplicados(p).includes(dniNormalizado));
    if (existentes.length > 0) {
      alert("Este DNI ya tiene una historia clínica. Seleccioná el paciente desde el buscador para editarlo.");
      return;
    }

    const pacienteCreado =

      await addDoc(

        collection(

          db,

          "historiasClinicas"

        ),

        {

          nombres: formatearNombre(nombre).trim(),



apellidos: formatearNombre(apellidos).trim(),



nombre: generarNombreCompleto(

  formatearNombre(nombre),

  formatearNombre(apellidos)

),



dni: soloNumeros(dni),



fechaNacimiento,



obraSocial: formatearObraSocial(obraSocial).trim(),



numeroCredencial: formatearCredencial(numeroCredencial),



sexo,



origenRegistro: citaHoySeleccionadaId

  ? "agenda"

  : "historiaClinica",



          creado:

            new Date()

        }

      );



    if (

      citaHoySeleccionadaId

    ) {

      await updateDoc(

        doc(

          db,

          "citas",

          citaHoySeleccionadaId

        ),

        {

          estadoCita:

            "asistio",



          estadoAsistencia:

            "asistio",



          estadoConfirmacion:

            "confirmado",



          asistenciaActualizadaAt:

            new Date(),



          historiaClinicaId:

            pacienteCreado.id,

            pacienteId: pacienteCreado.id

        }

      );



      setCitaHoySeleccionadaId(

        null

      );

    }



    limpiarFormulario();



    mostrarMensajeGuardado(

      "Paciente guardado"

    );

  } catch (error) {
    console.error("Error al guardar paciente:", error);
    alert("No se pudo completar el guardado. Revisá la conexión y el listado antes de volver a intentar.");
  } finally {
    guardandoPacienteRef.current = false;
    setGuardandoPaciente(false);
  }
  };

const eliminarPaciente = async (id) => {

  const paciente = pacientes.find((p) => p.id === id);



  if (!paciente) return;
  try {
    const historiasServidor = await leerHistoriasParaValidarDni();
    const actual = historiasServidor.find((p) => p.id === id);
    if (!actual) { alert("La historia ya no existe."); return; }
    const dnis = dniDuplicados(actual);
    if (dnis.length && historiasServidor.some((p) => p.id !== id && dniDuplicados(p).some((n) => dnis.includes(n)))) {
      alert("Este DNI tiene historias duplicadas. No se puede eliminar desde aquí: primero deben fusionarse de forma segura.");
      return;
    }
  } catch (error) {
    console.error("No se pudo verificar el DNI antes de eliminar", error);
    alert("No se pudo verificar el DNI. No se eliminó ningún dato.");
    return;
  }

  const confirmar = window.confirm(

    `¿Eliminar definitivamente a ${paciente.nombre || "este paciente"}?\n\n` +

    "Se eliminarán su historia clínica, todas sus consultas y las citas vinculadas.\n\n" +

    "Esta acción no se puede deshacer."

  );



  if (!confirmar) return;



  try {

    // 1. Buscar las consultas de la historia clínica

    const consultasSnap = await getDocs(

      collection(db, "historiasClinicas", id, "consultas")

    );



    // 2. Buscar citas vinculadas por ID

    const citasPorHistoria = await getDocs(

      query(

        collection(db, "citas"),

        where("historiaClinicaId", "==", id)

      )

    );



    // 3. Buscar citas vinculadas por pacienteId

    const citasPorPaciente = await getDocs(

      query(

        collection(db, "citas"),

        where("pacienteId", "==", id)

      )

    );



    // Evitar eliminar dos veces una misma cita

    const citasUnicas = new Map();



    [...citasPorHistoria.docs, ...citasPorPaciente.docs]

      .forEach((documento) => {

        citasUnicas.set(documento.ref.path, documento.ref);

      });



    // 4. Preparar referencias para eliminar

    const referencias = [

      ...consultasSnap.docs.map((d) => d.ref),

      ...citasUnicas.values(),



      // El documento principal se elimina al final

    ];



    // 5. Eliminar consultas y citas en lotes

    // Firestore admite hasta 500 operaciones por batch

    for (let i = 0; i < referencias.length; i += 400) {

      const batch = writeBatch(db);



      referencias.slice(i, i + 400).forEach((ref) => {

        batch.delete(ref);

      });



      await batch.commit();

    }



    // 6. Eliminar la historia clínica al final

    const batchFinal = writeBatch(db);



    batchFinal.delete(doc(db, "historiasClinicas", id));



    await batchFinal.commit();



    // 7. Limpiar la caché local del paciente

    localStorage.removeItem(`paciente-cache-${id}`);



    // El listener de Firestore actualizará el listado.
    setEditando(null);
    limpiarFormulario();
    setBusquedaAdmin("");
    mostrarMensajeGuardado("Paciente eliminado");



  } catch (error) {

    console.error("Error al eliminar paciente:", error);



    alert(

      "No se pudo completar la eliminación. " +

      "Revisá los permisos de Firebase y los registros restantes."

    );

  }

};



  const pacientesBusquedaAdmin = useMemo(() => {
    const texto = normalizarTexto(busquedaAdmin).trim();
    if (!texto) return [];
    const palabras = texto.split(/\s+/).filter(Boolean);
    const dniBusqueda = busquedaAdmin.replace(/\D/g, "");
    return pacientes.filter((p) => {
      const nombreCompleto = normalizarTexto(
        p.nombre || [p.nombres, p.apellidos].filter(Boolean).join(" ")
      );
      const dniPaciente = String(p.dni || p.Dni || "").replace(/\D/g, "");
      return palabras.every((palabra) => nombreCompleto.includes(palabra)) ||
        (dniBusqueda && dniPaciente.includes(dniBusqueda));
    }).slice(0, 8);
  }, [pacientes, busquedaAdmin]);

  const seleccionarPacienteAdmin = (p) => {
    editarPaciente(p);
    setBusquedaAdmin("");
    setMostrarResultadosAdmin(false);
  };

  const editarPaciente = (p) => {

    setEditando(p.id);



    const nombreCompleto = String(p.nombre || "").trim();
    const apellidoExistente = String(p.apellidos || "").trim();
    const nombresExistentes = String(p.nombres || "").trim();
    // Compatibilidad con historias antiguas que guardaban solo "nombre".
    const nombresMostrar = nombresExistentes || (
      apellidoExistente && nombreCompleto.endsWith(` ${apellidoExistente}`)
        ? nombreCompleto.slice(0, -(apellidoExistente.length + 1))
        : nombreCompleto
    );
    setNombre(nombresMostrar);
    setApellidos(apellidoExistente);



    setDni(

      dniDuplicados(p)[0] || ""

    );



    
setFechaNacimiento(
  normalizarFechaNacimientoHistoria(
    p.fechaNacimiento || ""
  )
);




    setObraSocial((p.obraSocial || "").toUpperCase());



    setNumeroCredencial(p.numeroCredencial || "");



    setSexo(

      p.sexo || ""

    );



    setTimeout(() => {

      nuevoPacienteRef.current?.scrollIntoView(

        {

          behavior: "smooth",

          block: "center"

        }

      );

    }, 100);

  };







const guardarEdicion = async (e) => {

  e.preventDefault();
  if (guardandoPacienteRef.current) return;
  guardandoPacienteRef.current = true;
  setGuardandoPaciente(true);
  try {



  if (

    fechaNacimiento &&

    !validarFechaNacimiento(fechaNacimiento)

  ) {

    alert("Ingresá una fecha de nacimiento válida.");

    return;

  }



  const dniNormalizado = soloNumeros(dni);
  if (!dniNormalizado) {
    alert("Ingresá el DNI del paciente.");
    return;
  }
  const historiasServidor = await leerHistoriasParaValidarDni();
  const actual = historiasServidor.find((p) => p.id === editando);
  if (!actual) {
    alert("La historia clínica ya no existe. Actualizá el listado.");
    return;
  }
  const dniActual = dniDuplicados(actual)[0] || "";
  if (dniNormalizado !== dniActual && historiasServidor.some(
    (p) => p.id !== editando && dniDuplicados(p).includes(dniNormalizado)
  )) {
    alert("Ese DNI ya pertenece a otra historia clínica. No se guardaron los cambios.");
    return;
  }

  await updateDoc(

      doc(

        db,

        "historiasClinicas",

        editando

      ),

      {

        nombres: nombre.trim(),

        apellidos: apellidos.trim(),

        nombre: [nombre.trim(), apellidos.trim()]

          .filter(Boolean)

          .join(" "),



        dni:

          dniNormalizado,
        ...(Object.prototype.hasOwnProperty.call(actual, "Dni") ? { Dni: dniNormalizado } : {}),
        ...(Object.prototype.hasOwnProperty.call(actual, "DNI") ? { DNI: dniNormalizado } : {}),

        fechaNacimiento,



        obraSocial: obraSocial.trim().toUpperCase(),



        numeroCredencial: numeroCredencial.trim(),



        sexo

      }

    );



    setEditando(null);



    limpiarFormulario();



    mostrarMensajeGuardado(

      "Paciente actualizado"

    );

  } catch (error) {
    console.error("Error al editar paciente:", error);
    alert("No se pudieron guardar los cambios. Revisá la conexión y los permisos.");
  } finally {
    guardandoPacienteRef.current = false;
    setGuardandoPaciente(false);
  }
  };



  const cancelarEdicion = () => {
    setEditando(null);
    setCitaHoySeleccionadaId(null);
    setBusquedaAdmin("");
    setMostrarResultadosAdmin(false);
    limpiarFormulario();
  };



  const obtenerCreadoPaciente = (

    p

  ) => {

    if (

      p.creado?.toDate

    ) {

      return p.creado

        .toDate()

        .getTime();

    }



    if (

      p.creado instanceof Date

    ) {

      return p.creado.getTime();

    }



    return 0;

  };



const pacientesFiltrados = useMemo(() => {

  const textoPaciente = normalizarTexto(busqueda)

    .replace(/\s+/g, " ")

    .trim();



  const palabrasBusqueda = textoPaciente

    .split(" ")

    .filter(Boolean);



  const dniBusqueda = busqueda

    .replace(/\D/g, "")

    .trim();



  return pacientes
  .filter((p) => !soloDuplicados || idsDuplicados.has(p.id))

  .filter((p) => {

    // Si el médico está buscando, mostrar TODOS

    // los pacientes, aunque tengan cero consultas.

    if (soloDuplicados || modo === "pacientes" || busqueda.trim() !== "") {

      return true;

    }



    // Sin búsqueda: mostrar historias manuales

    // y pacientes con consultas registradas.

    const tieneConsultas =

      Number(p.cantidadConsultas || 0) > 0 ||

      Number(p.ultimaConsultaAtMillis || 0) > 0;



    const creadoDesdeHistoria =

      p.origenRegistro === "historiaClinica";



    return tieneConsultas || creadoDesdeHistoria;

  }) 

  .filter((p) => {

      // =========================

      // BÚSQUEDA POR NOMBRE

      // =========================

      const nombrePaciente = normalizarTexto(p.nombre || "")

        .replace(/\s+/g, " ")

        .trim();



      // Todas las palabras escritas deben existir

      // sin importar el orden

      const coincideNombre =

        palabrasBusqueda.length > 0 &&

        palabrasBusqueda.every((palabra) =>

          nombrePaciente.includes(palabra)

        );



      // =========================

      // BÚSQUEDA POR DNI

      // =========================

      const dniPaciente = (p.dni || p.Dni || p.DNI || "")

        .toString()

        .replace(/\D/g, "");



      const coincideDni =

        dniBusqueda &&

        dniPaciente.includes(dniBusqueda);



      return (

        textoPaciente === "" ||

        coincideNombre ||

        coincideDni

      );

    })





    .filter((p) => {
      if (modo !== "historias" || !filtroEnfermedad) return true;
      const diagnos = Array.isArray(p.diagnosticosResumen)
        ? p.diagnosticosResumen : [];
      return diagnos.some((d) => normalizarTexto(d) === normalizarTexto(filtroEnfermedad));
    })

.sort((a, b) => {
  const fechaA =
    Number(a.ultimaConsultaAtMillis || 0) ||
    obtenerCreadoPaciente(a);

  const fechaB =
    Number(b.ultimaConsultaAtMillis || 0) ||
    obtenerCreadoPaciente(b);

  if (fechaB !== fechaA) {
    return fechaB - fechaA;
  }

  return (a.nombre || "").localeCompare(
    b.nombre || "",
    "es"
  );
});




}, [pacientes, busqueda, modo, filtroEnfermedad, soloDuplicados, idsDuplicados]);



  const enfermedadesDisponibles = useMemo(() => {
    const nombres = new Set();
    pacientes.forEach((p) => {
      const diagnos = Array.isArray(p.diagnosticosResumen)
        ? p.diagnosticosResumen : [];
      diagnos.forEach((d) => {
        if (typeof d === "string" && d.trim()) nombres.add(d.trim());
      });
    });
    return [...nombres].sort((a, b) => a.localeCompare(b, "es"));
  }, [pacientes]);

  // Imprime todos los pacientes filtrados, incluso los de otras páginas.
  const imprimirPacientesFiltrados = () => {
    if (pacientesFiltrados.length === 0) {
      alert("No hay pacientes para exportar con los filtros actuales.");
      return;
    }

    const escaparHTML = (valor) => String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const filas = pacientesFiltrados.map((p, i) => {
      const nombres = String(p.nombres || "").trim();
      const apellidos = String(p.apellidos || "").trim();
      const nombreCompleto = String(p.nombre || "").trim();
      // Evitar repetir el apellido cuando el registro histórico solo guarda nombre completo.
      const nombreMostrar = nombres || (
        apellidos && nombreCompleto.endsWith(` ${apellidos}`)
          ? nombreCompleto.slice(0, -(apellidos.length + 1))
          : nombreCompleto
      ) || "-";
      const apellidoMostrar = apellidos || "-";
      const edad = calcularEdad(p.fechaNacimiento);
      const diagnosticos = Array.isArray(p.diagnosticosResumen)
        ? p.diagnosticosResumen.filter((d) => typeof d === "string" && d.trim()).join(", ")
        : "";
      const telefono = p.telefono || p.Telefono || "";
      const ultimaConsulta = obtenerUltimaConsultaCard(p);
      return `<tr><td>${i + 1}</td><td>${escaparHTML(nombreMostrar)}</td>` +
        `<td>${escaparHTML(apellidoMostrar)}</td>` +
        `<td>${escaparHTML(p.dni || p.Dni || p.DNI || "-")}</td>` +
        `<td>${edad == null ? "-" : escaparHTML(edad)}</td>` +
        `<td>${escaparHTML(diagnosticos || "Sin diagnóstico registrado")}</td>` +
        `<td>${escaparHTML(telefono || "No registrado")}</td>` +
        `<td>${escaparHTML(ultimaConsulta)}</td></tr>`;
    }).join("");

    const ventana = window.open("", "_blank", "width=1100,height=760");
    if (!ventana) {
      alert("El navegador bloqueó la ventana de impresión. Permití las ventanas emergentes para este sitio.");
      return;
    }

    const fechaExportacion = new Date().toLocaleDateString("es-AR");
    ventana.document.open();
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8" />
      <title>Listado de pacientes - Dr. Reuma</title>
      <style>
      @page { size: A4 landscape; margin: 10mm; }
      body { font-family: Arial, sans-serif; color: #183944; margin: 0; }
      header { border-bottom: 2px solid #123b48; padding-bottom: 9px; margin-bottom: 12px; }
      h1 { margin: 0 0 7px; font-size: 19px; }
      .meta { font-size: 10px; color: #52636b; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8.5px; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; page-break-inside: avoid; }
      th { background: #123b48; color: white; text-align: left; padding: 7px 4px; }
      td { border-bottom: 1px solid #d7e4e8; padding: 6px 4px; vertical-align: top; overflow-wrap: anywhere; }
      th:nth-child(1),td:nth-child(1) { width: 3%; }
      th:nth-child(2),td:nth-child(2) { width: 14%; }
      th:nth-child(3),td:nth-child(3) { width: 12%; }
      th:nth-child(4),td:nth-child(4) { width: 9%; }
      th:nth-child(5),td:nth-child(5) { width: 5%; }
      th:nth-child(6),td:nth-child(6) { width: 28%; }
      th:nth-child(7),td:nth-child(7) { width: 12%; }
      th:nth-child(8),td:nth-child(8) { width: 17%; }
      .nota { margin-top: 14px; font-size: 9px; color: #687983; }
      </style></head><body>
      <header><h1>DR. REUMA · Listado de pacientes</h1>
      <div class="meta">Fecha: ${escaparHTML(fechaExportacion)} · Pacientes: ${pacientesFiltrados.length} · Diagnóstico: ${escaparHTML(filtroEnfermedad || "Todos")}</div></header>
      <table><thead><tr><th>N.º</th><th>Nombres</th><th>Apellidos</th><th>DNI</th><th>Edad</th><th>Diagnósticos</th><th>Teléfono</th><th>Última consulta</th></tr></thead>
      <tbody>${filas}</tbody></table>
      <div class="nota">Documento con datos personales y de salud. Uso confidencial. Los campos no registrados se muestran sin completar.</div>
      </body></html>`);
    ventana.document.close();

    // Al cerrar el cuadro de impresión (guardar o cancelar), cerrar la pestaña auxiliar.
    ventana.addEventListener("afterprint", () => {
      ventana.setTimeout(() => {
        if (!ventana.closed) ventana.close();
      }, 300);
    }, { once: true });

    ventana.focus();
    let impresionIniciada = false;
    const iniciarImpresion = () => {
      if (impresionIniciada) return;
      impresionIniciada = true;
      ventana.print();
    };
    ventana.addEventListener("load", iniciarImpresion, { once: true });
    if (ventana.document.readyState === "complete") iniciarImpresion();
  };

  const enfermedadesVisibles = enfermedadesDisponibles.filter((diagnostico) =>
    normalizarTexto(diagnostico).includes(normalizarTexto(busquedaEnfermedad.trim()))
  );

  const indiceFinal =

    pagina *

    pacientesPorPagina;



  const indiceInicial =

    indiceFinal -

    pacientesPorPagina;



  const pacientesPagina =

    pacientesFiltrados.slice(

      indiceInicial,

      indiceFinal

    );



  const totalPaginas =

    Math.ceil(

      pacientesFiltrados.length /

        pacientesPorPagina

    ) || 1;



  const obtenerFechaHoyLocal =

    () => {

      const ahora =

        new Date();



      const offset =

        ahora.getTimezoneOffset();



      return new Date(

        ahora.getTime() -

          offset * 60000

      )

        .toISOString()

        .split("T")[0];

    };



  const pacienteTieneConsultaEnFechaAgenda =

    (cita) => {

      const pacienteGuardado =

        buscarPacienteGuardadoPorCita(

          cita

        );



      if (

        !pacienteGuardado?.ultimaConsultaAtMillis

      ) {

        return false;

      }



      if (!cita?.fecha) {

        return false;

      }



      const fechaUltimaConsulta =

        fechaISODesdeDate(

          new Date(

            Number(

              pacienteGuardado.ultimaConsultaAtMillis

            )

          )

        );



      return (

        fechaUltimaConsulta ===

        cita.fecha

      );

    };



  const obtenerEstadoCitaTexto =

    (cita) => {

      if (

        pacienteTieneConsultaEnFechaAgenda(

          cita

        )

      ) {

        return "Asistió";

      }



      if (

        cita.estadoCita ===

          "asistio" ||

        cita.estadoAsistencia ===

          "asistio"

      ) {

        return "Asistió";

      }



      if (

        cita.estadoCita ===

          "confirmado" ||

        cita.estadoConfirmacion ===

          "confirmado"

      ) {

        return "Confirmado";

      }



      if (

        cita.fecha <

        obtenerFechaHoyLocal()

      ) {

        return "No asistió";

      }



      return "Pendiente";

    };



  const obtenerEstadoCitaClase =

    (cita) => {

      const estado =

        obtenerEstadoCitaTexto(

          cita

        );



      if (

        estado === "Asistió"

      ) {

        return "estado-asistio";

      }



      if (

        estado ===

        "No asistió"

      ) {

        return "estado-no-asistio";

      }



      if (

        estado ===

        "Confirmado"

      ) {

        return "estado-confirmado";

      }



      return "estado-pendiente";

    };



  const limpiarTelefono10 = (

    telefono = ""

  ) => {

    let numero = telefono

      .toString()

      .replace(/\D/g, "");



    if (!numero) return "";



    if (

      numero.startsWith("549") &&

      numero.length >= 13

    ) {

      numero = numero.slice(3);

    }



    if (

      numero.startsWith("54") &&

      numero.length >= 12

    ) {

      numero = numero.slice(2);

    }



    if (

      numero.length > 10

    ) {

      numero =

        numero.slice(-10);

    }



    return numero;

  };



  const abrirWhatsappAgendaHistoria =

    (cita) => {

      if (

        !cita?.telefono

      ) {

        return;

      }



      const numero10 =

        limpiarTelefono10(

          cita.telefono

        );



      if (!numero10) {

        return;

      }



      const numero =

        `549${numero10}`;



      const mensaje =

        encodeURIComponent(

          `Hola ${capitalizarNombre(

            cita.nombre || ""

          )}, te escribimos de Dr. Reuma.`

        );



      window.open(

        `https://wa.me/${numero}?text=${mensaje}`,

        "_blank"

      );

    };



  const textoNumeroCitaPacienteAgenda =

    (numero) => {

      if (numero === 1) {

        return "Primera vez";

      }



      if (numero === 2) {

        return "Segunda vez";

      }



      if (numero === 3) {

        return "Tercera vez";

      }



      return `${numero}ª vez`;

    };



  const obtenerClaseVezHistoria =

    (textoVez = "") => {

      const texto =

        String(

          textoVez

        ).toLowerCase();



      if (

        texto.includes("primera")

      ) {

        return "vez-badge vez-primera";

      }



      if (

        texto.includes("segunda")

      ) {

        return "vez-badge vez-segunda";

      }



      return "vez-badge vez-tercera-mas";

    };



  const fechaISODesdeDate = (

    fecha

  ) => {

    const anio =

      fecha.getFullYear();



    const mes = String(

      fecha.getMonth() + 1

    ).padStart(2, "0");



    const dia = String(

      fecha.getDate()

    ).padStart(2, "0");



    return `${anio}-${mes}-${dia}`;

  };



  const convertirISOADateLocal =

    (fechaISO) => {

      const [

        anio,

        mes,

        dia

      ] = fechaISO

        .split("-")

        .map(Number);



      return new Date(

        anio,

        mes - 1,

        dia

      );

    };



  const cambiarDiaTablaAgenda =

    (dias) => {

      const fechaActual =

        convertirISOADateLocal(

          fechaTablaAgenda

        );



      fechaActual.setDate(

        fechaActual.getDate() +

          dias

      );



      setFechaTablaAgenda(

        fechaISODesdeDate(

          fechaActual

        )

      );



      setCitaHoySeleccionadaId(

        null

      );

    };



  const irAHoyTablaAgenda =

    () => {

      setFechaTablaAgenda(

        obtenerFechaHoyLocal()

      );



      setCitaHoySeleccionadaId(

        null

      );

    };



  const formatearFechaTablaAgenda =

    (fechaISO) => {

      return convertirISOADateLocal(

        fechaISO

      )

        .toLocaleDateString(

          "es-AR",

          {

            weekday: "long",

            day: "numeric",

            month: "numeric",

            year: "numeric"

          }

        )

        .replace(",", "")

        .replace(

          /^./,

          (letra) =>

            letra.toUpperCase()

        );

    };



  const esTablaDeHoy =

    fechaTablaAgenda ===

    obtenerFechaHoyLocal();



  const tituloTablaAgenda =

    esTablaDeHoy

      ? "PACIENTES DE HOY"

      : `PACIENTES DEL ${formatearFechaTablaAgenda(

          fechaTablaAgenda

        ).toUpperCase()}`;



  const obtenerInicioDiaMillis =

    (fechaISO) => {

      const [

        anio,

        mes,

        dia

      ] = fechaISO

        .split("-")

        .map(Number);



      return new Date(

        anio,

        mes - 1,

        dia,

        0,

        0,

        0,

        0

      ).getTime();

    };



  const obtenerFinDiaMillis =

    (fechaISO) => {

      const [

        anio,

        mes,

        dia

      ] = fechaISO

        .split("-")

        .map(Number);



      return new Date(

        anio,

        mes - 1,

        dia,

        23,

        59,

        59,

        999

      ).getTime();

    };



  const citaYaExisteParaPaciente =

    (

      paciente,

      citasDelDia

    ) => {

      const dniPaciente = (

        paciente.dni ||

        paciente.Dni ||

        ""

      )

        .toString()

        .replace(/\D/g, "");



      if (dniPaciente) {

        return citasDelDia.some(

          (cita) => {

            const dniCita = (

              cita.Dni ||

              cita.dni ||

              ""

            )

              .toString()

              .replace(/\D/g, "");



            return (

              dniCita &&

              dniCita ===

                dniPaciente

            );

          }

        );

      }



      const nombrePaciente =

        normalizarTexto(

          paciente.nombre || ""

        )

          .replace(/\s+/g, " ")

          .trim();



      return citasDelDia.some(

        (cita) => {

          const nombreCita =

            normalizarTexto(

              cita.nombre || ""

            )

              .replace(

                /\s+/g,

                " "

              )

              .trim();



          return (

            nombrePaciente &&

            nombreCita ===

              nombrePaciente

          );

        }

      );

    };



  // citasAgenda ya viene filtrado

  // directamente desde Firestore

  // por fechaTablaAgenda.

  const citasDelDiaAgenda =

    citasAgenda;



  const atencionesSinAgenda =

    pacientes

      .filter((p) => {

        const ultimaConsultaMillis =

          Number(

            p.ultimaConsultaAtMillis ||

              0

          );



        const esConsultaDelDia =

          ultimaConsultaMillis >=

            obtenerInicioDiaMillis(

              fechaTablaAgenda

            ) &&

          ultimaConsultaMillis <=

            obtenerFinDiaMillis(

              fechaTablaAgenda

            );



        return (

          esConsultaDelDia &&

          !citaYaExisteParaPaciente(

            p,

            citasDelDiaAgenda

          )

        );

      })

      .map((p) => ({

        id:

          `sin-agenda-${p.id}`,



        historiaClinicaId:

          p.id,



        nombre:

          p.nombre || "",



        Dni:

          p.dni ||

          p.Dni ||

          "",



        telefono:

          p.telefono || "",



        fecha:

          fechaTablaAgenda,



        hora: "00:00",



        sinAgenda: true,



        origen:

          "sinAgendaResumen",



        tipo:

          "presencial",



        fechaNacimiento:

          p.fechaNacimiento ||

          "",



        obraSocial:

          p.obraSocial || "",



        sexo:

          p.sexo || "",



        motivoConsulta:

          "Sin cita / Atención espontánea",



        estadoCita:

          "asistio",



        estadoAsistencia:

          "asistio",



        estadoConfirmacion:

          "confirmado"

      }));



  const citasHoyAgenda = [

    ...atencionesSinAgenda,

    ...citasDelDiaAgenda

  ].sort((a, b) =>

    (a.hora || "").localeCompare(

      b.hora || ""

    )

  );





const buscarPacienteGuardadoPorCita = (cita) => {

  if (!cita) return null;



  // Primero identificar al paciente por su ID.

  const pacienteId =

    cita.historiaClinicaId || cita.pacienteId;



  if (pacienteId) {

    const pacienteEncontrado = pacientes.find(

      (p) => p.id === pacienteId

    );



    if (pacienteEncontrado) {

      return pacienteEncontrado;

    }



    // Si la cita ya tiene ID, no asociarla

    // automáticamente con otra historia.

    return null;

  }



  // Compatibilidad con citas antiguas: buscar por DNI.

  const dniCita = String(

    cita.Dni || cita.dni || ""

  ).replace(/\D/g, "");



  if (!dniCita) return null;



  const coincidencias = pacientes.filter((p) => {

    const dniPaciente = String(

      p.dni || p.Dni || ""

    ).replace(/\D/g, "");



    return dniPaciente === dniCita;

  });



  // Evitar escoger un paciente si existen

  // varias historias con el mismo DNI.

  return coincidencias.length === 1

    ? coincidencias[0]

    : null;

};





  const obtenerNumeroVezHistoriaClinica =

    (cita) => {

      const pacienteGuardado =

        buscarPacienteGuardadoPorCita(

          cita

        );



      if (pacienteGuardado) {

        const consultasRegistradas =

          Number(

            pacienteGuardado.cantidadConsultas ||

              0

          );



        const consultaGuardadaEseDia =

          pacienteTieneConsultaEnFechaAgenda(

            cita

          );



        if (

          consultaGuardadaEseDia

        ) {

          return Math.max(

            consultasRegistradas,

            1

          );

        }



        return (

          consultasRegistradas +

          1

        );

      }



      // Si todavía no existe historia clínica,

      // consideramos que es su primera consulta.

      // Así no hace falta descargar todo el

      // historial de citas.

      return 1;

    };



  const cargarPacienteDesdeCitaHoy =

    (cita) => {

      setEditando(null);



      setCitaHoySeleccionadaId(

        cita.id

      );



      const pacienteGuardado =

        buscarPacienteGuardadoPorCita(

          cita

        );



      if (pacienteGuardado) {

        localStorage.setItem(

          `paciente-cache-${pacienteGuardado.id}`,



          JSON.stringify({

            ts: Date.now(),



            paciente:

              pacienteGuardado

          })

        );



        const citaId =

          cita?.id || "";



        const esCitaReal =

          citaId &&

          !String(

            citaId

          ).startsWith(

            "sin-agenda-"

          ) &&

          cita.origen !==

            "sinAgendaResumen";



        const url =

          esCitaReal

            ? `/admin/historia/${pacienteGuardado.id}?citaId=${citaId}`

            : `/admin/historia/${pacienteGuardado.id}`;



        window.open(

          url,

          "_blank",

          "noopener,noreferrer"

        );



        return;

      }



      setNombre(cita.nombres ?? cita.nombre ?? "");

      setApellidos(cita.apellidos ?? "");

            setDni(

              cita.Dni ||

                cita.dni ||

                ""

            );



      setFechaNacimiento(

        normalizarFechaNacimientoHistoria(

          cita.fechaNacimiento ||

            ""

        )

      );



      setObraSocial(

        cita.obraSocial || ""

      );



      setNumeroCredencial(cita.numeroCredencial || "");

      setSexo(

        cita.sexo || ""

      );



      setTimeout(() => {

        nuevoPacienteRef.current?.scrollIntoView(

          {

            behavior: "smooth",

            block: "center"

          }

        );

      }, 100);

    };



  // Revisión de SOLO LECTURA: no modifica ni elimina historias, consultas o vínculos.
  const revisarDuplicados = async () => {
    if (revisionEnCursoRef.current) return;
    revisionEnCursoRef.current = true;
    setRevisandoDuplicados(true);
    setErrorRevisionDuplicados("");
    setRevisionDuplicados(null);
    try {
      const snap = await getDocsFromServer(collection(db, "historiasClinicas"));
      const grupos = new Map();
      for (const d of snap.docs) {
        const p = { ...d.data(), id: d.id };
        for (const dni of dniDuplicados(p)) {
          if (!grupos.has(dni)) grupos.set(dni, []);
          grupos.get(dni).push(p);
        }
      }
      const repetidos = [...grupos.entries()].filter(([, fichas]) => fichas.length > 1);
      const fichasUnicas = new Map(repetidos.flatMap(([, fichas]) => fichas.map(p => [p.id, p])));
      const detalles = new Map();
      // Consultas reales y vínculos directos, sin depender de los contadores de las tarjetas.
      for (const [id, p] of fichasUnicas) {
        const [consultas, citasHistoria, citasPaciente, biologicos] = await Promise.all([
          getDocsFromServer(collection(db, "historiasClinicas", id, "consultas")),
          getDocsFromServer(query(collection(db, "citas"), where("historiaClinicaId", "==", id))),
          getDocsFromServer(query(collection(db, "citas"), where("pacienteId", "==", id))),
          getDocsFromServer(query(collection(db, "tratamientosBiologicos"), where("historiaClinicaId", "==", id)))
        ]);
        const fechas = consultas.docs.map(d => {
          const c = d.data();
          const valor = c.fecha || c.fechaConsulta || c.creado || c.createdAt;
          let texto = "Sin fecha registrada";
          if (valor?.toDate) texto = valor.toDate().toLocaleDateString("es-AR");
          else if (typeof valor === "string" && valor.trim() && valor.length <= 100) texto = valor;
          return { id: d.id, fecha: texto, hora: String(c.hora || "") };
        });
        detalles.set(id, {
          id,
          nombre: p.nombre || [p.nombres, p.apellidos].filter(Boolean).join(" "),
          dnis: dniDuplicados(p),
          nacimiento: formatearFecha(p.fechaNacimiento),
          cobertura: p.obraSocial || "—",
          sexo: p.sexo || "—",
          cantidad: consultas.size,
          fechas,
          citas: new Set([...citasHistoria.docs, ...citasPaciente.docs].map(d => d.id)).size,
          biologicos: biologicos.size
        });
      }
      setRevisionDuplicados(repetidos.map(([dni, fichas]) => ({
        dni, fichas: fichas.map(p => detalles.get(p.id))
      })));
    } catch (error) {
      console.error("No se pudo revisar duplicados", error);
      setErrorRevisionDuplicados("No se pudo completar la revisión desde Firebase. Comprobá la conexión y los permisos de lectura de historias, consultas, citas y biológicos. No se modificó ningún dato.");
    } finally {
      setRevisandoDuplicados(false);
      revisionEnCursoRef.current = false;
    }
  };

  // Fusión de dos historias verificadas. Ejecutar solo con respaldo y sin otras sesiones escribiendo.
  // El archivo de auditoría conserva los documentos originales afectados, no solo los contadores.
  const fusionarHistorias = async (grupo, idPrincipal) => {
    if (!HABILITAR_FUSION_HISTORIAS || fusionEnCursoRef.current || revisionEnCursoRef.current) return;
    fusionEnCursoRef.current = true;
    setFusionando(true);
    setErrorRevisionDuplicados("");
    let confirmada = false;
    try {
      const bloquear = (mensaje) => { throw new Error(mensaje); };
      const identidad = (texto) => normalizarTexto(String(texto ?? "")).trim().replace(/\s+/g, " ");
      const nombreCanonico = (p) => identidad(p.nombre || [p.nombres, p.apellidos].filter(Boolean).join(" ")).split(" ").filter(Boolean).sort().join(" ");
      const fichasSnap = await getDocsFromServer(collection(db, "historiasClinicas"));
      const coincidencias = fichasSnap.docs.filter(d => dniDuplicados(d.data()).includes(grupo.dni));
      if (coincidencias.length !== 2 || grupo.fichas.length !== 2 ||
          !grupo.fichas.every(f => coincidencias.some(d => d.id === f.id))) {
        bloquear("El grupo cambió o no contiene exactamente dos historias. Volvé a revisar los duplicados.");
      }
      const principal = coincidencias.find(d => d.id === idPrincipal);
      const secundaria = coincidencias.find(d => d.id !== idPrincipal);
      if (!principal || !secundaria) bloquear("No se encontró la historia elegida.");
      const a = principal.data(), b = secundaria.data();
      const nacimientoA = formatearFecha(a.fechaNacimiento);
      const nacimientoB = formatearFecha(b.fechaNacimiento);
      if (dniDuplicados(a).length !== 1 || dniDuplicados(b).length !== 1 ||
          !nombreCanonico(a) || nombreCanonico(a) !== nombreCanonico(b) ||
          nacimientoA === "-" || nacimientoA !== nacimientoB ||
          !identidad(a.sexo) || identidad(a.sexo) !== identidad(b.sexo)) {
        bloquear("La identidad no coincide por completo (DNI, nombre, nacimiento y sexo). No se permite la fusión automática.");
      }
      const ids = new Set([principal.id, secundaria.id]);
      const [consultasA, consultasB, citas, biologicos] = await Promise.all([
        getDocsFromServer(collection(db, "historiasClinicas", principal.id, "consultas")),
        getDocsFromServer(collection(db, "historiasClinicas", secundaria.id, "consultas")),
        getDocsFromServer(collection(db, "citas")),
        getDocsFromServer(collection(db, "tratamientosBiologicos"))
      ]);
      const destinos = new Set(consultasA.docs.map(d => d.id));
      if (consultasB.docs.some(d => destinos.has(d.id))) {
        bloquear("Hay consultas con el mismo identificador. Se requiere revisión manual para no duplicarlas ni sobrescribirlas.");
      }
      const referenciados = [];
      let citasSinVinculo = 0, tratamientosSinVinculo = 0;
      const evaluar = (d, esCita) => {
        const info = d.data();
        const dnis = [...new Set([info.dni, info.Dni, info.DNI, ...(esCita ? [info.documento, info.numeroDocumento] : [])].map(n => String(n ?? "").replace(/\D/g, "")).filter(Boolean))];
        const vinculos = [info.historiaClinicaId, info.pacienteId].filter(Boolean);
        const relacionado = vinculos.some(v => ids.has(v));
        if (!relacionado) {
          if (dnis.includes(grupo.dni)) {
            if (vinculos.length) bloquear("Existe otro vínculo para este DNI que debe revisarse manualmente.");
            if (esCita) citasSinVinculo++; else tratamientosSinVinculo++;
          }
          return;
        }
        if (vinculos.some(v => !ids.has(v)) || dnis.some(n => n !== grupo.dni)) {
          bloquear("Se encontró una referencia con DNI o ID contradictorio. Revisala antes de fusionar.");
        }
        if (esCita) {
          if (info.historiaClinicaId !== principal.id || info.pacienteId !== principal.id) {
            referenciados.push({ d, cambios: { historiaClinicaId: principal.id, pacienteId: principal.id }, esCita });
          }
        } else {
          if (info.historiaClinicaId !== principal.id || (info.pacienteId && info.pacienteId !== principal.id)) {
            referenciados.push({ d, cambios: { historiaClinicaId: principal.id, ...(info.pacienteId ? { pacienteId: principal.id } : {}) }, esCita });
          }
        }
      };
      citas.docs.forEach(d => evaluar(d, true));
      biologicos.docs.forEach(d => evaluar(d, false));
      // No inventar ni deduplicar evoluciones por similitud del texto.
      const todas = [...consultasA.docs, ...consultasB.docs].map(d => d.data());
      const diagnosticos = new Set();
      const agregarDiagnosticos = (lista) => {
        if (Array.isArray(lista)) for (const d of lista) {
          if (typeof d === "string" && d.trim()) diagnosticos.add(d.trim().toUpperCase());
        }
      };
      agregarDiagnosticos(a.diagnosticosResumen);
      agregarDiagnosticos(b.diagnosticosResumen);
      let ultima = null;
      for (const c of todas) {
        agregarDiagnosticos(Array.isArray(c.diagnosticos) && c.diagnosticos.length ? c.diagnosticos : String(c.diagnostico || "").split(" - "));
        const info = obtenerFechaHoraConsulta(c);
        if (!info.fechaDate) bloquear("Una evolución no tiene una fecha interpretable. Revisala antes de fusionar.");
        if (!ultima || info.fechaDate > ultima.fechaDate) ultima = info;
      }
      const cambiosPrincipal = {
        dni: grupo.dni, Dni: grupo.dni,
        ...(a.DNI !== undefined || b.DNI !== undefined ? { DNI: grupo.dni } : {}),
        cantidadConsultas: todas.length,
        diagnosticosResumen: [...diagnosticos].sort((x, y) => x.localeCompare(y, "es")),
        ultimaConsultaAtMillis: ultima?.fechaDate.getTime() || 0,
        ultimaConsultaTexto: ultima ? `${ultima.fecha}${ultima.hora ? ` - ${ultima.hora} hs` : ""}` : "",
        resumenActualizadoAt: serverTimestamp(),
        ultimaFusionAt: serverTimestamp()
      };
      const conflictos = [];
      const camposPersonales = ["nombres", "apellidos", "nombre", "fechaNacimiento", "sexo", "obraSocial", "numeroCredencial", "telefono", "Telefono"];
      for (const campo of camposPersonales) {
        const va = a[campo], vb = b[campo];
        if ((va == null || va === "") && vb != null && vb !== "") cambiosPrincipal[campo] = vb;
        else if (va != null && vb != null && String(va).trim() && String(vb).trim() && identidad(va) !== identidad(vb)) conflictos.push(campo);
      }
      // No sobrescribir campos adicionales de la historia principal. El original queda en la auditoría.
      const otros = Object.keys(b).filter(k => !camposPersonales.includes(k) && !["dni", "Dni", "DNI", "cantidadConsultas", "diagnosticosResumen", "ultimaConsultaAtMillis", "ultimaConsultaTexto", "resumenActualizadoAt", "creado", "origen", "origenRegistro", "ultimaFusionAt"].includes(k));
      const originales = [principal, secundaria, ...consultasB.docs, ...referenciados.map(x => x.d)];
      const cantidadEscrituras = originales.length + consultasB.size * 2 + referenciados.length + 3;
      if (cantidadEscrituras > 350) bloquear("La fusión es demasiado grande para una sola operación segura. Requiere migración administrativa.");
      const resumen = `${a.nombre || "Paciente"}\n\nHistoria que se conserva: ${principal.id}\nHistoria duplicada: ${secundaria.id}\nConsultas finales: ${todas.length} (se trasladarán ${consultasB.size})\nCitas que se actualizarán: ${referenciados.filter(x => x.esCita).length}\nTratamientos que se actualizarán: ${referenciados.filter(x => !x.esCita).length}\nCitas sin vínculo por ID: ${citasSinVinculo}; tratamientos sin vínculo: ${tratamientosSinVinculo} (no se modificarán).\n${conflictos.length ? "Datos distintos: " + conflictos.join(", ") + ". Se mantendrán los de la historia elegida.\n" : ""}${otros.length ? "Otros campos de la secundaria, conservados en el respaldo: " + otros.join(", ") + ".\n" : ""}\nConfirmá solo si verificaste las dos historias, sus subcolecciones y referencias, tenés respaldo de Firestore y cerraste las demás sesiones. Se archivará el original duplicado y se retirará del listado.`;
      if (!window.confirm(resumen)) return;
      confirmada = true;
      const auditoria = doc(collection(db, "fusionesHistoriasClinicas"));
      const copias = consultasB.docs.map(d => ({ origen: d, destino: doc(db, "historiasClinicas", principal.id, "consultas", d.id) }));
      const igual = (x, y) => {
        if (Object.is(x, y)) return true;
        if (x == null || y == null || typeof x !== typeof y) return false;
        if (typeof x?.isEqual === "function") return x.isEqual(y);
        if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime();
        if (Array.isArray(x) || Array.isArray(y)) return Array.isArray(x) && Array.isArray(y) && x.length === y.length && x.every((v,i) => igual(v,y[i]));
        if (typeof x !== "object") return false;
        if (Object.getPrototypeOf(x) !== Object.prototype || Object.getPrototypeOf(y) !== Object.prototype) return false;
        const keys = Object.keys(x);
        return keys.length === Object.keys(y).length && keys.every(k => Object.prototype.hasOwnProperty.call(y,k) && igual(x[k],y[k]));
      };
      await runTransaction(db, async tx => {
        // Comprobar documentos leídos; todas las lecturas antes de las escrituras.
        for (const original of [...originales, ...consultasA.docs]) {
          const actual = await tx.get(original.ref);
          if (!actual.exists() || !igual(actual.data(), original.data())) bloquear("Un registro cambió durante la revisión. No se aplicó la fusión; volvé a revisar.");
        }
        for (const copia of copias) {
          if ((await tx.get(copia.destino)).exists()) bloquear("Ya existe una consulta con ese ID en la historia principal.");
        }
        // Respaldo y cambios quedan en una misma transacción: si falla un permiso, no cambia nada.
        tx.set(auditoria, { principalId: principal.id, secundariaId: secundaria.id, dni: grupo.dni,
          fecha: serverTimestamp(), cantidadConsultas: todas.length, cantidadCitas: referenciados.filter(x => x.esCita).length,
          cantidadBiologicos: referenciados.filter(x => !x.esCita).length, estado: "FUSIONADA" });
        originales.forEach((original, i) => {
          tx.set(doc(auditoria, "originales", String(i + 1)), { ruta: original.ref.path, datos: original.data() });
        });
        for (const copia of copias) {
          tx.set(copia.destino, copia.origen.data());
          tx.delete(copia.origen.ref);
        }
        referenciados.forEach(({d, cambios}) => tx.update(d.ref, cambios));
        tx.update(principal.ref, cambiosPrincipal);
        tx.delete(secundaria.ref);
      });
      // Las demás sesiones deben recargarse antes de continuar trabajando.
      try {
        sessionStorage.removeItem(PACIENTES_CACHE_KEY);
        localStorage.removeItem("drreuma_historias_cache");
        localStorage.removeItem("drreuma_citas_cache");
        for (const id of ids) localStorage.removeItem(`paciente-cache-${id}`);
      } catch (_) { /* La transacción ya fue confirmada. */ }
      setRevisionDuplicados(null);
      setSoloDuplicados(false);
      setPagina(1);
      alert(`Fusión guardada. Se conservaron ${todas.length} consultas. Abrí la historia y comprobá ambas evoluciones y los vínculos de Agenda. ID de respaldo: ${auditoria.id}`);
      await revisarDuplicados();
    } catch (error) {
      console.error("Fusión de historias", error);
      setErrorRevisionDuplicados(`${confirmada ? "No se pudo confirmar la fusión; volvé a consultar Firebase antes de reintentar." : "No se inició la fusión."} ${error.message || "Error de conexión o permisos."}`);
    } finally {
      fusionEnCursoRef.current = false;
      setFusionando(false);
    }
  };

  const fechaHoyHistoriasTexto =

    new Date()

      .toLocaleDateString(

        "es-AR",

        {

          weekday: "long",

          day: "numeric",

          month: "long",

          year: "numeric"

        }

      )

      .replace(",", "")

      .replace(

        /^./,

        (letra) =>

          letra.toUpperCase()

      );



  return (
<div className={`container historias-modern-container ${modo === "pacientes" ? "modo-nuevo-paciente" : ""}`}>

      {mostrarConfirmacion && (

        <div className="paciente-save-overlay">



          <div className="paciente-save-card">



            <div className="paciente-save-icon">
              {mensajeConfirmacion === "Paciente eliminado"
                ? <FaTrash />
                : mensajeConfirmacion === "Paciente actualizado"
                  ? <FaCheckCircle />
                  : <FaUserCheck />}
            </div>



            <h4>

              {mensajeConfirmacion}

            </h4>



          </div>



        </div>

      )}



      {/* HEADER */}



      {/* HEADER HISTORIAS CLÍNICAS - ESTILO AGENDA */}

<div className="historias-hero historias-hero-compacto">



  <div className="historias-hero-superior">



    <div className="citas-header-badge">

      <FaCalendarAlt />

      <span>Panel médico</span>

    </div>



    <div className="historias-contador-compacto">

  <FaUsers className="historias-contador-icono" />



  <div className="historias-contador-datos">

    <strong>{pacientes.length}</strong>

    <span>Pacientes registrados</span>

  </div>

</div>



  </div>



  <h1 className="historias-titulo-compacto">

    {modo === "pacientes" ? (editando ? "EDITAR PACIENTE" : "NUEVO PACIENTE") : "HISTORIAS CLÍNICAS"}

  </h1>



  <div className="historias-fecha-compacta">

    {fechaHoyHistoriasTexto}

  </div>



</div>



      {/* TABLA PACIENTES DE HOY DESDE AGENDA 



      <div className="card shadow-sm mb-4 historias-tabla-hoy-card">



        <div className="card-header text-center text-white fw-bold pacientes-dia-header">



          <button

            type="button"

            className="pacientes-dia-nav-btn"

            onClick={() =>

              cambiarDiaTablaAgenda(-1)

            }

            title="Ver día anterior"

          >



            <FaChevronLeft />



          </button>



          <div className="pacientes-dia-title">



            <h3 className="mb-0">



              {tituloTablaAgenda}



            </h3>



            {!esTablaDeHoy && (



              <button

                type="button"

                className="pacientes-dia-hoy-btn"

                onClick={

                  irAHoyTablaAgenda

                }

              >



                Volver a hoy



              </button>



            )}



          </div>



          <button

            type="button"

            className="pacientes-dia-nav-btn"

            onClick={() =>

              cambiarDiaTablaAgenda(1)

            }

            title="Ver día siguiente"

          >



            <FaChevronRight />



          </button>



        </div>



        <div className="card-body p-0 table-responsive">



          {cargandoCitas ? (



            <div className="p-3 text-center fw-bold">



              Cargando citas del día...



            </div>



          ) : citasHoyAgenda.length === 0 ? (



            <div className="p-3 text-center fw-bold">



              No hay citas programadas para esta fecha



            </div>



          ) : (



            <table className="table table-sm mb-0 tabla-pacientes-hoy tabla-historias-hoy">



              <thead>



                <tr className="text-center">



                  <th>



                    <span className="celeste">

                      N°

                    </span>



                  </th>



                  <th>



                    <FaClock className="me-1 celeste" />



                    <br />



                    <span className="celeste">

                      Hora

                    </span>



                  </th>



                  <th>



                    <FaUserCheck className="me-2 celeste" />



                    <br />



                    <span className="celeste">

                      Paciente

                    </span>



                  </th>



                  <th>



                    <FaIdCard className="me-2 celeste" />



                    <br />



                    <span className="celeste">

                      DNI

                    </span>



                  </th>



                  <th>



                    <FaWhatsapp className="me-2 celeste" />



                    <br />



                    <span className="celeste">

                      Wp

                    </span>



                  </th>



                  <th>



                    <FaUsers className="me-2 celeste" />



                    <br />



                    <span className="celeste">

                      Vez

                    </span>



                  </th>



                  <th>



                    <FaStethoscope className="me-2 celeste" />



                    <br />



                    <span className="celeste">

                      Motivo

                    </span>



                  </th>



                  <th>



                    <FaCheckCircle className="me-2 celeste" />



                    <br />



                    <span className="celeste">

                      Estado

                    </span>



                  </th>



                </tr>



              </thead>



              <tbody className="text-center">



                {citasHoyAgenda.map(

                  (c, index) => {



                    const numeroCita =

                      obtenerNumeroVezHistoriaClinica(

                        c

                      );



                    return (



                      <tr

                        key={c.id}

                        className={`fila-cita-historia ${

                          citaHoySeleccionadaId ===

                          c.id

                            ? "fila-cita-seleccionada"

                            : ""

                        }`}

                        title="Clic para cargar en Nuevo paciente"

                        onClick={() =>

                          cargarPacienteDesdeCitaHoy(

                            c

                          )

                        }

                      >



                        <td className="tabla-numero-fila">



                          {index + 1}



                        </td>



                        <td>



                          {c.sinAgenda ? (



                            <span className="hora-sin-agenda">



                              Sin hora



                            </span>



                          ) : (



                            c.hora || "-"



                          )}



                        </td>



                        <td>



                          {capitalizarNombre(

                            c.nombre || ""

                          )}



                        </td>



                        <td>



                          {c.Dni ||

                            c.dni ||

                            "-"}



                        </td>



                        <td>



                          {c.telefono ? (



                            <button

                              type="button"

                              className="btn-whatsapp-tabla btn-whatsapp-tabla-solo-icono"

                              onClick={(e) => {

                                e.stopPropagation();



                                abrirWhatsappAgendaHistoria(

                                  c

                                );

                              }}

                              title="Enviar WhatsApp"

                            >



                              <FaWhatsapp />



                            </button>



                          ) : (



                            "-"



                          )}



                        </td>



                        <td>



                          {(() => {



                            const textoVez =

                              textoNumeroCitaPacienteAgenda(

                                numeroCita

                              );



                            return (



                              <span

                                className={

                                  obtenerClaseVezHistoria(

                                    textoVez

                                  )

                                }

                              >



                                {textoVez}



                              </span>



                            );



                          })()}



                        </td>



                        <td>



                          <span

                            className="motivo-tabla-cita"

                            title={

                              c.motivoConsulta ||

                              "Sin motivo"

                            }

                          >



                            {c.motivoConsulta ||

                              "Sin motivo"}



                          </span>



                        </td>



                        <td>



                          <span

                            className={`estado-cita-simple ${obtenerEstadoCitaClase(

                              c

                            )}`}

                          >



                            {obtenerEstadoCitaTexto(

                              c

                            )}



                          </span>



                        </td>



                      </tr>



                    );



                  }

                )}



              </tbody>



            </table>



          )}



        </div>



      </div>



      <br />



       */}



{modo === "pacientes" && (
  <>
{/* BUSCADOR COMPACTO PARA EDITAR O ELIMINAR */}
<style>{`
  .nuevo-paciente-busqueda {
    position: relative;
    z-index: 5;
    margin-bottom: 18px;
    max-width: 100%;
  }
  
.nuevo-paciente-busqueda-campo {
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  height: 48px;
  min-height: 48px;
  padding: 0 16px;

  background: #f1f8fa;
  border: 1.5px solid #c5dce2;
  border-radius: 12px;
  box-shadow: none;
  box-sizing: border-box;

  transition: border-color 0.2s ease;
}

  .nuevo-paciente-busqueda-campo:focus-within {
    border-color: #0b91a8;
    box-shadow: 0 0 0 3px rgba(11,145,168,.1);
  }
  .nuevo-paciente-busqueda-icono { flex: none; color: #123b48; font-size: 17px; }

.nuevo-paciente-busqueda-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 44px;

  padding: 0;
  margin: 0;

  border: none;
  outline: none;
  background: transparent;

  color: #123b48;
  font-size: 16px;
  font-weight: 600;
}

.nuevo-paciente-busqueda-input::placeholder {
  color: #607e87;
  opacity: 1;
}

  .nuevo-paciente-busqueda-input:focus { outline: 0; }
  .nuevo-paciente-busqueda-limpiar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    height: 28px;
    width: 28px;
    border: none;
    border-radius: 50%;
    background: #e3eef0;
    color: #123b48;
    cursor: pointer;
  }
  .nuevo-paciente-busqueda-limpiar:hover { background: #d0e4e9; }
  .nuevo-paciente-resultados {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    max-height: 250px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #d7e6e9;
    border-radius: 12px;
    box-shadow: 0 12px 26px rgba(18,59,72,.14);
  }
  .nuevo-paciente-resultado {
    display: block;
    width: 100%;
    padding: 11px 14px;
    border: none;
    border-bottom: 1px solid #e8eff1;
    text-align: left;
    background: #fff;
    color: #123b48;
    cursor: pointer;
  }
  .nuevo-paciente-resultado:hover, .nuevo-paciente-resultado:focus-visible {
    background: #edf8fa;
  }
  .nuevo-paciente-resultado small { display: block; color: #667981; margin-top: 3px; }
  .nuevo-paciente-eliminar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 43px;
    padding: 9px 17px;
    border: 1px solid #e4c4c4;
    border-radius: 24px;
    background: #fff3f3;
    color: #a52c35;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: background .15s, border-color .15s;
  }
  .nuevo-paciente-eliminar-btn:hover { background: #ffe3e3; border-color: #cf8a8a; }
`}</style>
<div className="nuevo-paciente-busqueda">
  <div className="nuevo-paciente-busqueda-campo">
    <FaSearch className="nuevo-paciente-busqueda-icono" aria-hidden="true" />
    <input
      id="buscar-paciente-admin"
      type="text"
      className="nuevo-paciente-busqueda-input"
      aria-label="Buscar paciente registrado por nombre, apellido o DNI"
      placeholder="Buscar paciente por nombre, apellido o DNI..."
      value={busquedaAdmin}
      autoComplete="off"
      onChange={(e) => {
        setBusquedaAdmin(e.target.value);
        setMostrarResultadosAdmin(true);
      }}
    />
    {busquedaAdmin && (
      <button
        type="button"
        className="nuevo-paciente-busqueda-limpiar"
        onClick={() => {
          setBusquedaAdmin("");
          setMostrarResultadosAdmin(false);
        }}
        aria-label="Limpiar búsqueda"
        title="Limpiar búsqueda"
      >
        <FaTimes />
      </button>
    )}
  </div>
  {mostrarResultadosAdmin && busquedaAdmin.trim() && (
    <div className="nuevo-paciente-resultados" role="listbox" aria-label="Pacientes encontrados">
      {pacientesBusquedaAdmin.length ? pacientesBusquedaAdmin.map((p) => (
        <button
          key={p.id}
          type="button"
          className="nuevo-paciente-resultado"
          onClick={() => seleccionarPacienteAdmin(p)}
        >
          <strong>{p.nombre || [p.nombres, p.apellidos].filter(Boolean).join(" ")}</strong>
          <small>DNI: {p.dni || p.Dni || "-"} · {p.obraSocial || "Sin obra social"}</small>
        </button>
      )) : (
        <div className="p-3 text-muted">No se encontraron pacientes</div>
      )}
    </div>
  )}
</div>

{/* =====================================================

    NUEVO PACIENTE + INTERNOS CLÍNICA

===================================================== */}



<div className="historias-form-internos-grid mb-4">





  {/* =================================================

      NUEVO / EDITAR PACIENTE

  ================================================= */}



  <div

    ref={nuevoPacienteRef}

    className="historias-form-card historias-form-card-grid"

  >



    <div className="historias-form-title">



      <div className="historias-form-icon">

        <FaUserPlus />

      </div>



      <div>



        <h4>

          {editando

            ? "Editar paciente"

            : "Nuevo paciente"}

        </h4>



        <p>

          Completa los datos para la historia clínica.

        </p>



      </div>



    </div>





    <form

      onSubmit={

        editando

          ? guardarEdicion

          : crearPaciente

      }

    >



      <div className="row g-3">





        {/* NOMBRE */}



        <div className="col-12 col-md-6">

  <label className="historias-label">

    Nombres

  </label>



  <input

    className="form-control historias-input"

    placeholder="Nombres del paciente"

    value={nombre}

    onKeyDown={(e) => {

  if (

    !e.ctrlKey &&

    !e.metaKey &&

    !e.altKey &&

    e.key.length === 1 &&

    !/^[\p{L}\s'-]$/u.test(e.key)

  ) {

    e.preventDefault();

  }

}}

    onChange={(e) =>

  setNombre(formatearNombre(e.target.value))

}

    required

  />

</div>



<div className="col-12 col-md-6">

  <label className="historias-label">

    Apellidos

  </label>



  <input

    className="form-control historias-input"

    placeholder="Apellidos del paciente"

    value={apellidos}

    onKeyDown={(e) => {

  if (

    !e.ctrlKey &&

    !e.metaKey &&

    !e.altKey &&

    e.key.length === 1 &&

    !/^[\p{L}\s'-]$/u.test(e.key)

  ) {

    e.preventDefault();

  }

}}

   onChange={(e) =>

  setApellidos(formatearNombre(e.target.value))

}

  />

</div>



        {/* DNI */}



        <div className="col-12 col-md-6">



          <label className="historias-label">

            DNI

          </label>



          <input

            className="form-control historias-input"

            placeholder="Ej: 12345678"

            value={dni}

            onKeyDown={(e) => {

  if (

    !e.ctrlKey &&

    !e.metaKey &&

    !e.altKey &&

    e.key.length === 1 &&

    !/^[0-9]$/.test(e.key)

  ) {

    e.preventDefault();

  }

}}

           onChange={(e) =>

  setDni(soloNumeros(e.target.value))

}

            required

          />



        </div>





        {/* FECHA NACIMIENTO */}



        <div className="col-12 col-md-4">



          <label className="historias-label">

            Fecha de nacimiento

          </label>



          <input

            type="text"

            inputMode="numeric"

            placeholder="DD-MM-AAAA"

            maxLength="10"

            className="form-control historias-input"

            value={fechaNacimiento}

            onChange={(e) => {



              let valor =

                e.target.value.replace(

                  /\D/g,

                  ""

                );





              if (

                valor.length > 8

              ) {



                valor =

                  valor.slice(

                    0,

                    8

                  );



              }





              if (

                valor.length >= 5

              ) {



                valor =

                  `${valor.slice(

                    0,

                    2

                  )}-${valor.slice(

                    2,

                    4

                  )}-${valor.slice(

                    4

                  )}`;



              } else if (

                valor.length >= 3

              ) {



                valor =

                  `${valor.slice(

                    0,

                    2

                  )}-${valor.slice(

                    2

                  )}`;



              }





              setFechaNacimiento(

                valor

              );



            }}

            required

          />



        </div>





        {/* OBRA SOCIAL */}



        <div className="col-12 col-md-4">



          <label className="historias-label">

            Obra social

          </label>



          <input

            className="form-control historias-input"

            placeholder="Ej: ISSN / OSDE / Particular"

            value={obraSocial}

            onChange={(e) => setObraSocial(e.target.value.toUpperCase())}

            required

          />



        </div>



        <div className="col-12 col-md-4">

  <label className="historias-label">

    N.º de credencial (opcional)

  </label>



  <input

    type="text"

    className="form-control historias-input"

    placeholder="Número de credencial"

    value={numeroCredencial}

    onKeyDown={(e) => {

  if (

    !e.ctrlKey &&

    !e.metaKey &&

    !e.altKey &&

    e.key.length === 1 &&

    !/^[0-9]$/.test(e.key)

  ) {

    e.preventDefault();

  }

}}

    onChange={(e) =>

  setNumeroCredencial(formatearCredencial(e.target.value))

}

    maxLength={40}

    autoComplete="off"

  />

</div>





        {/* SEXO */}



        <div className="col-12 col-md-4">



          <label className="historias-label">

            Sexo

          </label>



          <select

            className="form-select historias-input"

            value={sexo}

            onChange={(e) =>

              setSexo(

                e.target.value

              )

            }

            required

          >



            <option value="">

              Seleccione sexo

            </option>



            <option value="Masculino">

              Masculino

            </option>



            <option value="Femenino">

              Femenino

            </option>



          </select>



        </div>





      </div>





      {/* BOTONES */}



      <div className="historias-form-actions">



        <button type="submit" className="historias-save-btn" disabled={guardandoPaciente}>



          {editando ? (

            <>

              <FaCheckCircle />

              Guardar cambios

            </>

          ) : (

            <>

              <FaPlus />

              Guardar paciente

            </>

          )}



        </button>





        {editando && (
          <button
            type="button"
            className="nuevo-paciente-eliminar-btn"
            onClick={() => eliminarPaciente(editando)}
          >
            <FaTrash /> Eliminar paciente
          </button>
        )}

        {editando && (


          <button

            type="button"

            className="historias-cancel-btn"

            onClick={

              cancelarEdicion

            }

          >



            <FaTimes />



            Cancelar



          </button>



        )}



      </div>



    </form>



  </div>







  {/* =================================================

      INTERNOS CLÍNICA

  ================================================= */}



  <div className="historias-internos-card">



    <div className="historias-internos-header">



      <div className="historias-internos-icono">

        <FaPhoneAlt />

      </div>



      <div>



        <h4>

          Internos Clínica

        </h4>



        <p>

          Números de acceso rápido.

        </p>



      </div>



    </div>





<div className="historias-internos-lista">



  <div className="historias-interno-fila">

    <span>Admisión general</span>

    <strong>1009</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Informe de imágenes</span>

    <strong>1006</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Admisión de imágenes</span>

    <strong>1014</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Bioquímico de laboratorio</span>

    <strong>1041</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Admisión de laboratorio</span>

    <strong>1031</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Sala médicos internación</span>

    <strong>1021</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Consultorios de guardia</span>

    <strong>1011 · 1012</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Médicos de terapia</span>

    <strong>1016</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Planta baja consultorio</span>

    <strong>1100</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Primer piso consultorio</span>

    <strong>1110</strong>

  </div>



  <div className="historias-interno-fila">

    <span>Cuarto piso consultorio</span>

    <strong>1140</strong>

  </div>



</div>



  </div>





</div>



        </>
)}

      {modo === "historias" && (
      <>


      <style>{`
        .historias-barra-herramientas {
          display: grid !important;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          margin-bottom: 22px;
        }
        .historias-barra-herramientas .historias-search-card {
          width: 100% !important;
          max-width: none !important;
          min-width: 0;
          min-height: 48px !important;
          height: 48px !important;
          margin: 0 !important;
          border: 1.5px solid #c5dce2 !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          box-sizing: border-box;
        }
        .historias-barra-herramientas .historias-search-input {
          width: 100%; min-width: 0; height: 44px !important;
          padding-top: 0 !important; padding-bottom: 0 !important;
          border: 0 !important; box-shadow: none !important;
          background: transparent !important; font-size: 16px !important;
        }
        .historias-selector-enfermedad { position: relative; min-width: 0; }
        .historias-selector-boton {
          width: 100%; height: 48px; padding: 0 12px; background: #fff;
          border: 1.5px solid #c5dce2; border-radius: 12px;
          display: flex; align-items: center; gap: 9px;
          color: #173b46; font-size: 13px; font-weight: 600;
          text-align: left; cursor: pointer;
        }
        .historias-selector-boton:hover, .historias-selector-boton:focus-visible,
        .historias-exportar-pdf:hover, .historias-exportar-pdf:focus-visible {
          border-color: #0aa0b3; outline: none; box-shadow: 0 0 0 3px #d5f4f7;
        }
        .historias-selector-etiqueta { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .historias-selector-menu {
          position: absolute; z-index: 30; top: calc(100% + 7px); left: 0;
          width: min(370px, 90vw); max-width: 100%; background: white;
          border: 1px solid #c5dce2; border-radius: 13px;
          box-shadow: 0 12px 30px rgba(17, 59, 72, .15); overflow: hidden;
        }
        .historias-selector-menu input {
          width: calc(100% - 20px); margin: 10px; height: 38px;
          border: 1px solid #c5dce2; border-radius: 8px;
          padding: 0 10px; font-size: 16px; outline-color: #0aa0b3;
        }
        .historias-selector-opciones { max-height: 245px; overflow-y: auto; padding: 3px 6px 8px; }
        .historias-selector-opciones button {
          width: 100%; text-align: left; background: white;
          border: 0; border-radius: 7px; padding: 9px 10px;
          color: #173b46; font-size: 13px; cursor: pointer;
        }
        .historias-selector-opciones button:hover,
        .historias-selector-opciones button[aria-selected="true"] { background: #e7f5f7; font-weight: 700; }
        .historias-exportar-pdf {
          height: 48px; padding: 0 19px; border-radius: 12px;
          background: #123b48; border: 1.5px solid #123b48;
          color: #fff; display: flex; align-items: center; justify-content: center;
          gap: 8px; font-size: 13px; font-weight: 800; white-space: nowrap;
          cursor: pointer;
        }
        .historias-exportar-pdf:hover { background: #0d5663; color: #fff; }
        @media (max-width: 760px) {
          .historias-barra-herramientas { grid-template-columns: minmax(0,1fr) auto; }
          .historias-barra-herramientas .historias-search-card { grid-column: 1 / -1; }
        }
        @media (max-width: 430px) {
          .historias-exportar-pdf { padding: 0 12px; }
        }
      `}</style>
      <div className="historias-barra-herramientas">
        <div className="historias-search-card">
          <FaSearch className="historias-search-icon" />
          <input
            className="form-control historias-search-input"
            placeholder="Buscar por nombre o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button type="button" className="historias-clear-search"
              title="Limpiar búsqueda" onClick={() => setBusqueda("")}>
              <FaTimes />
            </button>
          )}
        </div>
        <div
  className="historias-selector-enfermedad"
  ref={filtroEnfermedadRef}
>
          <button type="button" className="historias-selector-boton"
            aria-expanded={filtroEnfermedadAbierto}
            aria-haspopup="listbox"
            onClick={() => {
              setFiltroEnfermedadAbierto((abierto) => !abierto);
              setBusquedaEnfermedad("");
            }}>
            <FaStethoscope aria-hidden="true" />
            <span className="historias-selector-etiqueta">{filtroEnfermedad || "Todas las enfermedades"}</span>
            <FaChevronDown aria-hidden="true" />
          </button>
          {filtroEnfermedadAbierto && (
            <div className="historias-selector-menu">
              <input  type="search" aria-label="Buscar enfermedad"
                placeholder="Buscar diagnóstico..." value={busquedaEnfermedad}
                onChange={(e) => setBusquedaEnfermedad(e.target.value)} />
              <div className="historias-selector-opciones" role="listbox" aria-label="Enfermedades">
                <button type="button" role="option" aria-selected={!filtroEnfermedad}
                  onClick={() => { setFiltroEnfermedad(""); setFiltroEnfermedadAbierto(false); }}>
                  Todas las enfermedades
                </button>
                {enfermedadesVisibles.map((diagnostico) => (
                  <button type="button" role="option" aria-selected={filtroEnfermedad === diagnostico}
                    key={diagnostico} onClick={() => {
                      setFiltroEnfermedad(diagnostico);
                      setFiltroEnfermedadAbierto(false);
                    }}>{diagnostico}</button>
                ))}
                {enfermedadesVisibles.length === 0 && (
                  <div className="px-3 py-2 text-muted small">Sin coincidencias</div>
                )}
              </div>
            </div>
          )}
        </div>
        <button type="button" className="historias-exportar-pdf"
          title="Imprimir o guardar en PDF todos los pacientes filtrados"
          onClick={imprimirPacientesFiltrados}>
          <FaFilePdf aria-hidden="true" /> PDF
        </button>
      </div>
          
{!cargandoPacientes && gruposDuplicados.length > 0 && (
  <div className="alert alert-warning d-flex align-items-center justify-content-between flex-wrap gap-2" role="status">
    <div>
      <strong>{gruposDuplicados.length} DNI con historias duplicadas</strong>
      <div className="small">Revisá estas historias antes de fusionarlas. No elimines sus consultas.</div>
    </div>
    <button type="button" className="btn btn-outline-dark btn-sm"
      onClick={() => {
        setSoloDuplicados((anterior) => !anterior);
        setBusqueda("");
        setFiltroEnfermedad("");
        setPagina(1);
      }}>
      {soloDuplicados ? "Ver todos" : "Ver duplicados"}
    </button>
  </div>
)}
{!cargandoPacientes && gruposDuplicados.length > 0 && (
  <div className="mb-3">
    <button type="button" className="btn btn-outline-primary"
      onClick={revisarDuplicados} disabled={revisandoDuplicados || fusionando}>
      <FaFolderOpen /> {revisandoDuplicados ? "Revisando registros..." : "Revisar historias antes de fusionar"}
    </button>
  </div>
)}
{errorRevisionDuplicados && <div className="alert alert-danger" role="alert">{errorRevisionDuplicados}</div>}
{revisionDuplicados !== null && (
  <section className="card shadow-sm mb-3" aria-label="Revisión de historias duplicadas">
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h5 className="fw-bold">Revisión de duplicados</h5>
          <p className="small text-muted mb-0">Consultas reales de Firebase. Elegí qué historia conservar únicamente tras verificar la identidad, revisar subcolecciones y tener un respaldo. No se fusionan citas antiguas sin ID automáticamente.</p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setRevisionDuplicados(null)} disabled={fusionando} aria-label="Cerrar revisión"><FaTimes /></button>
      </div>
      {!HABILITAR_FUSION_HISTORIAS && <div className="alert alert-warning small" role="status">Fusión protegida. Verificá respaldo, permisos y subcolecciones antes de habilitarla.</div>}
      {revisionDuplicados.length === 0 && <p>No se encontraron DNI duplicados al consultar directamente Firebase.</p>}
      {revisionDuplicados.map(({ dni, fichas }) => (
        <section className="border rounded p-3 mb-3" key={dni}>
          <h6 className="fw-bold">DNI: {dni} · {fichas.length} historias</h6>
          <p className="small mb-2">{fichas.reduce((total, f) => total + f.cantidad, 0)} consultas encontradas en total (sin deduplicar).</p>
          <div className="row g-2">
            {fichas.map((f, i) => (
              <div className="col-12 col-md-6" key={f.id}>
                <div className="border rounded p-3 h-100">
                  <div className="small text-muted">Historia {i + 1}</div>
                  <strong>{f.nombre || "Sin nombre"}</strong>
                  <div className="small">Nacimiento: {f.nacimiento} · {f.sexo}</div>
                  <div className="small">Obra social: {f.cobertura}</div>
                  {f.dnis.length !== 1 && <div className="alert alert-warning py-1 px-2 mt-2 small">DNI inconsistentes: {f.dnis.join(" / ")}. Revisar identidad.</div>}
                  <div className="small mt-2"><strong>Consultas: {f.cantidad}</strong></div>
                  {f.fechas.map(c => <div className="small" key={c.id}>• {c.fecha} {c.hora}</div>)}
                  <div className="small mt-2">Citas vinculadas: {f.citas} · Biológicos: {f.biologicos}</div>
                  <div className="small text-muted text-break mt-1">ID: {f.id}</div>
                  <button type="button" className="btn btn-outline-primary btn-sm mt-2" disabled={fusionando} onClick={() => navigate(`/admin/historia/${encodeURIComponent(f.id)}`)}><FaFolderOpen /> Abrir historia</button>
                  {fichas.length === 2 && <button type="button" className="btn btn-outline-success btn-sm mt-2 ms-2" disabled={!HABILITAR_FUSION_HISTORIAS || fusionando || revisandoDuplicados || f.dnis.length !== 1} onClick={() => fusionarHistorias({ dni, fichas }, f.id)}><FaCheckCircle /> {fusionando ? "Procesando..." : "Conservar esta y fusionar"}</button>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </section>
)}
{soloDuplicados && gruposDuplicados.length === 0 && (
  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setSoloDuplicados(false)}>Ver todos</button>
)}
{!cargandoPacientes && (
  <div
    className="historias-resultados-contador"
    role="status"
    aria-live="polite"
  >
    Se muestran{" "}
    <strong>{pacientesFiltrados.length}</strong>{" "}
    {pacientesFiltrados.length === 1
      ? "paciente"
      : "pacientes"}
  </div>
)}

      {cargandoPacientes ? (
        <div className="historias-empty"><h5>Cargando pacientes...</h5></div>
      ) : pacientesPagina.length === 0 ? (
        <div className="historias-empty"><FaSearch /><h5>No se encontraron pacientes</h5>
          <p>Probá otra búsqueda o modificá el filtro.</p></div>
      ) : modo === "historias" ? (
        <div className="historias-list">
          {pacientesPagina.map((p) => {
            const avatar = p.sexo?.toLowerCase() === "femenino" ? femaleAvatar : maleAvatar;
            const edad = calcularEdad(p.fechaNacimiento);
            const diagnos = Array.isArray(p.diagnosticosResumen) ? p.diagnosticosResumen : [];
            return (
              <div key={p.id} className="historias-paciente-card"
                role="link" tabIndex={0}
                title="Abrir historia clínica"
                style={{cursor: "pointer"}}
                onClick={() => navigate(`/admin/historia/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/admin/historia/${p.id}`);
                  }
                }}
              >
                <div className="historias-consultas-badge-card">
                  <span>Consultas</span><strong>{p.cantidadConsultas || 0}</strong>
                </div>
                <div className="historias-paciente-main">
                  <img src={avatar} alt="" className="historias-avatar" />
                  <div className="historias-paciente-info">
                    <h4>{p.nombre}</h4>
                    {idsDuplicados.has(p.id) && (
                      <span className="badge bg-warning text-dark mb-2">DNI duplicado · revisar</span>
                    )}
                    <div className="historias-paciente-grid">
                      <span><FaIdCard /> DNI: {p.dni || "-"}</span>
                      <span><FaBirthdayCake /> {formatearFecha(p.fechaNacimiento)}{edad !== null ? ` (${edad} años)` : ""}</span>
                      <span><FaShieldAlt /> {String(p.obraSocial || "-").toUpperCase()}</span>
                      <span><FaVenusMars /> {p.sexo || "-"}</span>
                      <span><FaCalendarAlt /> Última consulta: {obtenerUltimaConsultaCard(p)}</span>
                    </div>
                    {diagnos.length > 0 && (
                      <div className="historias-diag-chips">
                        {diagnos.map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card shadow-sm mb-4" style={{borderRadius: "16px", overflow: "hidden"}}>
          <div className="card-body" style={{padding: "10px 18px"}}>
            {pacientesPagina.map((p) => (
              <div key={p.id} className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-3 border-bottom">
                <div>
                  <strong>{p.nombre || [p.nombres, p.apellidos].filter(Boolean).join(" ")}</strong>
                  <div className="text-muted small">DNI: {p.dni || "-"} · {p.obraSocial || "Sin obra social"}</div>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-primary btn-sm"
                    onClick={() => editarPaciente(p)}><FaPencilAlt /> Editar</button>
                  <button type="button" className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminarPaciente(p.id)}><FaTrash /> Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGINACIÓN */}



      <div className="historias-pagination">



        <button

          className="historias-page-btn"

          disabled={

            pagina === 1

          }

          onClick={() =>

            setPagina(

              pagina - 1

            )

          }

        >



          <FaChevronLeft />



        </button>



        <span>



          Página{" "}



          <strong>

            {pagina}

          </strong>{" "}



          de{" "}



          <strong>

            {totalPaginas}

          </strong>



        </span>



        <button

          className="historias-page-btn"

          disabled={

            pagina ===

            totalPaginas

          }

          onClick={() =>

            setPagina(

              pagina + 1

            )

          }

        >



          <FaChevronRight />



        </button>



      </div>
      </>
      )}

    </div>

  );

}

export default HistoriasClinicas;