
/* ==========================================
   DR. REUMA - VALIDACIONES PACIENTES
   No modifica el teléfono ni WhatsApp.
========================================== */

// Nombres y apellidos: letras e iniciales mayúsculas
export const formatearNombre = (valor = "") => {
  return String(valor)
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]/g, "")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-AR")
    .replace(
      /(^|[\s'-])([a-záéíóúüñ])/g,
      (_, separador, letra) =>
        separador + letra.toLocaleUpperCase("es-AR")
    );
};

// DNI: solo números
export const soloNumeros = (valor = "") => {
  return String(valor).replace(/\D/g, "");
};

// Credencial: solo números, campo opcional
export const formatearCredencial = (valor = "") => {
  return soloNumeros(valor);
};

// Obra social: solo letras y espacios, en mayúsculas

export const formatearObraSocial = (valor = "") =>
  String(valor)
    .replace(/[^\p{L}\s/-]/gu, "")
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("es-AR");

// Fecha: DD-MM-AAAA
export const formatearFechaNacimiento = (valor = "") => {
  const numeros = String(valor)
    .replace(/\D/g, "")
    .slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}-${numeros.slice(2)}`;
  }

  return `${numeros.slice(0, 2)}-${numeros.slice(2, 4)}-${numeros.slice(4)}`;
};

// Validar fecha real, no futura
export const validarFechaNacimiento = (valor = "") => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(valor)) {
    return false;
  }

  const [dia, mes, anio] = valor.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const hoy = new Date();

  hoy.setHours(23, 59, 59, 999);

  return (
    anio >= 1900 &&
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia &&
    fecha <= hoy
  );
};

// Nombre completo para compatibilidad con Firebase
export const generarNombreCompleto = (
  nombres = "",
  apellidos = ""
) => {
  return [String(nombres).trim(), String(apellidos).trim()]
    .filter(Boolean)
    .join(" ");
};
