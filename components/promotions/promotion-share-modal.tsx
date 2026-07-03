"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateWhatsAppLink, personalizeMessage } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

interface PromoForShare {
  id: string;
  name: string;
  promoRate?: string | number | null;
  validTo?: string | Date | null;
  bookingLink?: string | null;
  whatsappMessage?: string | null;
}

interface AccountResult {
  id: string;
  name: string;
  contacts: {
    id: string;
    firstName: string;
    lastName?: string | null;
    whatsapp?: string | null;
  }[];
}

interface ShareModalProps {
  promotion: PromoForShare;
  open: boolean;
  onClose: () => void;
}

/**
 * Flujo "enviar promo por WhatsApp":
 * 1. Buscar la cuenta/contacto
 * 2. Ver el mensaje ya personalizado ({{nombre}}, {{promo}}, {{tarifa}}…)
 * 3. Enviar → abre WhatsApp y registra la actividad con la promoción ligada
 */
export function PromotionShareModal({ promotion, open, onClose }: ShareModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AccountResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<{
    accountId: string;
    accountName: string;
    contactId: string;
    contactName: string;
    whatsapp: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [logging, setLogging] = useState(false);
  const [sent, setSent] = useState(false);

  // Búsqueda con debounce ligero
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
        setResults(data.filter((a) => a.contacts.some((c) => c.whatsapp)));
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, open]);

  const baseTemplate = useMemo(
    () =>
      promotion.whatsappMessage ||
      `Hola {{nombre}} 👋 Te comparto nuestra promoción *{{promo}}*${
        promotion.promoRate ? " con tarifa especial de {{tarifa}}" : ""
      }${promotion.validTo ? ", vigente hasta {{vigencia}}" : ""}. ¿Te reservo tee times? {{link}}`,
    [promotion]
  );

  function selectContact(account: AccountResult, contact: AccountResult["contacts"][number]) {
    if (!contact.whatsapp) return;
    const sel = {
      accountId: account.id,
      accountName: account.name,
      contactId: contact.id,
      contactName: contact.firstName,
      whatsapp: contact.whatsapp,
    };
    setSelected(sel);
    setMessage(
      personalizeMessage(baseTemplate, {
        nombre: contact.firstName,
        cuenta: account.name,
        promo: promotion.name,
        tarifa: promotion.promoRate ? `$${promotion.promoRate} USD` : "",
        vigencia: promotion.validTo ? formatDate(new Date(promotion.validTo)) : "",
        link: promotion.bookingLink ?? "",
      })
    );
  }

  async function send() {
    if (!selected) return;
    window.open(generateWhatsAppLink(selected.whatsapp, message), "_blank");
    setLogging(true);
    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selected.accountId,
          contactId: selected.contactId,
          type: "WHATSAPP_SENT",
          notes: `Promoción enviada: ${promotion.name}`,
          promotionId: promotion.id,
        }),
      });
      setSent(true);
      router.refresh();
    } finally {
      setLogging(false);
    }
  }

  function reset() {
    setSelected(null);
    setSent(false);
    setQuery("");
    setResults([]);
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Enviar: ${promotion.name}`}>
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
                .filter((c) => c.whatsapp)
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
                      <p className="text-xs text-ink/50">{account.name}</p>
                    </div>
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  </button>
                ))
            )}
            {query.length >= 2 && !searching && results.length === 0 && (
              <p className="text-sm text-ink/50">Sin contactos con WhatsApp para esa búsqueda.</p>
            )}
          </div>
        </div>
      ) : sent ? (
        <div className="space-y-4 text-center py-4">
          <p className="text-sm text-ink">
            ✅ Enviado a <strong>{selected.contactName}</strong> y registrado en la cuenta{" "}
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
            Para <strong>{selected.contactName}</strong> · {selected.accountName}
          </p>
          <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="whatsapp" onClick={send} disabled={logging}>
              {logging ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              Enviar por WhatsApp
            </Button>
            <Button variant="ghost" onClick={() => setSelected(null)}>Cambiar contacto</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
