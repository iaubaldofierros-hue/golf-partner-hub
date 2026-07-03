/**
 * Etiquetas en español para enums de la base de datos.
 * La BD guarda claves estables; la UI muestra lenguaje claro para el operador.
 */

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  PROSPECT: "Prospecto",
  CONTACTED: "Contactado",
  ACTIVE: "Activo",
  HIGH_PRODUCTION: "Alta producción",
  LOW_PRODUCTION: "Baja producción",
  NEGOTIATING: "En negociación",
  FOLLOW_UP: "En seguimiento",
  INACTIVE: "Inactivo",
  NOT_INTERESTED: "No interesado",
  NEEDS_VISIT: "Requiere visita",
  NEEDS_CALL: "Requiere llamada",
  NEEDS_PROMO: "Requiere promoción",
};

export const ACCOUNT_STATUS_COLORS: Record<string, string> = {
  PROSPECT: "bg-sand-200 text-ink",
  CONTACTED: "bg-fairway-100 text-fairway-800",
  ACTIVE: "bg-fairway-500 text-white",
  HIGH_PRODUCTION: "bg-fairway-700 text-white",
  LOW_PRODUCTION: "bg-warn/15 text-warn",
  NEGOTIATING: "bg-brass-500/15 text-brass-600",
  FOLLOW_UP: "bg-fairway-100 text-fairway-700",
  INACTIVE: "bg-neutral-200 text-neutral-500",
  NOT_INTERESTED: "bg-neutral-200 text-neutral-500",
  NEEDS_VISIT: "bg-warn/15 text-warn",
  NEEDS_CALL: "bg-danger/10 text-danger",
  NEEDS_PROMO: "bg-brass-500/15 text-brass-600",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  VIP: "VIP",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-neutral-100 text-neutral-500",
  MEDIUM: "bg-sand-200 text-ink",
  HIGH: "bg-warn/15 text-warn",
  VIP: "bg-brass-500 text-white",
};

export const POTENTIAL_LABELS: Record<string, string> = {
  LOW: "Bajo",
  MEDIUM: "Medio",
  HIGH: "Alto",
  STRATEGIC: "Estratégico",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  EMAIL_SENT: "Email enviado",
  EMAIL_RECEIVED: "Email recibido",
  WHATSAPP_SENT: "WhatsApp enviado",
  WHATSAPP_RECEIVED: "WhatsApp recibido",
  CALL_MADE: "Llamada realizada",
  CALL_RECEIVED: "Llamada recibida",
  VISIT: "Visita presencial",
  MEETING: "Reunión",
  PROPOSAL_SENT: "Propuesta enviada",
  RATE_SENT: "Tarifa enviada",
  CONTRACT_SENT: "Contrato enviado",
  FOLLOW_UP: "Seguimiento",
  INTERNAL_NOTE: "Nota interna",
  BOOKING_RECEIVED: "Reserva recibida",
  COMPLAINT: "Queja",
  FAM_TRIP: "Fam trip",
  PLAY_INVITATION: "Invitación a jugar",
};

export const CALL_RESULTS = [
  "No contestó",
  "Interesado",
  "Pidió información",
  "Solicita tarifa",
  "Solicita propuesta",
  "No interesado",
  "Llamar después",
  "Confirmó reserva",
];

export const OPPORTUNITY_STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "Nuevo lead",
  CONTACTED: "Contactado",
  INTERESTED: "Interesado",
  PROPOSAL_SENT: "Propuesta enviada",
  NEGOTIATING: "En negociación",
  CONFIRMED: "Confirmado",
  WON: "Ganado",
  LOST: "Perdido",
  FUTURE_FOLLOW_UP: "Seguimiento futuro",
};

export const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  PHONE: "Teléfono",
  IN_PERSON: "Presencial",
  OTHER: "Otro",
};

export const PROMOTION_TYPES = [
  "Green Fee especial", "Twilight", "Early Twilight", "Morning",
  "Stay & Play", "Grupos", "Torneos", "MICE", "Temporada baja",
  "Temporada alta", "Last minute tee times", "Concierges", "DMC",
  "Agencias Nacionales", "Tour Operadores", "Hoteles",
];

export const AI_TONES = [
  "Profesional", "Humano mexicano", "Premium", "Directo",
  "Concierge friendly", "Luxury travel", "Corporativo",
];

export const PROMOTION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  EXPIRED: "Vencida",
  ARCHIVED: "Archivada",
};

export const PROMOTION_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-sand-100 text-ink/70",
  ACTIVE: "bg-fairway-500/15 text-fairway-900",
  PAUSED: "bg-amber-100 text-amber-800",
  EXPIRED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-ink/5 text-ink/50",
};
