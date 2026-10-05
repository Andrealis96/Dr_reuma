import {
  Fragment,
  useEffect,
  useRef, 
  useState
} from "react";

import {
  FaComments,
  FaMinus,
  FaPaperPlane
} from "react-icons/fa";

import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
  writeBatch,
  doc,
  arrayUnion,
  getDoc,
  setDoc
} from "firebase/firestore";

import { db } from "../firebase";
import { auth } from "../firebase/Auth";


function ChatInternoBurbuja() {

  const [abierto, setAbierto] = useState(false);

  const [mensajes, setMensajes] = useState([]);

  const [texto, setTexto] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [perfiles, setPerfiles] = useState({});

  const [estadosChat, setEstadosChat] = useState({});

  // Hace que "En línea" y "Escribiendo"
  // se recalculen aunque no llegue un snapshot nuevo.
  const [, setReloj] = useState(Date.now());


  const mensajesFinalRef = useRef(null);

  const marcandoLeidosRef = useRef(false);

  const chatBodyRef = useRef(null);

const primeraCargaMensajesRef = useRef(true);

const audioContextRef = useRef(null);

const tituloOriginalRef = useRef(
  typeof document !== "undefined"
    ? document.title.replace(/^\(\d+\+?\)\s*/, "")
    : "Dr. Reuma"
);

  const timeoutEscribiendoRef = useRef(null);

  const escribiendoLocalRef = useRef(false);

  const ultimoPingEscrituraRef = useRef(0);


  const usuario = auth.currentUser;


  // =========================================================
  // NOMBRE AUTOMÁTICO DESDE FIREBASE AUTH
  // =========================================================

  const obtenerNombreDesdeUsuario = (user) => {

    if (!user) return "Usuario";


    if (user.displayName?.trim()) {

      return user.displayName.trim();

    }


    if (user.email) {

      const nombreEmail =
        user.email.split("@")[0];


      return nombreEmail
        .replace(/[._-]/g, " ")
        .replace(
          /\b\w/g,
          (letra) => letra.toUpperCase()
        );

    }


    return "Usuario";

  };


  // =========================================================
  // CREAR PERFIL INTERNO SI NO EXISTE
  // =========================================================

  useEffect(() => {

    if (!usuario) return;


    const crearPerfilSiNoExiste = async () => {

      try {

        const perfilRef = doc(
          db,
          "usuariosInternos",
          usuario.uid
        );


        const perfilSnap =
          await getDoc(perfilRef);


        if (!perfilSnap.exists()) {

          await setDoc(
            perfilRef,
            {
              uid: usuario.uid,

              email:
                usuario.email || "",

              nombre:
                obtenerNombreDesdeUsuario(
                  usuario
                ),

              rol:
                "Equipo Dr. Reuma",

              fotoUrl: "",

              creadoAt:
                serverTimestamp()
            }
          );

        }

      } catch (error) {

        console.error(
          "Error creando perfil interno:",
          error
        );

      }

    };


    crearPerfilSiNoExiste();

  }, [usuario?.uid]);


  // =========================================================
  // ESCUCHAR PERFILES DEL EQUIPO
  // =========================================================

  useEffect(() => {

    if (!usuario) return;


    const unsubscribe = onSnapshot(

      collection(
        db,
        "usuariosInternos"
      ),

      (snapshot) => {

        const mapaPerfiles = {};


        snapshot.docs.forEach(
          (documento) => {

            mapaPerfiles[documento.id] = {
              id: documento.id,
              ...documento.data()
            };

          }
        );


        setPerfiles(mapaPerfiles);

      },

      (error) => {

        console.error(
          "Error cargando usuarios internos:",
          error
        );

      }

    );


    return () => unsubscribe();

  }, [usuario?.uid]);


  // =========================================================
  // PERFIL DEL USUARIO ACTUAL
  // =========================================================

  const perfilActual =
    perfiles[usuario?.uid];


  const nombreUsuario =
    perfilActual?.nombre ||
    obtenerNombreDesdeUsuario(usuario);


// =========================================================
// MENSAJES EN TIEMPO REAL
// TRAER LOS ÚLTIMOS 60
// =========================================================

useEffect(() => {

  if (!usuario) return;


  const qMensajes = query(

    collection(
      db,
      "chatInternoMensajes"
    ),

    orderBy(
      "createdAt",
      "desc"
    ),

    limit(60)

  );


  const unsubscribe = onSnapshot(

    qMensajes,

    (snapshot) => {

      /*
       * Firestore los trae:
       * nuevo -> viejo
       *
       * Nosotros los invertimos:
       * viejo -> nuevo
       * para mostrarlos correctamente.
       */

      const datos =
  snapshot.docs
    .map((documento) => ({
      id: documento.id,

      ...documento.data({
        serverTimestamps: "estimate"
      })
    }))
    .reverse();


      /*
       * SONIDO
       *
       * No sonar cuando entra por primera
       * vez a la página y Firestore carga
       * todos los mensajes anteriores.
       */

      if (
        !primeraCargaMensajesRef.current
      ) {

        const mensajesNuevosDeOtro =
          snapshot
            .docChanges()
            .filter(
              (cambio) =>
                cambio.type === "added" &&
                cambio.doc.data().autorUid !==
                  usuario.uid
            );


        if (
          mensajesNuevosDeOtro.length > 0
        ) {

          reproducirSonidoMensaje();

        }

      }


      primeraCargaMensajesRef.current =
        false;


      setMensajes(datos);

    },

    (error) => {

      console.error(
        "Error cargando chat interno:",
        error
      );

    }

  );


  return () => unsubscribe();

}, [usuario?.uid]);

// =========================================================
// SONIDO DE MENSAJE NUEVO
// =========================================================

useEffect(() => {

  const activarAudio = async () => {

    try {

      if (!audioContextRef.current) {

        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) return;

        audioContextRef.current =
          new AudioContext();

      }

      if (
        audioContextRef.current.state ===
        "suspended"
      ) {

        await audioContextRef.current.resume();

      }

    } catch (error) {

      console.warn(
        "No se pudo activar audio:",
        error
      );

    }

  };


  window.addEventListener(
    "pointerdown",
    activarAudio,
    { once: true }
  );


  return () => {

    window.removeEventListener(
      "pointerdown",
      activarAudio
    );

  };

}, []);


