"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { promotionSchema, type PromotionFormValues } from "@/lib/validations";
import { PROMOTION_TYPES, AI_TONES } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Origin {
  id: string;
  name: string;
}

interface PromotionFormProps {
  origins: Origin[];
  /** Si viene, el formulario edita en lugar de crear */
  promotion?: Partial<PromotionFormValues> & { id?: string };
}

/**
 * Formulario en dos niveles (esencial + avanzado) con el flujo estrella:
 * "Generar con IA" produce email, WhatsApp y script de llamada en un clic.
 */
export function PromotionForm({ origins, promotion }: PromotionFormProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiLanguage, setAiLanguage] = useState<"es" | "en" | "both">("es");
  const [aiTone, setAiTone] = useState(AI_TONES[0]);
  const [aiError, setAiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      status: "DRAFT",
      ...promotion,
    },
  });

  async function generateWithAI() {
    setAiError(null);
    const v = getValues();
    if (!v.name || v.name.length < 2) {
      setAiError("Ponle nombre a la promoción antes de generar los copies.");
      return;
    }
    setGenerating(true);
    try {
      const originName = origins.find((o) => o.id === v.businessOriginId)?.name;
      const res = await fetch("/api/ai/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionName: v.name,
          businessOrigin: v.targetSegment || originName,
          language: aiLanguage,
          tone: aiTone,
          rate: v.promoRate ? `$${v.promoRate} USD` : undefined,
          validDates:
            v.validFrom && v.validTo ? `${v.validFrom} al ${v.validTo}` : undefined,
          benefits: v.benefits || undefined,
          callToAction: v.bookingLink
            ? `Reservar en ${v.bookingLink}`
            : "Reservar tee times",
          channel: "all",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "No se pudo generar el contenido");
      }
      const copy = await res.json();
      setValue("whatsappMessage", copy.whatsappMessage ?? "");
      setValue("phoneScript", copy.phoneScript ?? "");
      // El email generado se guarda en beneficios extendidos vía copy ES/EN del modelo
      setShowAdvanced(true);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Error al generar con IA");
    } finally {
      setGenerating(false);
    }
  }

  async function onSubmit(values: PromotionFormValues) {
    setSaving(true);
    try {
      const res = await fetch(
        promotion?.id ? `/api/promotions/${promotion.id}` : "/api/promotions",
        {
          method: promotion?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      if (!res.ok) throw new Error("Error al guardar");
      router.push("/promotions");
      router.refresh();
    } catch {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      {/* ---------- Nivel esencial ---------- */}
      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg text-fairway-900">Lo esencial</h2>

        <div>
          <Label htmlFor="name">Nombre de la promoción *</Label>
          <Input id="name" placeholder="Ej. Twilight Verano Concierges" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select id="type" {...register("type")}>
              <option value="">Selecciona…</option>
              {PROMOTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
          </div>
          <div>
            <Label htmlFor="businessOriginId">Segmento / origen</Label>
            <Select id="businessOriginId" {...register("businessOriginId")}>
              <option value="">General</option>
              {origins.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="promoRate">Tarifa promo (USD)</Label>
            <Input id="promoRate" type="number" step="0.01" {...register("promoRate")} />
          </div>
          <div>
            <Label htmlFor="validFrom">Vigencia desde</Label>
            <Input id="validFrom" type="date" {...register("validFrom")} />
          </div>
          <div>
            <Label htmlFor="validTo">Vigencia hasta</Label>
            <Input id="validTo" type="date" {...register("validTo")} />
          </div>
        </div>

        <div>
          <Label htmlFor="benefits">Beneficios (uno por línea)</Label>
          <Textarea
            id="benefits"
            rows={3}
            placeholder={"Carrito incluido\nRange balls\nDescuento en pro shop"}
            {...register("benefits")}
          />
        </div>

        <div>
          <Label htmlFor="status">Estatus</Label>
          <Select id="status" {...register("status")}>
            <option value="DRAFT">Borrador</option>
            <option value="ACTIVE">Activa</option>
            <option value="PAUSED">Pausada</option>
            <option value="EXPIRED">Vencida</option>
            <option value="ARCHIVED">Archivada</option>
          </Select>
        </div>
      </Card>

      {/* ---------- Generar con IA ---------- */}
      <Card className="p-5 space-y-3 border-brass/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brass" />
          <h2 className="font-display text-lg text-fairway-900">Copies comerciales con IA</h2>
        </div>
        <p className="text-sm text-ink/60">
          Genera el mensaje de WhatsApp y el script de llamada con los datos de arriba. Puedes editarlos antes de guardar.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Idioma</Label>
            <Select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value as never)} className="w-36">
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="both">Bilingüe</option>
            </Select>
          </div>
          <div>
            <Label>Tono</Label>
            <Select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="w-48">
              {AI_TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <Button type="button" variant="brass" onClick={generateWithAI} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generando…" : "Generar con IA"}
          </Button>
        </div>
        {aiError && <p className="text-xs text-red-600">{aiError}</p>}
      </Card>

      {/* ---------- Nivel avanzado ---------- */}
      <button
        type="button"
        onClick={() => setShowAdvanced((s) => !s)}
        className="flex items-center gap-2 text-sm font-medium text-fairway-700 hover:text-fairway-900"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
        Mensajes y detalles avanzados
      </button>

      {showAdvanced && (
        <Card className="p-5 space-y-4">
          <div>
            <Label htmlFor="whatsappMessage">Mensaje de WhatsApp</Label>
            <Textarea
              id="whatsappMessage"
              rows={5}
              placeholder="Hola {{nombre}} 👋 …"
              {...register("whatsappMessage")}
            />
            <p className="mt-1 text-xs text-ink/50">
              Variables: {"{{nombre}}"}, {"{{cuenta}}"}, {"{{promo}}"}, {"{{tarifa}}"}, {"{{vigencia}}"}, {"{{link}}"}
            </p>
          </div>
          <div>
            <Label htmlFor="phoneScript">Script de llamada</Label>
            <Textarea id="phoneScript" rows={5} {...register("phoneScript")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="publicRate">Tarifa pública (USD)</Label>
              <Input id="publicRate" type="number" step="0.01" {...register("publicRate")} />
            </div>
            <div>
              <Label htmlFor="commission">Comisión (%)</Label>
              <Input id="commission" type="number" step="0.5" {...register("commission")} />
            </div>
            <div>
              <Label htmlFor="promoCode">Código promo</Label>
              <Input id="promoCode" {...register("promoCode")} />
            </div>
            <div>
              <Label htmlFor="season">Temporada</Label>
              <Input id="season" placeholder="Verano 2026" {...register("season")} />
            </div>
          </div>
          <div>
            <Label htmlFor="bookingLink">Link de reserva</Label>
            <Input id="bookingLink" placeholder="https://…" {...register("bookingLink")} />
          </div>
          <div>
            <Label htmlFor="targetSegment">Segmento objetivo (texto libre)</Label>
            <Input id="targetSegment" placeholder="Concierges de hoteles 5 estrellas" {...register("targetSegment")} />
          </div>
          <div>
            <Label htmlFor="restrictions">Restricciones</Label>
            <Textarea id="restrictions" rows={2} {...register("restrictions")} />
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : promotion?.id ? "Guardar cambios" : "Crear promoción"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
