"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickActivitySchema, type QuickActivityValues } from "@/lib/validations";
import { ACTIVITY_TYPE_LABELS, CALL_RESULTS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";

/** Tipos frecuentes primero — el operador registra en menos de 30 segundos */
const QUICK_TYPES = [
  "WHATSAPP_SENT", "CALL_MADE", "EMAIL_SENT", "VISIT", "FOLLOW_UP", "INTERNAL_NOTE",
];

interface QuickActivityFormProps {
  accountId: string;
  contactId?: string;
  defaultType?: string;
  open: boolean;
  onClose: () => void;
}

export function QuickActivityForm({
  accountId, contactId, defaultType = "FOLLOW_UP", open, onClose,
}: QuickActivityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<QuickActivityValues>({
    resolver: zodResolver(quickActivitySchema),
    values: { accountId, contactId, type: defaultType, result: "", notes: "", nextFollowUpDate: "" },
  });

  async function onSubmit(values: QuickActivityValues) {
    setSaving(true);
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      reset();
      onClose();
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Registrar seguimiento">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="type">¿Qué hiciste?</Label>
          <Select id="type" {...register("type")}>
            {QUICK_TYPES.map((t) => (
              <option key={t} value={t}>{ACTIVITY_TYPE_LABELS[t]}</option>
            ))}
            <optgroup label="Otros">
              {Object.entries(ACTIVITY_TYPE_LABELS)
                .filter(([k]) => !QUICK_TYPES.includes(k))
                .map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </optgroup>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="result">Resultado</Label>
          <Select id="result" {...register("result")}>
            <option value="">Sin resultado aún</option>
            {CALL_RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Nota corta</Label>
          <Textarea id="notes" rows={2} placeholder="Ej. Le envié la promo Twilight, quedó de revisar con su gerente" {...register("notes")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nextFollowUpDate">Próximo seguimiento</Label>
          <Input id="nextFollowUpDate" type="date" {...register("nextFollowUpDate")} />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar seguimiento"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
