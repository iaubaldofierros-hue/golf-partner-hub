/**
 * Registro central del panel de administración.
 * Un solo lugar describe qué entidades se pueden listar/editar/eliminar,
 * qué columnas mostrar y qué campos expone el formulario genérico.
 * Sin dependencias de Prisma aquí — este archivo se importa desde el cliente.
 */
import {
  ACCOUNT_STATUS_LABELS,
  PRIORITY_LABELS,
  POTENTIAL_LABELS,
  CHANNEL_LABELS,
  ACTIVITY_TYPE_LABELS,
  PROMOTION_STATUS_LABELS,
  OPPORTUNITY_STAGE_LABELS,
} from "@/lib/labels";

export type FieldType = "text" | "textarea" | "number" | "date" | "boolean" | "select" | "relation";

export interface FieldOption {
  value: string;
  label: string;
}

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[]; // for type "select"
  relation?: string; // entity key to source options from, for type "relation"
}

export interface EntityConfig {
  key: string;
  label: string;
  pluralLabel: string;
  delegate: string; // prisma client delegate name, e.g. prisma.account
  labelField: (row: Record<string, unknown>) => string; // human label for relation dropdowns
  listColumns: { key: string; label: string; render?: (row: Record<string, unknown>) => string }[];
  fields: EntityField[];
  allowCreate?: boolean;
  include?: Record<string, boolean>; // prisma `include` used when listing, for relations shown in columns
}

const toOptions = (labels: Record<string, string>): FieldOption[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

const ROLE_OPTIONS: FieldOption[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "SALES_DIRECTOR", label: "Director comercial" },
  { value: "SALES_MANAGER", label: "Gerente comercial" },
  { value: "MARKETING", label: "Marketing" },
  { value: "VIEWER", label: "Solo lectura" },
];

const USER_STATUS_OPTIONS: FieldOption[] = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
];

