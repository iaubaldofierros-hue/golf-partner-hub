/**
 * Generación de copies comerciales con IA (Anthropic Claude).
 * Genera asunto, preview, email, WhatsApp, script de llamada y seguimiento
 * en español, inglés o bilingüe.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { GenerateCopyInput } from "@/lib/validations";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GeneratedCopy {
  subject: string;
  previewText: string;
  emailBody: string;
  whatsappMessage: string;
  phoneScript: string;
  followUpMessage: string;
}

export async function generateCommercialCopy(input: GenerateCopyInput): Promise<GeneratedCopy> {
  const langLabel =
    input.language === "en" ? "inglés" : input.language === "both" ? "español e inglés (ambos, separados)" : "español";

  const prompt = `Eres el copywriter comercial de un campo de golf de lujo en Los Cabos.
Genera contenido comercial B2B para la siguiente promoción, dirigido al segmento indicado.

Promoción: ${input.promotionName}
Segmento / origen de negocio: ${input.businessOrigin ?? "General"}
Tarifa: ${input.rate ?? "No especificada"}
Vigencia: ${input.validDates ?? "No especificada"}
Beneficios: ${input.benefits ?? "No especificados"}
Call to action: ${input.callToAction ?? "Reservar tee times"}
Tono: ${input.tone}
Idioma: ${langLabel}

Reglas:
- Lenguaje comercial cálido y profesional, sin sonar robótico.
- WhatsApp: máximo 5 líneas, con emojis moderados y CTA claro.
- Email: cuerpo listo para enviar, con saludo personalizable {{nombre}}.
- Script de llamada: apertura, propuesta de valor, manejo de objeción y cierre.
- Seguimiento: mensaje breve para reactivar si no hubo respuesta en 3 días.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional, con estas claves exactas:
{"subject": "...", "previewText": "...", "emailBody": "...", "whatsappMessage": "...", "phoneScript": "...", "followUpMessage": "..."}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(text) as GeneratedCopy;
}
