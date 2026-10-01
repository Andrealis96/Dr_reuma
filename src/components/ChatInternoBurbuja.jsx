import {
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
        "asc"
      ),

      limit(100)

    );


    const unsubscribe = onSnapshot(

      qMensajes,

      (snapshot) => {

        const datos =
          snapshot.docs.map(
            (documento) => ({
              id: documento.id,
              ...documento.data()
            })
          );


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


  const nombreOtroUsuario =
    otroUsuarioEnLinea
      ? (
          perfiles[
            otroUsuarioEnLinea.uid
          ]?.nombre ||

          otroUsuarioEnLinea.nombre ||

          "Miembro del equipo"
        )
      : "";


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
                  )
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
  // SCROLL AUTOMÁTICO
  // =========================================================

  useEffect(() => {

    if (!abierto) return;


    setTimeout(() => {

      mensajesFinalRef.current
        ?.scrollIntoView({
          behavior:
            "smooth"
        });

    }, 80);

  }, [
    abierto,
    mensajes.length,
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

          <div className="chat-interno-body">


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
                (mensaje) => {

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
                    ]?.nombre ||
                    "";


                  const esUltimoMensajeMio =
                    esMio &&
                    ultimoMensajeMio?.id ===
                      mensaje.id;


                  return (

                    <div
                      key={mensaje.id}
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
                                }`
                              : "✓ Enviado"}

                          </small>

                        )}

                      </div>

                    </div>

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
          onClick={() =>
            setAbierto(true)
          }
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