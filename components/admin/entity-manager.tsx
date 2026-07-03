"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/admin/entity-form-dialog";
import type { EntityConfig } from "@/lib/admin-entities";

interface EntityManagerProps {
  config: EntityConfig;
}

export function EntityManager({ config }: EntityManagerProps) {
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/${config.key}`);
    if (res.ok) setRows(await res.json());
  }, [config.key]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm(`¿Eliminar este registro de ${config.label.toLowerCase()}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(id);
    setError(null);
    const res = await fetch(`/api/admin/${config.key}/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      load();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo eliminar el registro.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/50">{rows?.length ?? "…"} registros</p>
        {config.allowCreate && (
          <Button size="sm" onClick={() => setEditingRow(null)}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto rounded-card border border-ink/10 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-sand-50 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              {config.listColumns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows === null ? (
              <tr>
                <td colSpan={config.listColumns.length + 1} className="px-4 py-6 text-center text-ink/40">
                  Cargando…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={config.listColumns.length + 1} className="px-4 py-6 text-center text-ink/40">
                  Sin registros.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-sand-50/60">
                  {config.listColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-ink/80">
                      {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditingRow(row)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(String(row.id))}
                        disabled={deletingId === row.id}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingRow !== undefined && (
        <EntityFormDialog
          config={config}
          initialRow={editingRow}
          onClose={() => setEditingRow(undefined)}
          onSaved={load}
        />
      )}
    </div>
  );
}
