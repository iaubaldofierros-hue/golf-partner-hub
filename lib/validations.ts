import { z } from "zod";

// ---------- Cuenta (nivel esencial + avanzado) ----------
export const accountEssentialSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  accountTypeId: z.string().min(1, "Selecciona el tipo de cuenta"),
  businessOriginId: z.string().min(1, "Selecciona el origen de negocio"),
  city: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "VIP"]).default("MEDIUM"),
  nextFollowUpDate: z.string().optional(),
  // Contacto principal (creación rápida)
  contactFirstName: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
});

export const accountAdvancedSchema = z.object({
  country: z.string().optional(),
  zone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  mainPhone: z.string().optional(),
  mainEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  preferredLanguage: z.enum(["es", "en"]).default("es"),
  status: z.string().optional(),
  potentialLevel: z.enum(["LOW", "MEDIUM", "HIGH", "STRATEGIC"]).optional(),
  historicalRevenue: z.coerce.number().optional(),
  estimatedRevenue: z.coerce.number().optional(),
  assignedRate: z.coerce.number().optional(),
  commissionPercentage: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const accountSchema = accountEssentialSchema.merge(accountAdvancedSchema.partial());
export type AccountFormValues = z.infer<typeof accountSchema>;

// ---------- Contacto ----------
export const contactSchema = z.object({
  accountId: z.string().min(1),
  firstName: z.string().min(2, "Nombre obligatorio"),
  lastName: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  preferredChannel: z.enum(["WHATSAPP", "EMAIL", "PHONE"]).default("WHATSAPP"),
  language: z.enum(["es", "en"]).default("es"),
  influenceLevel: z.string().optional(),
  receivesPromotions: z.boolean().default(true),
  notes: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
});
export type ContactFormValues = z.infer<typeof contactSchema>;

// ---------- Actividad rápida (< 30 segundos) ----------
export const quickActivitySchema = z.object({
  accountId: z.string().min(1),
  contactId: z.string().optional(),
  type: z.string().min(1, "Selecciona el tipo"),
  result: z.string().optional(),
  notes: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  promotionId: z.string().optional(),
});
export type QuickActivityValues = z.infer<typeof quickActivitySchema>;

// ---------- Promoción ----------
export const promotionSchema = z.object({
  name: z.string().min(2, "Nombre obligatorio"),
  type: z.string().min(1, "Selecciona el tipo"),
  businessOriginId: z.string().optional(),
  targetSegment: z.string().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  season: z.string().optional(),
  publicRate: z.coerce.number().optional(),
  promoRate: z.coerce.number().optional(),
  commission: z.coerce.number().optional(),
  promoCode: z.string().optional(),
  restrictions: z.string().optional(),
  benefits: z.string().optional(),
  bookingLink: z.string().optional(),
  whatsappMessage: z.string().optional(),
  phoneScript: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"]).default("DRAFT"),
});
export type PromotionFormValues = z.infer<typeof promotionSchema>;

// ---------- IA generate-copy ----------
export const generateCopySchema = z.object({
  promotionName: z.string().min(2),
  businessOrigin: z.string().optional(),
  language: z.enum(["es", "en", "both"]).default("es"),
  tone: z.string().default("Profesional"),
  rate: z.string().optional(),
  validDates: z.string().optional(),
  benefits: z.string().optional(),
  callToAction: z.string().optional(),
  channel: z.enum(["whatsapp", "email", "phone", "all"]).default("all"),
});
export type GenerateCopyInput = z.infer<typeof generateCopySchema>;
