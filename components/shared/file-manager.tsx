"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileVideo, FileText, Image as ImageIcon, File as FileIcon, UploadCloud, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileRow {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
}

interface FileManagerProps {
  accountId?: string;
  promotionId?: string;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith("video/")) return <FileVideo className="h-5 w-5 text-brass-600" />;
  if (mimeType === "application/pdf") return <FileText className="h-5 w-5 text-danger" />;
  if (mimeType?.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-fairway-600" />;
  return <FileIcon className="h-5 w-5 text-ink/50" />;
}

/** Lista + subida + eliminación de archivos adjuntos (videos, PDFs, imágenes) para una cuenta o promoción. */
export function FileManager({ accountId, promotionId }: FileManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = accountId ? `accountId=${accountId}` : `promotionId=${promotionId}`;

  const load = useCallback(async () => {
    const res = await fetch(`/api/files?${query}`);
    if (res.ok) setFiles(await res.json());
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFile(file: globalThis.File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    if (accountId) formData.append("accountId", accountId);
    if (promotionId) formData.append("promotionId", promotionId);
    const res = await fetch("/api/files", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      load();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo subir el archivo.");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este archivo? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,application/pdf,image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <UploadCloud className="h-4 w-4" />
        {uploading ? "Subiendo…" : "Subir video, PDF o imagen"}
      </Button>

      {error && <p className="text-sm text-danger">{error}</p>}

      {files === null ? (
        <p className="text-sm text-ink/40">Cargando…</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-ink/40">Sin archivos adjuntos todavía.</p>
      ) : (
        <ul className="divide-y divide-ink/5 rounded-card border border-ink/10 bg-white shadow-card">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-2.5">
              <FileTypeIcon mimeType={f.mimeType} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{f.name}</p>
                <p className="text-xs text-ink/40">{formatSize(f.size)}</p>
              </div>
              <a href={f.url} target="_blank" rel="noopener noreferrer" title="Descargar / ver">
                <Button size="icon" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(f.id)} aria-label="Eliminar">
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
