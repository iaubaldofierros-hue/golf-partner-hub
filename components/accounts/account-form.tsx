"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { accountSchema, type AccountFormValues } from "@/lib/validations";
import { PRIORITY_LABELS, POTENTIAL_LABELS, ACCOUNT_STATUS_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Option { id: string; name: string }

interface AccountFormProps {
  accountTypes: Option[];
  businessOrigins: Option[];
}

/**
 * Flujo "Nueva cuenta rápida": primero solo lo esencial,
 * lo avanzado queda colapsado. Guarda cuenta + contacto principal + primer seguimiento.
 */
export function AccountForm({ accountTypes, businessOrigins }: AccountFormProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { priority: "MEDIUM", preferredLanguage: "es" },
  });

  async function onSubmit(values: AccountFormValues) {
    setSaving(true);
    setServerError(null);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      const account = await res.json();
      router.push(`/accounts/${account.id}`);
      router.refresh();
    } else {
      setServerError("No se pudo guardar la cuenta. Revisa los campos e intenta de nuevo.");
    }
  }

  const err = (msg?: string) => msg && <p className="text-xs text-danger mt-1">{msg}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Datos esenciales</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">Nombre de la cuenta *</Label>
            <Input id="name" placeholder="Ej. Hotel Esperanza, Cabo DMC…" {...register("name")} />
            {err(errors.name?.message)}
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de cuenta *</Label>
            <Select {...register("accountTypeId")}>
              <option value="">Selecciona…</option>
              {accountTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            {err(errors.accountTypeId?.message)}
          </div>
          <div className="space-y-1.5">
            <Label>Origen de negocio *</Label>
            <Select {...register("businessOriginId")}>
              <option value="">Selecciona…</option>
              {businessOrigins.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
            {err(errors.businessOriginId?.message)}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" placeholder="Cabo San Lucas" {...register("city")} />
          </div>
          <div className="space-y-1.5">
            <Label>Prioridad</Label>
            <Select {...register("priority")}>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="nextFollowUpDate">Primer seguimiento</Label>
            <Input id="nextFollowUpDate" type="date" {...register("nextFollowUpDate")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contacto principal</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="contactFirstName">Nombre</Label>
            <Input id="contactFirstName" placeholder="María" {...register("contactFirstName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactWhatsapp">WhatsApp</Label>
            <Input id="contactWhatsapp" placeholder="52 624 123 4567" {...register("contactWhatsapp")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" type="email" placeholder="nombre@empresa.com" {...register("contactEmail")} />
            {err(errors.contactEmail?.message)}
          </div>
        </CardContent>
      </Card>

      {/* Información avanzada — colapsada por default */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-fairway-700"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
        Información avanzada (opcional)
      </button>

      {showAdvanced && (
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2 pt-5">
            <div className="space-y-1.5"><Label>País</Label><Input {...register("country")} /></div>
            <div className="space-y-1.5"><Label>Zona</Label><Input {...register("zone")} /></div>
            <div className="space-y-1.5"><Label>Teléfono principal</Label><Input {...register("mainPhone")} /></div>
            <div className="space-y-1.5">
              <Label>Email principal</Label>
              <Input type="email" {...register("mainEmail")} />
              {err(errors.mainEmail?.message)}
            </div>
            <div className="space-y-1.5"><Label>Sitio web</Label><Input {...register("website")} /></div>
            <div className="space-y-1.5">
              <Label>Idioma preferido</Label>
              <Select {...register("preferredLanguage")}>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estatus</Label>
              <Select {...register("status")}>
                {Object.entries(ACCOUNT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Potencial comercial</Label>
              <Select {...register("potentialLevel")}>
                {Object.entries(POTENTIAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Tarifa asignada (USD)</Label><Input type="number" step="0.01" {...register("assignedRate")} /></div>
            <div className="space-y-1.5"><Label>Comisión %</Label><Input type="number" step="0.5" {...register("commissionPercentage")} /></div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Notas</Label>
              <Textarea rows={3} {...register("notes")} />
            </div>
          </CardContent>
        </Card>
      )}

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cuenta"}</Button>
      </div>
    </form>
  );
}
