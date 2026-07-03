"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
}

export function ImportAccountsCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/import-accounts", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      setResult(await res.json());
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo importar el archivo.");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar cuentas desde CSV o Excel</CardTitle>
        <p className="text-xs text-ink/50">
          Cada fila crea o actualiza una cuenta (por nombre) y su contacto principal, si el archivo lo incluye.
          Columnas reconocidas: nombre, tipo, origen, país, ciudad, zona, dirección, sitio web, teléfono,
          email, notas, contacto, whatsapp del contacto, email del contacto, puesto del contacto.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <UploadCloud className="h-4 w-4" />
          {uploading ? "Importando…" : "Subir archivo .csv / .xlsx / .xls"}
        </Button>

        {error && <p className="text-sm text-danger">{error}</p>}

        {result && (
          <div className="rounded-lg bg-sand-50 p-3 text-sm space-y-1">
            <p>
              {result.total} filas procesadas · <span className="text-fairway-700 font-medium">{result.created} creadas</span> ·{" "}
              <span className="text-brass-600 font-medium">{result.updated} actualizadas</span>
              {result.errors.length > 0 && <span className="text-danger font-medium"> · {result.errors.length} con error</span>}
            </p>
            {result.errors.length > 0 && (
              <ul className="text-xs text-danger/80 list-disc pl-4 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Fila {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
