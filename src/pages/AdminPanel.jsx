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
  onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

import {
  FaCalendarAlt,
  FaUserCheck,
  FaHourglassHalf,
  FaCheckCircle,
  FaUserTimes,
  FaClock,
  FaUser,
  FaIdCard,
  FaWhatsapp,
  FaUsers,
  FaStethoscope,
  FaEye,
  FaArrowRight
} from "react-icons/fa";


function AdminPanel() {

  const navigate = useNavigate();

  const [citasDB, setCitasDB] = useState([]);
  const [historiasPacientes, setHistoriasPacientes] = useState([]);

  const [reloj, setReloj] = useState(
    Date.now()
  );


  /* =====================================================
     FIRESTORE - CITAS
  ===================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "citas"),
        (snapshot) => {

          const datos =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));

          setCitasDB(datos);

        }
      );


    return () => unsubscribe();

  }, []);


  /* =====================================================
     FIRESTORE - HISTORIAS
  ===================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "historiasClinicas"),
        (snapshot) => {

          const datos =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));

          setHistoriasPacientes(datos);

        }
      );


    return () => unsubscribe();

  }, []);


  /* =====================================================
     ACTUALIZAR ESTADOS CADA MINUTO
  ===================================================== */

  useEffect(() => {

    const intervalo =
      setInterval(() => {

        setReloj(Date.now());

      }, 60000);


    return () =>
      clearInterval(intervalo);

  }, []);


  /* =====================================================
     HELPERS
  ===================================================== */

  const obtenerHoyLocal = () => {

    const ahora = new Date();

    const offset =
      ahora.getTimezoneOffset();


    return new Date(
      ahora.getTime() -
      offset * 60000
    )
      .toISOString()
      .split("T")[0];

  };


  const capitalizarNombre = (texto = "") => {

    return texto
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map(
        palabra =>
          palabra.charAt(0).toUpperCase() +
          palabra.slice(1)
      )
      .join(" ");

  };


  const normalizarNombre = (valor = "") => {

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


  const limpiarDni = (valor = "") => {

    return valor
      .toString()
      .replace(/\D/g, "")
      .trim();

  };


  const obtenerDni = (cita = {}) => {

    return limpiarDni(
      cita.Dni ||
      cita.dni ||
      cita.DNI ||
      cita.documento ||
      ""
    );

  };


  const buscarPacienteHistoria =
    (cita = {}) => {

      const historiaId =
        cita.historiaClinicaId ||
        cita.pacienteId ||
        "";


      if (historiaId) {

        const paciente =
          historiasPacientes.find(
            p => p.id === historiaId
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


      return historiasPacientes.find(
        p =>
          normalizarNombre(
            p.nombre || ""
          ) === nombreCita
      ) || null;

    };


  const fechaISODesdeDate = (fecha) => {

    const offset =
      fecha.getTimezoneOffset();


    return new Date(
      fecha.getTime() -
      offset * 60000
    )
      .toISOString()
      .split("T")[0];

  };


  const pacienteTieneConsultaHoy =
    (cita) => {

      const paciente =
        buscarPacienteHistoria(cita);


      if (
        !paciente?.ultimaConsultaAtMillis ||
        !cita?.fecha
      ) {
        return false;
      }


      const fechaConsulta =
        fechaISODesdeDate(
          new Date(
            Number(
              paciente.ultimaConsultaAtMillis
            )
          )
        );


      return (
        fechaConsulta ===
        cita.fecha
      );

    };


  const citaYaPaso = (cita) => {

    if (
      !cita?.fecha ||
      !cita?.hora
    ) {
      return false;
    }


    const fechaHora =
      new Date(
        `${cita.fecha}T${cita.hora}:00`
      );


    if (
      Number.isNaN(
        fechaHora.getTime()
      )
    ) {
      return false;
    }


    return (
      reloj >=
      fechaHora.getTime()
    );

  };


  const obtenerEstadoCitaTexto =
    (cita) => {

      if (
        pacienteTieneConsultaHoy(cita)
      ) {
        return "Asistió";
      }


      if (
        cita.estadoCita === "asistio" ||
        cita.estadoAsistencia === "asistio"
      ) {
        return "Asistió";
      }


      if (
        cita.estadoCita === "noAsistio" ||
        cita.estadoAsistencia === "noAsistio"
      ) {
        return "No asistió";
      }


      if (
        citaYaPaso(cita)
      ) {
        return "No asistió";
      }


      if (
        cita.estadoCita === "confirmado" ||
        cita.estadoConfirmacion === "confirmado"
      ) {
        return "Confirmado";
      }


      return "Pendiente";

    };


  const obtenerEstadoCitaClase =
    (cita) => {

      const estado =
        obtenerEstadoCitaTexto(cita);


      if (estado === "Asistió")
        return "estado-asistio";

      if (estado === "No asistió")
        return "estado-no-asistio";

      if (estado === "Confirmado")
        return "estado-confirmado";


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
        buscarPacienteHistoria(cita);


      if (paciente) {

        const consultas =
          Number(
            paciente.cantidadConsultas ||
            0
          );


        if (
          obtenerEstadoCitaTexto(cita) ===
          "Asistió"
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
                  `${a.fecha}T${a.hora}`
                );

              const fechaB =
                new Date(
                  `${b.fecha}T${b.hora}`
                );


              return fechaA - fechaB;

            }
          );


      const posicion =
        citasPaciente.findIndex(
          c => c.id === cita.id
        );


      return (
        posicion === -1
          ? 1
          : posicion + 1
      );

    };


  const textoNumeroCitaPaciente =
    (numero) => {

      if (numero === 1)
        return "Primera vez";

      if (numero === 2)
        return "Segunda vez";

      if (numero === 3)
        return "Tercera vez";


      return `${numero}ª vez`;

    };


  const obtenerClaseVez =
    (texto = "") => {

      const valor =
        texto.toLowerCase();


      if (
        valor.includes("primera")
      ) {
        return "vez-badge vez-primera";
      }


      if (
        valor.includes("segunda")
      ) {
        return "vez-badge vez-segunda";
      }


      return "vez-badge vez-tercera-mas";

    };


  /* =====================================================
     WHATSAPP
  ===================================================== */

  const abrirWhatsapp =
    (cita) => {

      if (!cita?.telefono) return;


      let numero =
        cita.telefono
          .toString()
          .replace(/\D/g, "");


      if (
        numero.startsWith("549")
      ) {

        // ya está listo

      } else {

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

          `Hora: ${cita.hora} hs\n\n` +

          `Muchas gracias por agendar con Dr. Reuma. Cualquier consulta, no dudes en comunicarte con nosotros.`

        );


      window.open(
        `https://wa.me/${numero}?text=${mensaje}`,
        "_blank"
      );

    };


  /* =====================================================
     ABRIR HISTORIA
  ===================================================== */

  const abrirHistoria =
    (cita) => {

      const paciente =
        buscarPacienteHistoria(cita);


      if (paciente?.id) {

        window.open(
          `/admin/historia/${paciente.id}?citaId=${cita.id}`,
          "_blank",
          "noopener,noreferrer"
        );

        return;

      }


      /*
       * Si todavía no tiene historia asociada,
       * vamos a Agenda, donde ya tienes la lógica
       * para crear/asociar historias.
       */

      navigate("/admin/citas");

    };


  /* =====================================================
     CITAS DE HOY
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
     ESTADÍSTICAS
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
              estado === "Asistió"
          ).length,

        confirmados:
          estados.filter(
            estado =>
              estado === "Confirmado"
          ).length,

        pendientes:
          estados.filter(
            estado =>
              estado === "Pendiente"
          ).length,

        ausentes:
          estados.filter(
            estado =>
              estado === "No asistió"
          ).length

      };

    }, [
      pacientesHoy,
      historiasPacientes,
      reloj
    ]);


  /* =====================================================
     FECHA EN TEXTO
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
          TARJETAS
      ========================== */}

      <div className="admin-home-stats">


        <div className="admin-home-stat stat-total">

          <div className="admin-home-stat-icon">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Pacientes hoy</span>
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
            <span>Atendidos</span>
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
            <span>Confirmados</span>
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
            <span>Pendientes</span>
            <strong>
              {estadisticas.pendientes}
            </strong>
          </div>

        </div>


        <div className="admin-home-stat stat-ausentes">

          <div className="admin-home-stat-icon">
            <FaUserTimes />
          </div>

          <div>
            <span>Ausentes</span>
            <strong>
              {estadisticas.ausentes}
            </strong>
          </div>

        </div>


      </div>


      {/* ==========================
          TURNOS HOY
      ========================== */}

      <div className="admin-home-turnos">


        <div className="admin-home-turnos-header">

          <div>

            <span>
              AGENDA
            </span>

            <h2>
              Turnos de hoy
            </h2>

          </div>


          <div className="admin-home-turnos-total">

            {pacientesHoy.length}

            <small>
              pacientes
            </small>

          </div>

        </div>


        <div className="admin-home-table-wrap">


          {pacientesHoy.length === 0 ? (

            <div className="admin-home-vacio">

              <FaCalendarAlt />

              <strong>
                No hay pacientes agendados para hoy
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
                      Historia
                    </span>
                  </th>

                </tr>

              </thead>


              <tbody>

                {pacientesHoy.map(
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

                      <tr key={cita.id}>


                        <td className="tabla-numero-fila">
                          {index + 1}
                        </td>


                        <td>

                          {cita.sinAgenda
                            ? "Sin hora"
                            : cita.hora}

                        </td>


                        <td className="admin-home-paciente">

                          {capitalizarNombre(
                            cita.nombre || ""
                          )}

                        </td>


                        <td>
                          {obtenerDni(cita) || "-"}
                        </td>


                        <td>

                          {cita.telefono ? (

                            <button
                              type="button"
                              className="btn-whatsapp-tabla btn-whatsapp-tabla-solo-icono"
                              onClick={() =>
                                abrirWhatsapp(
                                  cita
                                )
                              }
                              title="Abrir WhatsApp"
                            >

                              <FaWhatsapp />

                            </button>

                          ) : (

                            "-"

                          )}

                        </td>


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


                        <td>

                          <span
                            className="motivo-tabla-cita"
                            title={
                              cita.motivoConsulta ||
                              "Sin motivo"
                            }
                          >

                            {cita.motivoConsulta ||
                              "Sin motivo"}

                          </span>

                        </td>


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


                        <td>

                          <button
                            type="button"
                            className="btn-detalle-cita-tabla"
                            onClick={() =>
                              abrirHistoria(
                                cita
                              )
                            }
                            title="Abrir historia clínica"
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


    </div>

  );

}


export default AdminPanel;