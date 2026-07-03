"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getEntityConfig, type EntityConfig, type FieldOption } from "@/lib/admin-entities";

interface EntityFormDialogProps {
  config: EntityConfig;
  /** null = crear nuevo registro; objeto = editar registro existente */
  initialRow: Record<string, unknown> | null;
  onClose: () => void;
  onSaved: () => void;
}

function toDateInputValue(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function EntityFormDialog({ config, initialRow, onClose, onSaved }: EntityFormDialogProps) {
  const isEdit = !!initialRow;
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [relationOptions, setRelationOptions] = useState<Record<string, FieldOption[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initial: Record<string, string | boolean> = {};
    for (const field of config.fields) {
      const raw = initialRow?.[field.key];
      if (field.type === "boolean") initial[field.key] = raw === true;
      else if (field.type === "date") initial[field.key] = toDateInputValue(raw);
      else initial[field.key] = raw != null ? String(raw) : "";
    }
    setValues(initial);
  }, [config, initialRow]);

  useEffect(() => {
    const relationKeys = Array.from(new Set(config.fields.filter((f) => f.relation).map((f) => f.relation!)));
    relationKeys.forEach(async (relKey) => {
      const relConfig = getEntityConfig(relKey);
      if (!relConfig) return;
      const res = await fetch(`/api/admin/${relKey}`);
      if (!res.ok) return;
      const rows: Record<string, unknown>[] = await res.json();
      setRelationOptions((prev) => ({
        ...prev,
        [relKey]: rows.map((r) => ({ value: String(r.id), label: relConfig.labelField(r) })),
      }));
    });
  }, [config]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const url = isEdit ? `/api/admin/${config.key}/${initialRow!.id}` : `/api/admin/${config.key}`;
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo guardar el registro.");
    }
  }

  return (
    <Dialog open onClose={onClose} title={`${isEdit ? "Editar" : "Nuevo"} ${config.label.toLowerCase()}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((field) => {
            const wide = field.type === "textarea";
            return (
              <div key={field.key} className={wide ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && " *"}
                </Label>
                {field.type === "textarea" && (
                  <Textarea
                    id={field.key}
                    rows={3}
                    value={(values[field.key] as string) ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                )}
                {field.type === "boolean" && (
                  <div className="h-10 flex items-center">
                    <input
                      id={field.key}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={(values[field.key] as boolean) ?? false}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.checked }))}
                    />
                  </div>
                )}
                {field.type === "select" && (
                  <Select
                    id={field.key}
                    value={(values[field.key] as string) ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                )}
                {field.type === "relation" && (
                  <Select
                    id={field.key}
                    value={(values[field.key] as string) ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {(relationOptions[field.relation!] ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                )}
                {(field.type === "text" || field.type === "number" || field.type === "date") && (
                  <Input
                    id={field.key}
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    step={field.type === "number" ? "0.01" : undefined}
                    value={(values[field.key] as string) ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