const CAMPAIGN_STATUS_OPTIONS: FieldOption[] = [
  { value: "DRAFT", label: "Borrador" },
  { value: "SCHEDULED", label: "Programada" },
  { value: "SENDING", label: "Enviando" },
  { value: "SENT", label: "Enviada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const LANGUAGE_OPTIONS: FieldOption[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
];

const fullName = (row: Record<string, unknown>) =>
  [row.firstName, row.lastName].filter(Boolean).join(" ") || (row.name as string) || String(row.id ?? "");

export const ADMIN_ENTITIES: EntityConfig[] = [
  {
    key: "accounts",
    label: "Cuenta",
    pluralLabel: "Cuentas",
    delegate: "account",
    labelField: (r) => (r.name as string) ?? "",
    listColumns: [
      { key: "name", label: "Nombre" },
      { key: "accountType", label: "Tipo", render: (r) => ((r.accountType as { name?: string })?.name ?? "—") },
      { key: "status", label: "Estatus", render: (r) => ACCOUNT_STATUS_LABELS[r.status as string] ?? (r.status as string) },
      { key: "priority", label: "Prioridad", render: (r) => PRIORITY_LABELS[r.priority as string] ?? (r.priority as string) },
      { key: "city", label: "Ciudad" },
    ],
    include: { accountType: true },
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "accountTypeId", label: "Tipo de cuenta", type: "relation", relation: "accountTypes" },
      { key: "businessOriginId", label: "Origen de negocio", type: "relation", relation: "businessOrigins" },
      { key: "ownerId", label: "Responsable", type: "relation", relation: "users" },
      { key: "status", label: "Estatus", type: "select", options: toOptions(ACCOUNT_STATUS_LABELS) },
      { key: "priority", label: "Prioridad", type: "select", options: toOptions(PRIORITY_LABELS) },
      { key: "potentialLevel", label: "Potencial", type: "select", options: toOptions(POTENTIAL_LABELS) },
      { key: "country", label: "País", type: "text" },
      { key: "city", label: "Ciudad", type: "text" },
      { key: "zone", label: "Zona", type: "text" },
      { key: "address", label: "Dirección", type: "text" },
      { key: "website", label: "Sitio web", type: "text" },
      { key: "mainPhone", label: "Teléfono principal", type: "text" },
      { key: "mainEmail", label: "Email principal", type: "text" },
      { key: "preferredLanguage", label: "Idioma preferido", type: "select", options: LANGUAGE_OPTIONS },
      { key: "historicalRevenue", label: "Ingreso histórico", type: "number" },
      { key: "estimatedRevenue", label: "Ingreso estimado", type: "number" },
      { key: "assignedRate", label: "Tarifa asignada", type: "number" },
      { key: "commissionPercentage", label: "% Comisión", type: "number" },
      { key: "nextFollowUpDate", label: "Próximo seguimiento", type: "date" },
      { key: "notes", label: "Notas", type: "textarea" },
    ],
  },
  {
    key: "contacts",
    label: "Contacto",
    pluralLabel: "Contactos",
    delegate: "contact",
    labelField: fullName,
    listColumns: [
      { key: "firstName", label: "Nombre", render: fullName },
      { key: "account", label: "Cuenta", render: (r) => ((r.account as { name?: string })?.name ?? "—") },
      { key: "email", label: "Email" },
      { key: "whatsapp", label: "WhatsApp" },
    ],
    include: { account: true },
    fields: [
      { key: "accountId", label: "Cuenta", type: "relation", relation: "accounts", required: true },
      { key: "firstName", label: "Nombre", type: "text", required: true },
      { key: "lastName", label: "Apellido", type: "text" },
      { key: "position", label: "Puesto", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Teléfono", type: "text" },
      { key: "whatsapp", label: "WhatsApp", type: "text" },
      { key: "preferredChannel", label: "Canal preferido", type: "select", options: toOptions(CHANNEL_LABELS) },
      { key: "language", label: "Idioma", type: "select", options: LANGUAGE_OPTIONS },
      { key: "influenceLevel", label: "Nivel de influencia", type: "text" },
      { key: "receivesPromotions", label: "Recibe promociones", type: "boolean" },
      { key: "status", label: "Estatus", type: "text" },
      { key: "nextFollowUpDate", label: "Próximo seguimiento", type: "date" },
      { key: "notes", label: "Notas", type: "textarea" },
    ],
  },
  {
    key: "promotions",
    label: "Promoción",
    pluralLabel: "Promociones",
    delegate: "promotion",
    labelField: (r) => (r.name as string) ?? "",
    listColumns: [
      { key: "name", label: "Nombre" },
      { key: "type", label: "Tipo" },
      { key: "status", label: "Estatus", render: (r) => PROMOTION_STATUS_LABELS[r.status as string] ?? (r.status as string) },
      { key: "validFrom", label: "Vigencia", render: (r) => (r.validFrom ? new Date(r.validFrom as string).toLocaleDateString("es-MX") : "—") },
    ],
    allowCreate: true,
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "type", label: "Tipo", type: "text", required: true },
      { key: "businessOriginId", label: "Origen de negocio", type: "relation", relation: "businessOrigins" },
      { key: "targetSegment", label: "Segmento objetivo", type: "text" },
      { key: "status", label: "Estatus", type: "select", options: toOptions(PROMOTION_STATUS_LABELS) },
      { key: "validFrom", label: "Vigente desde", type: "date" },
      { key: "validTo", label: "Vigente hasta", type: "date" },
      { key: "season", label: "Temporada", type: "text" },
      { key: "publicRate", label: "Tarifa pública", type: "number" },
      { key: "promoRate", label: "Tarifa promo", type: "number" },
      { key: "commission", label: "% Comisión", type: "number" },
      { key: "promoCode", label: "Código promo", type: "text" },
      { key: "bookingLink", label: "Link de reserva", type: "text" },
      { key: "restrictions", label: "Restricciones", type: "textarea" },
      { key: "benefits", label: "Beneficios", type: "textarea" },
      { key: "whatsappMessage", label: "Mensaje WhatsApp", type: "textarea" },
      { key: "phoneScript", label: "Script de llamada", type: "textarea" },
    ],
  },
  {
    key: "opportunities",
    label: "Oportunidad",
    pluralLabel: "Oportunidades",
    delegate: "opportunity",
    labelField: (r) => (r.name as string) ?? "",
    listColumns: [
      { key: "name", label: "Nombre" },
      { key: "account", label: "Cuenta", render: (r) => ((r.account as { name?: string })?.name ?? "—") },
      { key: "stage", label: "Etapa", render: (r) => OPPORTUNITY_STAGE_LABELS[r.stage as string] ?? (r.stage as string) },
      { key: "estimatedValue", label: "Valor estimado" },
    ],
    include: { account: true },
    allowCreate: true,
    fields: [
      { key: "accountId", label: "Cuenta", type: "relation", relation: "accounts", required: true },
      { key: "contactId", label: "Contacto", type: "relation", relation: "contacts" },
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "stage", label: "Etapa", type: "select", options: toOptions(OPPORTUNITY_STAGE_LABELS) },
      { key: "estimatedValue", label: "Valor estimado", type: "number" },
      { key: "estimatedPlayers", label: "Jugadores estimados", type: "number" },
      { key: "expectedDate", label: "Fecha esperada", type: "date" },
      { key: "probability", label: "Probabilidad (%)", type: "number" },
      { key: "source", label: "Origen", type: "text" },
      { key: "promotionId", label: "Promoción", type: "relation", relation: "promotions" },
      { key: "ownerId", label: "Responsable", type: "relation", relation: "users" },
      { key: "lostReason", label: "Razón de pérdida", type: "text" },
      { key: "notes", label: "Notas", type: "textarea" },
    ],
  },
  {
    key: "users",
    label: "Usuario",
    pluralLabel: "Usuarios",
    delegate: "user",
    labelField: (r) => (r.name as string) ?? (r.email as string) ?? "",
    listColumns: [
      { key: "name", label: "Nombre" },
      { key: "email", label: "Email" },
      { key: "role", label: "Rol", render: (r) => ROLE_OPTIONS.find((o) => o.value === r.role)?.label ?? (r.role as string) },
      { key: "status", label: "Estatus", render: (r) => (r.status === "ACTIVE" ? "Activo" : "Inactivo") },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "role", label: "Rol", type: "select", options: ROLE_OPTIONS },
      { key: "status", label: "Estatus", type: "select", options: USER_STATUS_OPTIONS },
    ],
  },
  {
    key: "activities",
    label: "Actividad",
    pluralLabel: "Actividades",
    delegate: "activity",
    labelField: (r) => (r.subject as string) ?? (r.type as string) ?? "",
    listColumns: [
      { key: "account", label: "Cuenta", render: (r) => ((r.account as { name?: string })?.name ?? "—") },
      { key: "type", label: "Tipo", render: (r) => ACTIVITY_TYPE_LABELS[r.type as string] ?? (r.type as string) },
      { key: "activityDate", label: "Fecha", render: (r) => new Date(r.activityDate as string).toLocaleDateString("es-MX") },
      { key: "result", label: "Resultado" },
    ],
    include: { account: true },
    fields: [
      { key: "accountId", label: "Cuenta", type: "relation", relation: "accounts", required: true },
      { key: "contactId", label: "Contacto", type: "relation", relation: "contacts" },
      { key: "type", label: "Tipo", type: "select", options: toOptions(ACTIVITY_TYPE_LABELS), required: true },
      { key: "channel", label: "Canal", type: "select", options: toOptions(CHANNEL_LABELS) },
      { key: "subject", label: "Asunto", type: "text" },
      { key: "result", label: "Resultado", type: "text" },
      { key: "activityDate", label: "Fecha", type: "date" },
      { key: "nextFollowUpDate", label: "Próximo seguimiento", type: "date" },
      { key: "promotionId", label: "Promoción", type: "relation", relation: "promotions" },
      { key: "opportunityId", label: "Oportunidad", type: "relation", relation: "opportunities" },
      { key: "notes", label: "Notas", type: "textarea" },
    ],
  },
  {
    key: "campaigns",
    label: "Campaña",
    pluralLabel: "Campañas",
    delegate: "campaign",
    labelField: (r) => (r.name as string) ?? "",
    listColumns: [
      { key: "name", label: "Nombre" },
      { key: "subject", label: "Asunto" },
      { key: "status", label: "Estatus", render: (r) => CAMPAIGN_STATUS_OPTIONS.find((o) => o.value === r.status)?.label ?? (r.status as string) },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "subject", label: "Asunto", type: "text", required: true },
      { key: "previewText", label: "Texto de vista previa", type: "text" },
      { key: "body", label: "Cuerpo", type: "textarea", required: true },
      { key: "promotionId", label: "Promoción", type: "relation", relation: "promotions" },
      { key: "language", label: "Idioma", type: "select", options: LANGUAGE_OPTIONS },
      { key: "status", label: "Estatus", type: "select", options: CAMPAIGN_STATUS_OPTIONS },
      { key: "scheduledAt", label: "Programada para", type: "date" },
    ],
  },
  {
    key: "accountTypes",
    label: "Tipo de cuenta",
    pluralLabel: "Tipos de cuenta",
    delegate: "accountType",
    labelField: (r) => (r.name as string) ?? "",
    listColumns: [{ key: "name", label: "Nombre" }],
    allowCreate: true,
    fields: [{ key: "name", label: "Nombre", type: "text", required: true }],
  },
  {
    key: "businessOrigins",
    label: "Origen de negocio",
    pluralLabel: "Orígenes de negocio",
    delegate: "businessOrigin",
    labelField: (r) => (r.name as string) ?? "",
    listColumns: [{ key: "name", label: "Nombre" }],
    allowCreate: true,
    fields: [{ key: "name", label: "Nombre", type: "text", required: true }],
  },
  {
    key: "tags",
    label: "Etiqueta",
    pluralLabel: "Etiquetas",
    delegate: "tag",
    labelField: (r) => (r.name as string) ?? "",
    listColumns: [
      { key: "name", label: "Nombre" },
      { key: "color", label: "Color" },
    ],
    allowCreate: true,
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "color", label: "Color (hex)", type: "text" },
    ],
  },
];

export function getEntityConfig(key: string): EntityConfig | undefined {
  return ADMIN_ENTITIES.find((e) => e.key === key);
}

/** Convierte los valores de string que llegan del formulario genérico al tipo que Prisma espera. */
export function coerceFieldValues(config: EntityConfig, input: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (!(field.key in input)) continue;
    const raw = input[field.key];
    if (raw === "" || raw === undefined) {
      data[field.key] = field.required ? raw : null;
      continue;
    }
    switch (field.type) {
      case "number":
        data[field.key] = raw === null ? null : Number(raw);
        break;
      case "date":
        data[field.key] = raw ? new Date(raw as string) : null;
        break;
      case "boolean":
        data[field.key] = raw === true || raw === "true";
        break;
      default:
        data[field.key] = raw;
    }
  }
  return data;
}