const reproducirSonidoMensaje = () => {

  try {

    const ctx =
      audioContextRef.current;

    if (
      !ctx ||
      ctx.state !== "running"
    ) {
      return;
    }


    const ahora =
      ctx.currentTime;


    [740, 980].forEach(
      (frecuencia, index) => {

        const oscillator =
          ctx.createOscillator();

        const gain =
          ctx.createGain();


        oscillator.connect(gain);

        gain.connect(
          ctx.destination
        );


        oscillator.frequency.value =
          frecuencia;


        gain.gain.setValueAtTime(
          0.0001,
          ahora
        );

        gain.gain.exponentialRampToValueAtTime(
          0.08,
          ahora + 0.01 + index * 0.08
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ahora + 0.12 + index * 0.08
        );


        oscillator.start(
          ahora + index * 0.08
        );

        oscillator.stop(
          ahora + 0.15 + index * 0.08
        );

      }
    );

  } catch (error) {

    console.warn(
      "No se pudo reproducir sonido:",
      error
    );

  }

};
  // =========================================================
  // ESCUCHAR ESTADOS DEL CHAT
  // Escribiendo + presencia
  // =========================================================

  useEffect(() => {

    if (!usuario) return;


    const unsubscribe = onSnapshot(

      collection(
        db,
        "estadosChatInterno"
      ),

      (snapshot) => {

        const estados = {};


        snapshot.docs.forEach(
          (documento) => {

            estados[documento.id] = {
              uid: documento.id,
              ...documento.data()
            };

          }
        );


        setEstadosChat(estados);

      },

      (error) => {

        console.error(
          "Error leyendo estados del chat:",
          error
        );

      }

    );


    return () => unsubscribe();

  }, [usuario?.uid]);


  // =========================================================
  // RELOJ INTERNO
  // =========================================================

  useEffect(() => {

    const intervalo =
      setInterval(() => {

        setReloj(
          Date.now()
        );

      }, 1000);


    return () =>
      clearInterval(intervalo);

  }, []);


  // =========================================================
  // PRESENCIA
  // EN LÍNEA / SIN CONEXIÓN
  // =========================================================

  useEffect(() => {

    if (!usuario) return;


    const estadoRef = doc(
      db,
      "estadosChatInterno",
      usuario.uid
    );


    const marcarEnLinea = async () => {

      try {

        await setDoc(
          estadoRef,
          {
            uid:
              usuario.uid,

            nombre:
              nombreUsuario,

            enLinea:
              true,

            ultimaConexion:
              serverTimestamp()
          },
          {
            merge: true
          }
        );

      } catch (error) {

        console.error(
          "Error actualizando presencia:",
          error
        );

      }

    };


    // Marcamos online apenas entra.
    marcarEnLinea();


    // Heartbeat cada 20 segundos.
    const intervaloPresencia =
      setInterval(() => {

        marcarEnLinea();

      }, 20000);


    return () => {

      clearInterval(
        intervaloPresencia
      );


      setDoc(
        estadoRef,
        {
          enLinea:
            false,

          escribiendo:
            false,

          ultimaConexion:
            serverTimestamp()
        },
        {
          merge: true
        }
      ).catch(() => {});

    };

  }, [
    usuario?.uid,
    nombreUsuario
  ]);


  // =========================================================
  // ACTUALIZAR "ESCRIBIENDO..."
  // =========================================================

  const actualizarEstadoEscribiendo =
    async (
      estaEscribiendo,
      forzar = false
    ) => {

      if (!usuario) return;


      const ahora =
        Date.now();


      // Evita escribir en Firestore con cada tecla.
      // Mientras escribe, actualiza como máximo
      // aproximadamente una vez por segundo.

      if (estaEscribiendo) {

        const tiempoDesdeUltimoPing =
          ahora -
          ultimoPingEscrituraRef.current;


        if (
          escribiendoLocalRef.current &&
          !forzar &&
          tiempoDesdeUltimoPing < 1000
        ) {

          return;

        }

      } else {

        if (
          !escribiendoLocalRef.current &&
          !forzar
        ) {

          return;

        }

      }


      escribiendoLocalRef.current =
        estaEscribiendo;


      if (estaEscribiendo) {

        ultimoPingEscrituraRef.current =
          ahora;

      }


      try {

        await setDoc(

          doc(
            db,
            "estadosChatInterno",
            usuario.uid
          ),

          {
            uid:
              usuario.uid,

            nombre:
              nombreUsuario,

            escribiendo:
              estaEscribiendo,

            updatedAt:
              serverTimestamp()
          },

          {
            merge: true
          }

        );

      } catch (error) {

        console.error(
          "Error actualizando escribiendo:",
          error
        );

      }

    };


  // =========================================================
  // CAMBIO DEL INPUT
  // =========================================================

  const manejarCambioTexto = (e) => {

    const nuevoTexto =
      e.target.value;


    setTexto(
      nuevoTexto
    );


    if (
      timeoutEscribiendoRef.current
    ) {

      clearTimeout(
        timeoutEscribiendoRef.current
      );

    }


    if (
      nuevoTexto.trim()
    ) {

      actualizarEstadoEscribiendo(
        true
      );


      timeoutEscribiendoRef.current =
        setTimeout(() => {

          actualizarEstadoEscribiendo(
            false
          );

        }, 1400);

    } else {

      actualizarEstadoEscribiendo(
        false
      );

    }

  };


  // =========================================================
  // LIMPIAR "ESCRIBIENDO" AL SALIR
  // =========================================================

  useEffect(() => {

    return () => {

      if (
        timeoutEscribiendoRef.current
      ) {

        clearTimeout(
          timeoutEscribiendoRef.current
        );

      }


      if (usuario) {

        setDoc(

          doc(
            db,
            "estadosChatInterno",
            usuario.uid
          ),

          {
            uid:
              usuario.uid,

            nombre:
              nombreUsuario,

            escribiendo:
              false,

            updatedAt:
              serverTimestamp()
          },

          {
            merge: true
          }

        ).catch(() => {});

      }

    };

  }, [
    usuario?.uid,
    nombreUsuario
  ]);


  // =========================================================
  // QUIÉN ESTÁ ESCRIBIENDO
  // =========================================================

  const usuariosEscribiendo =
    Object.values(
      estadosChat
    )
      .filter(
        (estado) => {

          if (!usuario) {
            return false;
          }


          if (
            estado.uid ===
            usuario.uid
          ) {

            return false;

          }


          if (
            !estado.escribiendo
          ) {

            return false;

          }


          if (
            estado.updatedAt?.toMillis
          ) {

            const antiguedad =
              Date.now() -
              estado.updatedAt.toMillis();


            // Si quedó colgado por alguna razón,
            // deja de mostrar escribiendo.

            if (
              antiguedad > 6000
            ) {

              return false;

            }

          }


          return true;

        }
      );


  // =========================================================
  // USUARIOS EN LÍNEA
  // =========================================================

  const otrosUsuariosEnLinea =
    Object.values(
      estadosChat
    )
      .filter(
        (estado) => {

          if (!usuario) {
            return false;
          }


          if (
            estado.uid ===
            usuario.uid
          ) {

            return false;

          }


          if (
            !estado.enLinea
          ) {

            return false;

          }


          if (
            estado.ultimaConexion?.toMillis
          ) {

            const tiempo =
              Date.now() -
              estado.ultimaConexion.toMillis();


            // El heartbeat es cada 20 segundos.
            // Después de 45 segundos sin actualizar
            // se considera desconectado.

            if (
              tiempo > 45000
            ) {

              return false;

            }

          }


          return true;

        }
      );

