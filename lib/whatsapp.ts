/**
 * Utilidades de WhatsApp comercial asistido.
 * Genera enlaces wa.me con mensaje pre-cargado.
 */

/** Normaliza teléfono a dígitos internacionales (ej. 5216241234567) */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const clean = normalizePhone(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/** Personaliza plantilla con variables {{nombre}}, {{cuenta}}, {{promo}}, {{tarifa}}, {{vigencia}}, {{link}} */
export function personalizeMessage(
  template: string,
  vars: Record<string, string | undefined>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
