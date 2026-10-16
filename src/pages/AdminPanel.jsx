import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";

import ModalDetalle from "../components/ModalDetalle";
import ModalCita from "../components/ModalCita";

import { db } from "../firebase";

import {
  FaCalendarAlt,
  FaUserCheck,
  FaHourglassHalf,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaUserTimes,
  FaClock,
  FaUser,
  FaIdCard,
  FaWhatsapp,
  FaUsers,
  FaStethoscope,
  FaEye
} from "react-icons/fa";


function AdminPanel() {

  const navigate = useNavigate();


  /* =====================================================
     ESTADOS
  ===================================================== */

  const [citasDB, setCitasDB] =
    useState([]);

  const [
    historiasPacientes,
    setHistoriasPacientes
  ] = useState([]);


  /* DETALLE CITA */

  const [
    showDetalle,
    setShowDetalle
  ] = useState(false);

  const [
    citaSeleccionada,
    setCitaSeleccionada
  ] = useState(null);


  /* EDITAR CITA */

  const [
    showModal,
    setShowModal
  ] = useState(false);

  const [
    citaEditar,
    setCitaEditar
  ] = useState(null);


  /* RELOJ PARA ESTADOS */

  const [reloj, setReloj] =
    useState(Date.now());


  /* FECHA QUE MUESTRA LA TABLA */

  const [
    fechaTabla,
    setFechaTabla
  ] = useState(() => {

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

  });


  /* =====================================================
     FIRESTORE - CITAS
  ===================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "citas"),
        (snapshot) => {

          const datos =
            snapshot.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data()
              })
            );

          setCitasDB(datos);

        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     FIRESTORE - HISTORIAS
  ===================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "historiasClinicas"
        ),
        (snapshot) => {

          const datos =
            snapshot.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data()
              })
            );

          setHistoriasPacientes(
            datos
          );

        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     ACTUALIZAR ESTADOS CADA MINUTO
  ===================================================== */

  useEffect(() => {

    const intervalo =
      setInterval(() => {

        setReloj(
          Date.now()
        );

      }, 60000);


    return () =>
      clearInterval(
        intervalo
      );

  }, []);


  /* =====================================================
     FECHAS
  ===================================================== */

  const obtenerHoyLocal = () => {

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


  const convertirISOADateLocal =
    (fechaISO) => {

      const [
        anio,
        mes,
        dia
      ] =
        fechaISO
          .split("-")
          .map(Number);


      return new Date(
        anio,
        mes - 1,
        dia
      );

    };


  const fechaISODesdeDate =
    (fecha) => {

      const offset =
        fecha.getTimezoneOffset();


      return new Date(
        fecha.getTime() -
        offset * 60000
      )
        .toISOString()
        .split("T")[0];

    };


  /* =====================================================
     NAVEGAR TABLA
     SALTAR DOMINGOS
  ===================================================== */

  const cambiarDiaTabla =
    (dias) => {

      const fecha =
        convertirISOADateLocal(
          fechaTabla
        );


      do {

        fecha.setDate(
          fecha.getDate() +
          dias
        );

      } while (
        fecha.getDay() === 0
      );


      setFechaTabla(
        fechaISODesdeDate(
          fecha
        )
      );

    };


  const formatearFechaTabla =
    (fechaISO) => {

      return convertirISOADateLocal(
        fechaISO
      ).toLocaleDateString(
        "es-AR",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );

    };


  /* =====================================================
     NOMBRES / DNI
  ===================================================== */

  const capitalizarNombre =
    (texto = "") => {

      return texto
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map(
          palabra =>
            palabra
              .charAt(0)
              .toUpperCase() +
            palabra.slice(1)
        )
        .join(" ");

    };


  const normalizarNombre =
    (valor = "") => {

      return valor
        .toString()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    };


  const limpiarDni =
    (valor = "") => {

      return valor
        .toString()
        .replace(/\D/g, "")
        .trim();

    };


  const obtenerDni =
    (cita = {}) => {

      return limpiarDni(

        cita.Dni ||
        cita.dni ||
        cita.DNI ||
        cita.documento ||
        cita.numeroDocumento ||
        ""

      );

    };


  /* =====================================================
     BUSCAR HISTORIA DEL PACIENTE
  ===================================================== */

  const buscarPacienteHistoria =
    (cita = {}) => {

      const historiaId =
        cita.historiaClinicaId ||
        cita.pacienteId ||
        "";


      if (historiaId) {

        const paciente =
          historiasPacientes.find(
            p =>
              p.id === historiaId
          );


        if (paciente) {
          return paciente;
        }

      }


      const dniCita =
        obtenerDni(cita);


      if (dniCita) {

        const paciente =
          historiasPacientes.find(
            p =>
              limpiarDni(
                p.dni ||
                p.Dni ||
                p.DNI ||
                p.documento ||
                ""
              ) === dniCita
          );


        if (paciente) {
          return paciente;
        }

      }


      const nombreCita =
        normalizarNombre(
          cita.nombre || ""
        );


      if (!nombreCita) {
        return null;
      }


      return (
        historiasPacientes.find(
          p =>
            normalizarNombre(
              p.nombre || ""
            ) === nombreCita
        ) || null
      );

    };


  /* =====================================================
     SABER SI YA SE REGISTRÓ CONSULTA
  ===================================================== */

  const pacienteTieneConsultaHoy =
    (cita) => {

      const paciente =
        buscarPacienteHistoria(
          cita
        );


      if (
        !paciente
          ?.ultimaConsultaAtMillis ||
        !cita?.fecha
      ) {

        return false;

      }


      const fechaConsulta =
        fechaISODesdeDate(
          new Date(
            Number(
              paciente
                .ultimaConsultaAtMillis
            )
          )
        );


      return (
        fechaConsulta ===
        cita.fecha
      );

    };


  /* =====================================================
     NO ASISTIÓ AUTOMÁTICO
     2 HORAS DE GRACIA
  ===================================================== */

  const HORAS_GRACIA_NO_ASISTIO =
    2;


  const citaYaPaso =
    (cita) => {

      if (
        !cita?.fecha ||
        !cita?.hora
      ) {

        return false;

      }


      const fechaHoraCita =
        new Date(
          `${cita.fecha}T${cita.hora}:00`
        );


      if (
        Number.isNaN(
          fechaHoraCita.getTime()
        )
      ) {

        return false;

      }


      const limiteNoAsistio =
        fechaHoraCita.getTime() +
        HORAS_GRACIA_NO_ASISTIO *
          60 *
          60 *
          1000;


      return (
        reloj >=
        limiteNoAsistio
      );

    };


  /* =====================================================
     ESTADO DE CITA
  ===================================================== */

  const obtenerEstadoCitaTexto =
    (cita) => {

      if (
        pacienteTieneConsultaHoy(
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
          "noAsistio" ||
        cita.estadoAsistencia ===
          "noAsistio"
      ) {

        return "No asistió";

      }


      if (
        citaYaPaso(cita)
      ) {

        return "No asistió";

      }


      if (
        cita.estadoCita ===
          "confirmado" ||
        cita.estadoConfirmacion ===
          "confirmado"
      ) {

        return "Confirmado";

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
        estado === "No asistió"
      ) {
        return "estado-no-asistio";
      }


      if (
        estado === "Confirmado"
      ) {
        return "estado-confirmado";
      }


      return "estado-pendiente";

    };


  /* =====================================================
     NÚMERO DE CONSULTA
  ===================================================== */

  const sonLaMismaPersona =
    (citaA, citaB) => {

      const dniA =
        obtenerDni(citaA);

      const dniB =
        obtenerDni(citaB);


      if (
        dniA &&
        dniB &&
        dniA === dniB
      ) {

        return true;

      }


      return (
        normalizarNombre(
          citaA?.nombre || ""
        ) ===
        normalizarNombre(
          citaB?.nombre || ""
        )
      );

    };


  const obtenerNumeroCitaPaciente =
    (cita) => {

      const paciente =
        buscarPacienteHistoria(
          cita
        );


      if (paciente) {

        const consultas =
          Number(
            paciente
              .cantidadConsultas ||
            0
          );


        if (
          obtenerEstadoCitaTexto(
            cita
          ) === "Asistió"
        ) {

          return Math.max(
            consultas,
            1
          );

        }


        return consultas + 1;

      }


      const citasPaciente =
        citasDB
          .filter(
            c =>
              sonLaMismaPersona(
                c,
                cita
              )
          )
          .sort(
            (a, b) => {

              const fechaA =
                new Date(
                  `${a.fecha}T${
                    a.hora || "00:00"
                  }`
                );

              const fechaB =
                new Date(
                  `${b.fecha}T${
                    b.hora || "00:00"
                  }`
                );


              return (
                fechaA -
                fechaB
              );

            }
          );


      const posicion =
        citasPaciente.findIndex(
          c =>
            c.id === cita.id
        );


      return (
        posicion === -1
          ? 1
          : posicion + 1
      );

    };


  const textoNumeroCitaPaciente =
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


  const obtenerClaseVez =
    (texto = "") => {

      const valor =
        texto.toLowerCase();


      if (
        valor.includes(
          "primera"
        )
      ) {

        return (
          "vez-badge vez-primera"
        );

      }


      if (
        valor.includes(
          "segunda"
        )
      ) {

        return (
          "vez-badge vez-segunda"
        );

      }


      return (
        "vez-badge vez-tercera-mas"
      );

    };


  /* =====================================================
     WHATSAPP
  ===================================================== */

  const abrirWhatsapp =
    (cita) => {

      if (
        !cita?.telefono
      ) {
        return;
      }


      let numero =
        cita.telefono
          .toString()
          .replace(/\D/g, "");


      if (
        !numero.startsWith("549")
      ) {

        if (
          numero.startsWith("54")
        ) {

          numero =
            numero.slice(2);

        }


        if (
          numero.startsWith("0")
        ) {

          numero =
            numero.slice(1);

        }


        if (
          numero.startsWith("9") &&
          numero.length === 11
        ) {

          numero =
            numero.slice(1);

        }


        numero =
          `549${numero}`;

      }


      const mensaje =
        encodeURIComponent(

          `Hola ${capitalizarNombre(
            cita.nombre || ""
          )}, te recordamos tu cita con el Dr. Tony Vélez (Reumatólogo).\n\n` +

          `Fecha: ${cita.fecha}\n` +

          `Hora: ${
            cita.hora || "Sin hora"
          } hs\n\n` +

          `Muchas gracias por agendar con Dr. Reuma. Cualquier consulta, no dudes en comunicarte con nosotros.`

        );


      window.open(
        `https://wa.me/${numero}?text=${mensaje}`,
        "_blank"
      );

    };


  /* =====================================================
     ABRIR HISTORIA
     TODA LA FILA
  ===================================================== */

  const abrirHistoria =
    (cita) => {

      const paciente =
        buscarPacienteHistoria(
          cita
        );


      if (
        paciente?.id
      ) {

        window.open(
          `/admin/historia/${paciente.id}?citaId=${cita.id}`,
          "_blank",
          "noopener,noreferrer"
        );

        return;

      }


      /*
       * Si por algún motivo todavía
       * no tiene historia asociada.
       */

      navigate(
        "/admin/historias"
      );

    };


  /* =====================================================
     OJITO
     ABRIR DETALLE SIN SALIR DEL HOME
  ===================================================== */

  const abrirDetalleCita =
    (cita) => {

      if (!cita) {
        return;
      }


      setCitaSeleccionada(
        cita
      );

      setShowDetalle(
        true
      );

    };


  /* =====================================================
     LIMPIAR TELÉFONO
  ===================================================== */

  const limpiarTelefono10 =
    (telefono = "") => {

      let numero =
        telefono
          .toString()
          .replace(/\D/g, "");


      if (!numero) {
        return "";
      }


      if (
        numero.startsWith("00")
      ) {

        numero =
          numero.slice(2);

      }


      if (
        numero.startsWith("549") &&
        numero.length >= 13
      ) {

        numero =
          numero.slice(3);

      }


      if (
        numero.startsWith("54") &&
        numero.length >= 12
      ) {

        numero =
          numero.slice(2);

      }


      if (
        numero.startsWith("9") &&
        numero.length === 11
      ) {

        numero =
          numero.slice(1);

      }


      if (
        numero.startsWith("0") &&
        numero.length === 11
      ) {

        numero =
          numero.slice(1);

      }


      if (
        numero.length > 10
      ) {

        numero =
          numero.slice(-10);

      }


      return numero;

    };


  /* =====================================================
     TIPO DE CITA
  ===================================================== */

  const obtenerTipoCitaPorFecha =
    (fecha) => {

      if (!fecha) {
        return "presencial";
      }


      const [
        anio,
        mes,
        dia
      ] =
        fecha
          .split("-")
          .map(Number);


      const fechaLocal =
        new Date(
          anio,
          mes - 1,
          dia
        );


      /*
       * SÁBADO = VIRTUAL
       */

      return (
        fechaLocal.getDay() === 6
          ? "virtual"
          : "presencial"
      );

    };


  /* =====================================================
     CONFIRMAR DESDE MODAL HOME
  ===================================================== */

  const confirmarCitaDesdeHome =
    async (cita) => {

      if (
        !cita?.id
      ) {
        return;
      }


      await updateDoc(
        doc(
          db,
          "citas",
          cita.id
        ),
        {
          estadoCita:
            "confirmado",

          estadoConfirmacion:
            "confirmado",

          estadoAsistencia:
            cita.estadoAsistencia ||
            "pendiente"
        }
      );


      setCitaSeleccionada(
        prev =>
          prev?.id === cita.id
            ? {
                ...prev,

                estadoCita:
                  "confirmado",

                estadoConfirmacion:
                  "confirmado"
              }
            : prev
      );


      setShowDetalle(
        false
      );

    };


  /* =====================================================
     HORARIOS PARA EDITAR DESDE HOME
  ===================================================== */

  const generarHorarios =
    (inicio, fin) => {

      const horarios = [];

      let [h, m] =
        inicio
          .split(":")
          .map(Number);

      const [
        hFin,
        mFin
      ] =
        fin
          .split(":")
          .map(Number);


      while (
        h < hFin ||
        (
          h === hFin &&
          m < mFin
        )
      ) {

        horarios.push(
          `${String(h)
            .padStart(
              2,
              "0"
            )}:${String(m)
            .padStart(
              2,
              "0"
            )}`
        );


        m += 30;


        if (
          m >= 60
        ) {

          m = 0;
          h++;

        }

      }


      return horarios;

    };


  const obtenerHorariosDisponiblesHome =
    (fecha) => {

      if (!fecha) {
        return [];
      }


      const [
        anio,
        mes,
        dia
      ] =
        fecha
          .split("-")
          .map(Number);


      const numeroDia =
        new Date(
          anio,
          mes - 1,
          dia
        ).getDay();


      let base = [];


      /* LUNES - MARTES - MIÉRCOLES */

      if (
        numeroDia === 1 ||
        numeroDia === 2 ||
        numeroDia === 3
      ) {

        base =
          generarHorarios(
            "15:00",
            "18:00"
          );

        base.unshift(
          "14:45"
        );

      }


      /* JUEVES */

      else if (
        numeroDia === 4
      ) {

        base = [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "13:20"
        ];

      }


      /* VIERNES */

      else if (
        numeroDia === 5
      ) {

        /*
         * Como la configuración mañana/tarde
         * vive en Agenda, aquí permitimos
         * ambos grupos al editar.
         */

        base = [
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "13:20",

          "14:45",
          "15:00",
          "15:20",
          "15:40",
          "16:00",
          "16:20",
          "16:40"
        ];

      }


      /* SÁBADO */

      else if (
        numeroDia === 6
      ) {

        base =
          generarHorarios(
            "09:00",
            "13:00"
          );

      }


      /* DOMINGO */

      else {

        return [];

      }


      /*
       * Quitamos horarios ocupados
       * excepto el de la propia cita
       * que estamos editando.
       */

      return base.filter(
        hora => {

          return !citasDB.some(
            cita =>

              cita.fecha === fecha &&

              cita.hora === hora &&

              cita.id !==
                citaEditar?.id

          );

        }
      );

    };


  /* =====================================================
     GUARDAR EDICIÓN DESDE HOME
  ===================================================== */

  const guardarCitaDesdeHome =
    async (data) => {

      if (
        !citaEditar?.id
      ) {

        return false;

      }


      const cambioFechaOHora =

        data.fecha !==
          citaEditar.fecha ||

        data.hora !==
          citaEditar.hora;


      /*
       * VALIDAR HORARIO
       */

      if (
        data.fecha &&
        data.hora
      ) {

        const q =
          query(

            collection(
              db,
              "citas"
            ),

            where(
              "fecha",
              "==",
              data.fecha
            ),

            where(
              "hora",
              "==",
              data.hora
            )

          );


        const snap =
          await getDocs(q);


        const ocupado =
          snap.docs.some(
            documento =>
              documento.id !==
              citaEditar.id
          );


        if (ocupado) {

          alert(
            "Ese horario ya está ocupado."
          );

          return false;

        }

      }


      const dataLimpia = {

        ...data,

        nombre:
          capitalizarNombre(
            data.nombre || ""
          ),

        telefono:
          limpiarTelefono10(
            data.telefono
          ),

        tipo:
          obtenerTipoCitaPorFecha(
            data.fecha
          ),

        estadoCita:
          cambioFechaOHora
            ? "pendiente"
            : citaEditar
                .estadoCita ||
              "pendiente",

        estadoConfirmacion:
          cambioFechaOHora
            ? "pendiente"
            : citaEditar
                .estadoConfirmacion ||
              "pendiente",

        estadoAsistencia:
          cambioFechaOHora
            ? "pendiente"
            : citaEditar
                .estadoAsistencia ||
              "pendiente"

      };


      await updateDoc(
        doc(
          db,
          "citas",
          citaEditar.id
        ),
        dataLimpia
      );


      setShowModal(
        false
      );

      setCitaEditar(
        null
      );


      return true;

    };


  /* =====================================================
     CITAS DE HOY
     PARA CARDS
  ===================================================== */

  const hoy =
    obtenerHoyLocal();


  const pacientesHoy =
    useMemo(() => {

      return citasDB
        .filter(
          cita =>
            cita.fecha === hoy
        )
        .sort(
          (a, b) =>
            (a.hora || "")
              .localeCompare(
                b.hora || ""
              )
        );

    }, [
      citasDB,
      hoy
    ]);


  /* =====================================================
     CITAS DE LA FECHA MOSTRADA
     PARA LA TABLA
  ===================================================== */

  const citasTabla =
    useMemo(() => {

      return citasDB
        .filter(
          cita =>
            cita.fecha ===
            fechaTabla
        )
        .sort(
          (a, b) =>
            (a.hora || "")
              .localeCompare(
                b.hora || ""
              )
        );

    }, [
      citasDB,
      fechaTabla
    ]);


  /* =====================================================
     TÍTULO TABLA
  ===================================================== */

  const hoyTabla =
    obtenerHoyLocal();


  const mananaDate =
    new Date();

  mananaDate.setDate(
    mananaDate.getDate() + 1
  );


  const mananaTabla =
    fechaISODesdeDate(
      mananaDate
    );


  const tituloTabla =

    fechaTabla === hoyTabla

      ? "Turnos de hoy"

      : fechaTabla === mananaTabla

      ? "Turnos de mañana"

      : "Turnos";


  /* =====================================================
     ESTADÍSTICAS DEL DÍA ACTUAL
  ===================================================== */

  const estadisticas =
    useMemo(() => {

      const estados =
        pacientesHoy.map(
          cita =>
            obtenerEstadoCitaTexto(
              cita
            )
        );


      return {

        total:
          pacientesHoy.length,


        asistieron:
          estados.filter(
            estado =>
              estado ===
              "Asistió"
          ).length,


        confirmados:
          estados.filter(
            estado =>
              estado ===
              "Confirmado"
          ).length,


        porAtender:
          estados.filter(
            estado =>
              estado !==
                "Asistió" &&
              estado !==
                "No asistió"
          ).length,


        ausentes:
          estados.filter(
            estado =>
              estado ===
              "No asistió"
          ).length

      };

    }, [
      pacientesHoy,
      historiasPacientes,
      reloj
    ]);


  /* =====================================================
     FECHA GRANDE DEL HOME
  ===================================================== */

  const fechaTexto =
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
      .replace(
        /^./,
        letra =>
          letra.toUpperCase()
      );


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="admin-home">


      {/* ==========================
          CABECERA
      ========================== */}

      <div className="admin-home-header">

        <div>

          <span className="admin-home-eyebrow">
            PANEL ADMINISTRATIVO
          </span>

          <h1>
            Resumen del día
          </h1>

          <p>
            {fechaTexto}
          </p>

        </div>

      </div>


      {/* ==========================
          CARDS
      ========================== */}

      <div className="admin-home-stats">


        <div className="admin-home-stat stat-total">

          <div className="admin-home-stat-icon">
            <FaCalendarAlt />
          </div>

          <div>

            <span>
              Pacientes hoy
            </span>

            <strong>
              {estadisticas.total}
            </strong>

          </div>

        </div>


        <div className="admin-home-stat stat-asistidos">

          <div className="admin-home-stat-icon">
            <FaUserCheck />
          </div>

          <div>

            <span>
              Atendidos
            </span>

            <strong>
              {estadisticas.asistieron}
            </strong>

          </div>

        </div>


        <div className="admin-home-stat stat-confirmados">

          <div className="admin-home-stat-icon">
            <FaCheckCircle />
          </div>

          <div>

            <span>
              Confirmados
            </span>

            <strong>
              {estadisticas.confirmados}
            </strong>

          </div>

        </div>


        <div className="admin-home-stat stat-pendientes">

          <div className="admin-home-stat-icon">
            <FaHourglassHalf />
          </div>

          <div>

            <span>
              Por atender
            </span>

            <strong>
              {estadisticas.porAtender}
            </strong>

          </div>

        </div>


        <div className="admin-home-stat stat-ausentes">

          <div className="admin-home-stat-icon">
            <FaUserTimes />
          </div>

          <div>

            <span>
              Ausentes
            </span>

            <strong>
              {estadisticas.ausentes}
            </strong>

          </div>

        </div>


      </div>


      {/* ==========================
          TABLA TURNOS
      ========================== */}

      <div className="admin-home-turnos">


        {/* HEADER TABLA */}

        <div className="admin-home-turnos-header admin-home-turnos-header-nav">


          <button
            type="button"
            className="admin-home-dia-nav"
            onClick={() =>
              cambiarDiaTabla(-1)
            }
            title="Día anterior"
          >

            <FaChevronLeft />

          </button>


          <div className="admin-home-turnos-titulo">

            <h2>
              {tituloTabla}
            </h2>

            <small>
              {formatearFechaTabla(
                fechaTabla
              )}
            </small>

          </div>


          <button
            type="button"
            className="admin-home-dia-nav"
            onClick={() =>
              cambiarDiaTabla(1)
            }
            title="Día siguiente"
          >

            <FaChevronRight />

          </button>


        </div>


        {/* TABLA */}

        <div className="admin-home-table-wrap">


          {citasTabla.length === 0 ? (

            <div className="admin-home-vacio">

              <FaCalendarAlt />

              <strong>
                No hay pacientes agendados para este día.
              </strong>

              <Link to="/admin/citas">
                Ir a la agenda
              </Link>

            </div>

          ) : (

            <table className="table table-sm mb-0 tabla-pacientes-hoy tabla-agenda-turnos admin-home-table">


              <thead>

                <tr className="text-center">


                  <th>

                    <span className="celeste">
                      N°
                    </span>

                  </th>


                  <th>

                    <FaClock className="celeste" />

                    <br />

                    <span className="celeste">
                      Hora
                    </span>

                  </th>


                  <th>

                    <FaUser className="celeste" />

                    <br />

                    <span className="celeste">
                      Paciente
                    </span>

                  </th>


                  <th>

                    <FaIdCard className="celeste" />

                    <br />

                    <span className="celeste">
                      DNI
                    </span>

                  </th>


                  <th>

                    <FaWhatsapp className="celeste" />

                    <br />

                    <span className="celeste">
                      Wp
                    </span>

                  </th>


                  <th>

                    <FaUsers className="celeste" />

                    <br />

                    <span className="celeste">
                      Vez
                    </span>

                  </th>


                  <th>

                    <FaStethoscope className="celeste" />

                    <br />

                    <span className="celeste">
                      Motivo
                    </span>

                  </th>


                  <th>

                    <FaCheckCircle className="celeste" />

                    <br />

                    <span className="celeste">
                      Estado
                    </span>

                  </th>


                  <th>

                    <FaEye className="celeste" />

                    <br />

                    <span className="celeste">
                      Detalle
                    </span>

                  </th>


                </tr>

              </thead>


              <tbody>


                {citasTabla.map(
                  (cita, index) => {


                    const numeroCita =
                      obtenerNumeroCitaPaciente(
                        cita
                      );


                    const textoVez =
                      textoNumeroCitaPaciente(
                        numeroCita
                      );


                    return (

                      <tr
                        key={cita.id}

                        className="admin-home-fila-clickable"

                        style={{
                          cursor: "pointer"
                        }}

                        onClick={() =>
                          abrirHistoria(
                            cita
                          )
                        }

                        onKeyDown={(e) => {

                          if (
                            e.key ===
                            "Enter"
                          ) {

                            abrirHistoria(
                              cita
                            );

                          }

                        }}

                        tabIndex={0}

                        title="Abrir historia clínica"
                      >


                        {/* NÚMERO */}

                        <td className="tabla-numero-fila">

                          {index + 1}

                        </td>


                        {/* HORA */}

                        <td>

                          {cita.sinAgenda
                            ? "Sin hora"
                            : cita.hora}

                        </td>


                        {/* PACIENTE */}

                        <td className="admin-home-paciente">

                          {capitalizarNombre(
                            cita.nombre || ""
                          )}

                        </td>


                        {/* DNI */}

                        <td>

                          {obtenerDni(cita) ||
                            "-"}

                        </td>


                        {/* WHATSAPP */}

                        <td>


                          {cita.telefono ? (

                            <button
                              type="button"

                              className="btn-whatsapp-tabla btn-whatsapp-tabla-solo-icono"

                              onClick={(e) => {

                                e.stopPropagation();

                                abrirWhatsapp(
                                  cita
                                );

                              }}

                              title="Abrir WhatsApp"
                            >

                              <FaWhatsapp />

                            </button>

                          ) : (

                            "-"

                          )}


                        </td>


                        {/* VEZ */}

                        <td>

                          <span
                            className={
                              obtenerClaseVez(
                                textoVez
                              )
                            }
                          >

                            {textoVez}

                          </span>

                        </td>


                        {/* MOTIVO */}

                        <td>

                          <span
                            className="motivo-tabla-cita"

                            title={
                              cita
                                .motivoConsulta ||
                              "Sin motivo"
                            }
                          >

                            {cita
                              .motivoConsulta ||
                              "Sin motivo"}

                          </span>

                        </td>


                        {/* ESTADO */}

                        <td>

                          <span
                            className={`estado-cita-simple ${
                              obtenerEstadoCitaClase(
                                cita
                              )
                            }`}
                          >

                            {obtenerEstadoCitaTexto(
                              cita
                            )}

                          </span>

                        </td>


                        {/* OJITO = DETALLE */}

                        <td>

                          <button
                            type="button"

                            className="btn-detalle-cita-tabla"

                            onClick={(e) => {

                              e.stopPropagation();

                              abrirDetalleCita(
                                cita
                              );

                            }}

                            title="Ver detalle y editar cita"
                          >

                            <FaEye />

                          </button>

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


      {/* =================================================
          MODAL DETALLE
          SE ABRE DENTRO DEL HOME
      ================================================= */}

      <ModalDetalle
        show={showDetalle}

        onHide={() => {

          setShowDetalle(
            false
          );

          setCitaSeleccionada(
            null
          );

        }}

        cita={citaSeleccionada}

        estadoTexto={
          citaSeleccionada
            ? obtenerEstadoCitaTexto(
                citaSeleccionada
              )
            : ""
        }

        estadoClase={
          citaSeleccionada
            ? obtenerEstadoCitaClase(
                citaSeleccionada
              )
            : ""
        }

        textoVez={
          citaSeleccionada
            ? textoNumeroCitaPaciente(
                obtenerNumeroCitaPaciente(
                  citaSeleccionada
                )
              )
            : ""
        }

        claseVez={
          citaSeleccionada
            ? obtenerClaseVez(
                textoNumeroCitaPaciente(
                  obtenerNumeroCitaPaciente(
                    citaSeleccionada
                  )
                )
              )
            : ""
        }

        onWhatsapp={(cita) => {

          abrirWhatsapp(
            cita
          );

        }}

        onConfirmar={
          confirmarCitaDesdeHome
        }

        onEditar={(cita) => {

          setCitaEditar(
            cita
          );

          setShowDetalle(
            false
          );

          setShowModal(
            true
          );

        }}

        onEliminar={async (cita) => {

          if (
            !cita?.id
          ) {
            return;
          }


          setShowDetalle(
            false
          );

          setCitaSeleccionada(
            null
          );


          await deleteDoc(
            doc(
              db,
              "citas",
              cita.id
            )
          );

        }}
      />


      {/* =================================================
          MODAL EDITAR CITA
          TAMBIÉN DENTRO DEL HOME
      ================================================= */}

      <ModalCita
        show={showModal}

        onHide={() => {

          setShowModal(
            false
          );

          setCitaEditar(
            null
          );

        }}

        onGuardar={
          guardarCitaDesdeHome
        }

        citaEditar={
          citaEditar
        }

        fechaSeleccionada={
          citaEditar?.fecha ||
          fechaTabla
        }

        horariosDisponibles={
          obtenerHorariosDisponiblesHome(
            citaEditar?.fecha ||
            fechaTabla
          )
        }

        horaPreseleccionada={
          citaEditar?.hora ||
          null
        }

        tipoPreseleccionado={
          obtenerTipoCitaPorFecha(
            citaEditar?.fecha ||
            fechaTabla
          )
        }

        obtenerHorariosDisponibles={
          obtenerHorariosDisponiblesHome
        }
      />


    </div>

  );

}


export default AdminPanel;