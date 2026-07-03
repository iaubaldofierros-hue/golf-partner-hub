import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy", { locale: es });
}

export function timeAgo(date?: Date | string | null) {
  if (!date) return "Sin contacto";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function formatMoney(value?: number | string | null, currency = "USD") {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(Number(value));
}

/** Días de atraso de un seguimiento (positivo = vencido) */
export function overdueDays(date?: Date | string | null) {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}
