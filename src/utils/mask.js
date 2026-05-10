export function mascararDni(dni) {
  if (!dni) return "";
  const s = String(dni);
  if (s.length <= 4) return "*".repeat(s.length);
  return s.slice(0, 1) + "*".repeat(s.length - 4) + s.slice(-3);
}

export function mascararCorreo(correo) {
  if (!correo || !correo.includes("@")) return correo || "";
  const [local, dominio] = correo.split("@");
  if (local.length <= 2) return local[0] + "***@" + dominio;
  return local.slice(0, 2) + "***@" + dominio;
}
