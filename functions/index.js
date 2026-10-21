
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

const opciones = {
  region: "us-central1",
  maxInstances: 10,
  enforceAppCheck: true,
};

// Valida una fecha sin aceptar formatos inesperados.
function validarFecha(fecha) {
  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "La fecha no es válida."
    );
  }

  const date = new Date(`${fecha}T12:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== fecha
  ) {
    throw new HttpsError(
      "invalid-argument",
      "La fecha no existe."
    );
  }

  return date;
}

function obtenerHorarios(fecha, viernesConfig) {
  const dia = validarFecha(fecha).getUTCDay();

  switch (dia) {
    case 0:
      return [];

    case 1:
    case 2:
    case 3:
      return [
        "15:00", "15:30", "16:00",
        "16:30", "17:00", "17:30",
      ];

    case 4:
      return ["10:00", "10:30", "11:00"];

    case 5:
      if (viernesConfig?.turno === "mañana") {
        return ["10:00", "10:30", "11:00"];
      }
      return [];

    case 6:
      return [
        "10:00", "10:30", "11:00",
        "11:30", "12:00",
      ];

    default:
      return [];
  }
}

// Devuelve exclusivamente horarios disponibles.
// Nunca devuelve DNI, nombres ni datos clínicos.
exports.obtenerHorariosPublicos = onCall(
  opciones,
  async (request) => {
    const fecha = request.data?.fecha;
    validarFecha(fecha);

    const hoy = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (fecha < hoy) {
      return { horarios: [] };
    }

    const [
      citasSnap,
      bloqueosSnap,
      bloqueosHoraSnap,
      viernesSnap,
    ] = await Promise.all([
      db.collection("citas")
        .where("fecha", "==", fecha).get(),

      db.collection("bloqueosAgenda")
        .where("fecha", "==", fecha).get(),

      db.collection("bloqueosHora")
        .where("fecha", "==", fecha).get(),

      db.collection("viernesAgenda")
        .where("fecha", "==", fecha).get(),
    ]);

    const diaBloqueado = bloqueosSnap.docs.some(
      (doc) => doc.data().activo === true
    );

    if (diaBloqueado) {
      return { horarios: [] };
    }

    const viernesConfig = viernesSnap.docs.length
      ? viernesSnap.docs[0].data()
      : null;

    const horariosBase = obtenerHorarios(
      fecha,
      viernesConfig
    );

    const normalizarHora = (hora) =>
      String(hora || "").trim().slice(0, 5);

    const ocupados = new Set(
      citasSnap.docs.map((doc) =>
        normalizarHora(doc.data().hora)
      )
    );

    const bloqueados = new Set(
      bloqueosHoraSnap.docs
        .filter((doc) => doc.data().activo === true)
        .map((doc) => normalizarHora(doc.data().hora))
    );

    const horarios = horariosBase.filter(
      (hora) =>
        !ocupados.has(hora) &&
        !bloqueados.has(hora)
    );

    return { horarios };
  }
);