const hayOtroEnLinea =
  otrosUsuariosEnLinea.length > 0;


const otroUsuarioEnLinea =
  otrosUsuariosEnLinea[0];


/* =========================================================
   OTRO USUARIO AUNQUE ESTÉ DESCONECTADO
========================================================= */

const otrosUsuariosChat =
  Object.values(estadosChat)
    .filter((estado) => {

      if (!usuario) return false;

      return (
        estado.uid !== usuario.uid
      );

    });


const otroUsuarioMasReciente =
  [...otrosUsuariosChat]
    .sort((a, b) => {

      const fechaA =
        a.ultimaConexion?.toMillis?.() || 0;

      const fechaB =
        b.ultimaConexion?.toMillis?.() || 0;

      return fechaB - fechaA;

    })[0] || null;


/*
 * Si está conectado usamos ese.
 * Si está desconectado usamos su último estado.
 */

const otroUsuarioHeader =
  otroUsuarioEnLinea ||
  otroUsuarioMasReciente;


const nombreOtroUsuario =
  otroUsuarioHeader
    ? (
        perfiles[
          otroUsuarioHeader.uid
        ]?.nombre ||

        otroUsuarioHeader.nombre ||

        "Miembro del equipo"
      )
    : "";


    const formatearUltimaConexion = (
  timestamp
) => {

  if (!timestamp?.toDate) {
    return "Sin conexión";
  }


  const fecha =
    timestamp.toDate();

  const ahora =
    new Date();


  const hoy =
    new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );


  const fechaConexion =
    new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    );


  const diferenciaDias =
    Math.round(
      (
        hoy -
        fechaConexion
      ) / 86400000
    );


  const hora =
    fecha.toLocaleTimeString(
      "es-AR",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    );


  if (diferenciaDias === 0) {

    return `Última vez hoy · ${hora}`;

  }


  if (diferenciaDias === 1) {

    return `Última vez ayer · ${hora}`;

  }


  const fechaTexto =
    fecha.toLocaleDateString(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );


  return `Última vez ${fechaTexto} · ${hora}`;

};


  // =========================================================
  // MENSAJES NO LEÍDOS
  // =========================================================

  const mensajesNoLeidos =
    mensajes.filter(
      (mensaje) => {

        if (!usuario) {
          return false;
        }


        if (
          mensaje.autorUid ===
          usuario.uid
        ) {

          return false;

        }


        return (
          !Array.isArray(
            mensaje.leidoPor
          ) ||

          !mensaje.leidoPor.includes(
            usuario.uid
          )
        );

      }
    );

    // =========================================================
