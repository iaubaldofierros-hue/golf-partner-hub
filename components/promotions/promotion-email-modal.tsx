"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Search, Loader2, Paperclip } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface PromoForEmail {
  id: string;
  name: string;
  promoRate?: string | number | null;
  validTo?: string | Date | null;
  bookingLink?: string | null;
  benefits?: string | null;
}

interface PromoFile {
  id: string;
  name: string;
}

interface AccountResult {
  id: string;
  name: string;
  contacts: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email?: string | null;
  }[];
}

interface EmailModalProps {
  promotion: PromoForEmail;
  open: boolean;
  onClose: () => void;
}

/**
 * Flujo "enviar promo por email, con adjunto real":
 * buscar contacto → componer asunto/cuerpo → elegir archivo adjunto (opcional) → enviar vía Resend.
 */
export function PromotionEmailModal({ promotion, open, onClose }: EmailModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AccountResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<{
    accountId: string;
    accountName: string;
    contactId: string;
    contactName: string;
    email: string;
  } | null>(null);
  const [subject, setSubject] = useState(`Promoción: ${promotion.name}`);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<PromoFile[]>([]);
  const [fileId, setFileId] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/files?promotionId=${promotion.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFiles)
      .catch(() => setFiles([]));
  }, [open, promotion.id]);

  useEffect(() => {
    if (!open || query.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/accounts?q=${encodeURIComponent(query)}`);
        const data: AccountResult[] = await res.json();
        setResults(data.filter((a) => a.contacts.some((c) => c.email)));
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, open]);

  const defaultBody = useMemo(() => {
    const lines = [`Hola {{nombre}},`, "", `Te comparto nuestra promoción ${promotion.name}.`];
    if (promotion.promoRate) lines.push(`Tarifa especial: $${promotion.promoRate} USD.`);
    if (promotion.validTo) lines.push(`Vigente hasta ${formatDate(new Date(promotion.validTo))}.`);
    if (promotion.benefits) lines.push("", promotion.benefits);
    if (promotion.bookingLink) lines.push("", `Reserva aquí: ${promotion.bookingLink}`);
    return lines.join("\n");
  }, [promotion]);

  function selectContact(account: AccountResult, contact: AccountResult["contacts"][number]) {
    if (!contact.email) return;
    setSelected({
      accountId: account.id,
      accountName: account.name,
      contactId: contact.id,
      contactName: contact.firstName,
      email: contact.email,
    });
    setBody(defaultBody.replace(/\{\{nombre\}\}/g, contact.firstName));
  }

  async function send() {
    if (!selected) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/promotions/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promotionId: promotion.id,
        accountId: selected.accountId,
        contactId: selected.contactId,
        to: selected.email,
        subject,
        html: body.replace(/\n/g, "<br/>"),
        fileId: fileId || undefined,
      }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      router.refresh();
    } else {
      const b = await res.json().catch(() => null);
      setError(b?.error ?? "No se pudo enviar el correo.");
    }
  }

  function reset() {
    setSelected(null);
    setSent(false);
    setQuery("");
    setResults([]);
    setFileId("");
    setError(null);
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Enviar por email: ${promotion.name}`}>
      {!selected ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/40" />
            <Input
              autoFocus
              className="pl-9"
              placeholder="Busca cuenta o contacto…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {searching && (
            <p className="flex items-center gap-2 text-sm text-ink/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
            </p>
          )}
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {results.map((account) =>
              account.contacts
                .filter((c) => c.email)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectContact(account, c)}
                    className="flex w-full items-center justify-between rounded-lg border border-ink/10 p-3 text-left hover:border-fairway-500 hover:bg-fairway-500/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {c.firstName} {c.lastName ?? ""}
                      </p>
                      <p className="text-xs text-ink/50">{account.name} · {c.email}</p>
                    </div>
                    <Mail className="h-4 w-4 text-fairway-700" />
                  </button>
                ))
            )}
            {query.length >= 2 && !searching && results.length === 0 && (
              <p className="text-sm text-ink/50">Sin contactos con email para esa búsqueda.</p>
            )}
          </div>
        </div>
      ) : sent ? (
        <div className="space-y-4 text-center py-4">
          <p className="text-sm text-ink">
            ✅ Enviado a <strong>{selected.contactName}</strong> ({selected.email}) y registrado en la cuenta{" "}
            <strong>{selected.accountName}</strong>.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>Enviar a otro contacto</Button>
            <Button onClick={onClose}>Listo</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink/70">
            Para <strong>{selected.contactName}</strong> · {selected.email}
          </p>
          <div className="space-y-1.5">
            <Label>Asunto</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cuerpo del correo</Label>
            <Textarea rows={7} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          {files.length > 0 && (
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink/40" />
              <Select value={fileId} onChange={(e) => setFileId(e.target.value)} className="text-xs h-8">
                <option value="">Sin adjunto</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={send} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Enviar por email
            </Button>
            <Button variant="ghost" onClick={() => setSelected(null)}>Cambiar contacto</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