// CONTADOR EN PESTAÑA DEL NAVEGADOR
// =========================================================

useEffect(() => {

  if (
    typeof document === "undefined"
  ) {
    return;
  }


  const cantidad =
    mensajesNoLeidos.length;


  if (cantidad > 0) {

    const contador =
      cantidad > 99
        ? "99+"
        : cantidad;


    document.title =
      `(${contador}) ${tituloOriginalRef.current}`;

  } else {

    document.title =
      tituloOriginalRef.current;

  }

}, [mensajesNoLeidos.length]);


/* Restaurar título al salir */

useEffect(() => {

  return () => {

    if (
      typeof document !== "undefined"
    ) {

      document.title =
        tituloOriginalRef.current;

    }

  };

}, []);


  // =========================================================
  // MARCAR COMO LEÍDOS
  // =========================================================

  useEffect(() => {

    if (!abierto) return;

    if (!usuario) return;


    if (
      mensajesNoLeidos.length === 0
    ) {

      return;

    }


    if (
      marcandoLeidosRef.current
    ) {

      return;

    }


    const marcarLeidos = async () => {

      marcandoLeidosRef.current =
        true;


      try {

        const batch =
          writeBatch(db);


        mensajesNoLeidos.forEach(
          (mensaje) => {

            const mensajeRef = doc(
              db,
              "chatInternoMensajes",
              mensaje.id
            );


            batch.update(
            mensajeRef,
            {
              leidoPor:
                arrayUnion(
                  usuario.uid
                ),

              [`vistoPor.${usuario.uid}`]:
                serverTimestamp()
            }
          );

          }
        );


        await batch.commit();

      } catch (error) {

        console.error(
          "Error marcando mensajes como leídos:",
          error
        );

      } finally {

        marcandoLeidosRef.current =
          false;

      }

    };


    marcarLeidos();

  }, [
    abierto,
    mensajes,
    usuario?.uid
  ]);


  // =========================================================
  // ÚLTIMO MENSAJE PROPIO
  // PARA MOSTRAR VISTO
  // =========================================================

  const ultimoMensajeMio =
    [...mensajes]
      .reverse()
      .find(
        (mensaje) =>
          mensaje.autorUid ===
          usuario?.uid
      );

// =========================================================
// SCROLL DEL CHAT
// SIEMPRE PEGADO AL ÚLTIMO MENSAJE
// =========================================================

const irAlFinalChat = () => {

  const body =
    chatBodyRef.current;

  if (!body) return;


  body.scrollTop =
    body.scrollHeight;


  mensajesFinalRef.current
    ?.scrollIntoView({
      behavior: "auto",
      block: "end"
    });

};


useEffect(() => {

  if (!abierto) return;


  /*
   * Primer intento inmediatamente
   * después del render.
   */

  const frame =
    requestAnimationFrame(() => {

      irAlFinalChat();

    });


  /*
   * Segundo intento cuando el DOM
   * ya terminó de acomodar burbujas,
   * fechas, visto, etc.
   */

  const timer1 =
    setTimeout(() => {

      irAlFinalChat();

    }, 40);


  /*
   * Tercer pequeño ajuste.
   * Útil cuando Firebase reemplaza
   * el serverTimestamp.
   */

  const timer2 =
    setTimeout(() => {

      irAlFinalChat();

    }, 150);


  return () => {

    cancelAnimationFrame(frame);

    clearTimeout(timer1);

    clearTimeout(timer2);

  };

}, [
  abierto,
  mensajes,
  usuariosEscribiendo.length
]);

  // =========================================================
  // ENVIAR MENSAJE
  // =========================================================

  const enviarMensaje = async (e) => {

    e.preventDefault();


    if (!usuario) return;


    const mensajeLimpio =
      texto.trim();


    if (!mensajeLimpio) {
      return;
    }


    if (enviando) {
      return;
    }


    setEnviando(
      true
    );


    if (
      timeoutEscribiendoRef.current
    ) {

      clearTimeout(
        timeoutEscribiendoRef.current
      );

    }


    actualizarEstadoEscribiendo(
      false
    );


    try {

      await addDoc(

        collection(
          db,
          "chatInternoMensajes"
        ),

        {
          texto:
            mensajeLimpio,

          autorUid:
            usuario.uid,

          autorNombre:
            nombreUsuario,

          autorEmail:
            usuario.email || "",

          createdAt:
            serverTimestamp(),

          leidoPor:
            [usuario.uid]
        }

      );


      setTexto("");

    } catch (error) {

      console.error(
        "Error enviando mensaje:",
        error
      );

    } finally {

      setEnviando(
        false
      );

    }

  };


  // =========================================================
  // MINIMIZAR CHAT
  // =========================================================

  const minimizarChat = () => {

    setAbierto(
      false
    );


    if (
      timeoutEscribiendoRef.current
    ) {

      clearTimeout(
        timeoutEscribiendoRef.current
      );

    }


    actualizarEstadoEscribiendo(
      false
    );

  };


  // =========================================================
  // HORA
  // =========================================================

  const formatearHora = (
    createdAt
  ) => {

    if (
      !createdAt?.toDate
    ) {

      return "";

    }


    return createdAt
      .toDate()
      .toLocaleTimeString(
        "es-AR",
        {
          hour:
            "2-digit",

          minute:
            "2-digit",

          hour12:
            false
        }
      );

  };

  // =========================================================
// FECHAS DEL CHAT
// =========================================================

const obtenerFechaMensaje = (
  createdAt
) => {

  if (!createdAt?.toDate) {
    return null;
  }

  return createdAt.toDate();

};


const mismoDia = (
  fechaA,
  fechaB
) => {

  if (!fechaA || !fechaB) {
    return false;
  }

  return (
    fechaA.getFullYear() ===
      fechaB.getFullYear() &&
    fechaA.getMonth() ===
      fechaB.getMonth() &&
    fechaA.getDate() ===
      fechaB.getDate()
  );

};


const capitalizarPrimera = (
  texto = ""
) => {

  if (!texto) return "";

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );

};


const formatearDiaChat = (
  createdAt
) => {

  const fecha =
    obtenerFechaMensaje(createdAt);

  if (!fecha) return "";


  const hoy =
    new Date();

  const ayer =
    new Date();

  ayer.setDate(
    hoy.getDate() - 1
  );


  const diaSemana =
    capitalizarPrimera(
      fecha.toLocaleDateString(
        "es-AR",
        {
          weekday: "long"
        }
      )
    );


  if (
    mismoDia(
      fecha,
      hoy
    )
  ) {

    return `Hoy · ${diaSemana}`;

  }


  if (
    mismoDia(
      fecha,
      ayer
    )
  ) {

    return `Ayer · ${diaSemana}`;

  }


  const inicioHoy =
    new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );


  const inicioFecha =
    new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    );


  const diferenciaDias =
    Math.floor(
      (
        inicioHoy -
        inicioFecha
      ) /
      86400000
    );


  // Última semana:
  // Lunes / Martes / Miércoles...

  if (
    diferenciaDias >= 0 &&
    diferenciaDias < 7
  ) {

    return diaSemana;

  }


  // Mensajes anteriores

  const fechaTexto =
    fecha.toLocaleDateString(
      "es-AR",
      {
        day: "numeric",
        month: "short"
      }
    );


  return `${diaSemana} · ${fechaTexto}`;

};

  // =========================================================
  // INICIALES
  // =========================================================

  const obtenerIniciales = (
    nombre = ""
  ) => {

    const partes =
      nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (
      partes.length === 0
    ) {

      return "?";

    }


    if (
      partes.length === 1
    ) {

      return partes[0]
        .slice(0, 2)
        .toUpperCase();

    }


    return (
      partes[0][0] +
      partes[1][0]
    ).toUpperCase();

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>

      {/* =====================================================
          CHAT ABIERTO
      ===================================================== */}

      {abierto && (

        <div className="chat-interno-panel">


          {/* HEADER */}

          <div className="chat-interno-header">

            <div className="chat-interno-header-identidad">


              <div className="chat-interno-avatar-principal">

                <img
                  src="/DrReumaLogo.svg"
                  alt="Dr. Reuma"
                />

              </div>


              <div className="chat-interno-header-texto">

                <strong>
                  Equipo Dr. Reuma
                </strong>


                <small className="chat-header-usuario">

                  {nombreUsuario}

                </small>


                <span className="chat-interno-rol">

                  {perfilActual?.rol ||
                    "Equipo Dr. Reuma"}

                </span>


                <span
                  className={
                    hayOtroEnLinea
                      ? "chat-presencia chat-presencia-online"
                      : "chat-presencia chat-presencia-offline"
                  }
                >

                  <span className="chat-presencia-punto" />


                  {hayOtroEnLinea
                    ? `${nombreOtroUsuario} · En línea`

                    : otroUsuarioHeader?.ultimaConexion

                      ? `${nombreOtroUsuario} · ${formatearUltimaConexion(
                          otroUsuarioHeader.ultimaConexion
                        )}`

                      : "Sin conexión"}

                </span>

              </div>

            </div>


            <button
              type="button"
              className="chat-interno-cerrar"
              onClick={
                minimizarChat
              }
              aria-label="Minimizar chat"
              title="Minimizar"
            >

              <FaMinus />

            </button>

          </div>


          {/* =================================================
              MENSAJES
          ================================================= */}

          <div
            ref={chatBodyRef}
            className="chat-interno-body"
          >

            {mensajes.length === 0 ? (

              <div className="chat-interno-vacio">

                <FaComments />

                <strong>
                  Chat del equipo
                </strong>

                <span>
                  Todavía no hay mensajes.
                </span>

              </div>

            ) : (

              mensajes.map(
  (mensaje, index) => {

    const esMio =
      mensaje.autorUid ===
      usuario?.uid;


    const perfilAutor =
      perfiles[
        mensaje.autorUid
      ] || {};


    const nombreAutor =
      perfilAutor.nombre ||
      mensaje.autorNombre ||
      "Usuario";


    const fotoAutor =
      perfilAutor.fotoUrl ||
      "";


    /* =========================
       VISTO
    ========================= */

    const lectores =
      Array.isArray(
        mensaje.leidoPor
      )
        ? mensaje.leidoPor.filter(
            (uid) =>
              uid !==
              mensaje.autorUid
          )
        : [];


    const fueVisto =
      lectores.length > 0;


    const primerLector =
      lectores[0];


    const nombreLector =
      perfiles[
        primerLector
      ]?.nombre || "";


    const horaVisto =
      primerLector &&
      mensaje.vistoPor?.[
        primerLector
      ]
        ? formatearHora(
            mensaje.vistoPor[
              primerLector
            ]
          )
        : "";


    const esUltimoMensajeMio =
      esMio &&
      ultimoMensajeMio?.id ===
        mensaje.id;


    /* =========================
       SEPARADOR DE FECHA
    ========================= */

    const fechaActual =
      obtenerFechaMensaje(
        mensaje.createdAt
      );


    const fechaAnterior =
      index > 0
        ? obtenerFechaMensaje(
            mensajes[index - 1]
              .createdAt
          )
        : null;


    const mostrarFecha =
  Boolean(fechaActual) &&
  (
    index === 0 ||
    !mismoDia(
      fechaActual,
      fechaAnterior
    )
  );


    return (

      <Fragment
        key={mensaje.id}
      >


        {/* FECHA */}

        {mostrarFecha && (

          <div className="chat-fecha-separador">

            <span>
              {formatearDiaChat(
                mensaje.createdAt
              )}
            </span>

          </div>

        )}


        {/* MENSAJE */}

        <div
          className={
            esMio
              ? "chat-mensaje-fila chat-mensaje-mio"
              : "chat-mensaje-fila chat-mensaje-otro"
          }
        >


          {!esMio && (

            <div className="chat-mensaje-avatar">

              {fotoAutor ? (

                <img
                  src={fotoAutor}
                  alt={nombreAutor}
                />

              ) : (

                obtenerIniciales(
                  nombreAutor
                )

              )}

            </div>

          )}


          <div className="chat-mensaje-contenido">


            {!esMio && (

              <span className="chat-mensaje-autor">

                {nombreAutor}

              </span>

            )}


            <div className="chat-mensaje-burbuja">

              <span>
                {mensaje.texto}
              </span>

            </div>


            <small className="chat-mensaje-hora">

              {formatearHora(
                mensaje.createdAt
              )}

            </small>


            {esUltimoMensajeMio && (

              <small
                className={
                  fueVisto
                    ? "chat-mensaje-estado chat-mensaje-visto"
                    : "chat-mensaje-estado"
                }
              >

                {fueVisto
                  ? `✓✓ Visto${
                      nombreLector
                        ? ` por ${nombreLector}`
                        : ""
                    }${
                      horaVisto
                        ? ` · ${horaVisto}`
                        : ""
                    }`
                  : "✓ Enviado"}

              </small>

            )}


          </div>

        </div>

      </Fragment>

    );

  }
)

            )}


            {/* =================================================
                ESCRIBIENDO...
            ================================================= */}

            {usuariosEscribiendo.length > 0 && (

              <div className="chat-escribiendo">


                <div className="chat-escribiendo-puntos">

                  <span></span>

                  <span></span>

                  <span></span>

                </div>


                <small>

                  {usuariosEscribiendo.length === 1
                    ? `${
                        perfiles[
                          usuariosEscribiendo[0].uid
                        ]?.nombre ||
                        usuariosEscribiendo[0].nombre ||
                        "Alguien"
                      } está escribiendo...`

                    : "Están escribiendo..."}

                </small>

              </div>

            )}


            <div
              ref={
                mensajesFinalRef
              }
            />

          </div>


          {/* =================================================
              INPUT
          ================================================= */}

          <form
            className="chat-interno-input"
            onSubmit={
              enviarMensaje
            }
          >

            <input
              type="text"
              value={texto}
              onChange={
                manejarCambioTexto
              }
              onBlur={() =>
                actualizarEstadoEscribiendo(
                  false
                )
              }
              placeholder="Escribir mensaje..."
              maxLength={1000}
              autoComplete="off"
            />


            <button
              type="submit"
              className="chat-interno-enviar"
              disabled={
                enviando ||
                !texto.trim()
              }
              aria-label="Enviar mensaje"
            >

              <FaPaperPlane />

            </button>

          </form>

        </div>

      )}


      {/* =====================================================
          BURBUJA MINIMIZADA
      ===================================================== */}

      {!abierto && (

        <button
          type="button"
          className="chat-interno-burbuja"
          onClick={() => {

  setAbierto(true);

  // En cuanto abro el chat,
  // ya estoy viendo los mensajes.
  setMensajes((anteriores) =>
    anteriores.map((mensaje) => {

      if (
        mensaje.autorUid === usuario?.uid
      ) {
        return mensaje;
      }

      const leidoPorActual =
        Array.isArray(mensaje.leidoPor)
          ? mensaje.leidoPor
          : [];

      if (
        leidoPorActual.includes(
          usuario.uid
        )
      ) {
        return mensaje;
      }

      return {
        ...mensaje,

        leidoPor: [
          ...leidoPorActual,
          usuario.uid
        ]
      };

    })
  );

}}
          aria-label="Abrir chat interno"
        >

          <FaComments />


          {mensajesNoLeidos.length > 0 && (

            <span className="chat-interno-contador">

              {mensajesNoLeidos.length > 99
                ? "99+"
                : mensajesNoLeidos.length}

            </span>

          )}

        </button>

      )}

    </>
  );

}


export default ChatInternoBurbuja;