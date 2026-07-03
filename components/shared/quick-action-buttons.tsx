"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickActivityForm } from "@/components/activities/quick-activity-form";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface QuickActionButtonsProps {
  accountId: string;
  contactId?: string;
  whatsapp?: string | null;
  email?: string | null;
  phone?: string | null;
  /** Mensaje pre-cargado para WhatsApp (ej. copy de promoción personalizado) */
  whatsappMessage?: string;
  size?: "sm" | "default";
  showLabels?: boolean;
}

/**
 * Los tres canales del operador siempre visibles.
 * Cada acción abre el canal y de inmediato el registro rápido (regla de 3 clics).
 */
export function QuickActionButtons({
  accountId, contactId, whatsapp, email, phone,
  whatsappMessage = "", size = "sm", showLabels = false,
}: QuickActionButtonsProps) {
  const [modal, setModal] = useState<null | "WHATSAPP_SENT" | "EMAIL_SENT" | "CALL_MADE">(null);

  function openWhatsApp() {
    if (!whatsapp) return;
    window.open(generateWhatsAppLink(whatsapp, whatsappMessage), "_blank");
    setModal("WHATSAPP_SENT");
  }

  function openEmail() {
    if (!email) return;
    window.location.href = `mailto:${email}`;
    setModal("EMAIL_SENT");
  }

  function openCall() {
    if (!phone && !whatsapp) return;
    window.location.href = `tel:${phone ?? whatsapp}`;
    setModal("CALL_MADE");
  }

  return (
    <>
      <div className="flex gap-1.5">
        <Button size={size} variant="whatsapp" onClick={openWhatsApp} disabled={!whatsapp} title="Enviar WhatsApp">
          <MessageCircle className="h-4 w-4" />
          {showLabels && "WhatsApp"}
        </Button>
        <Button size={size} variant="outline" onClick={openEmail} disabled={!email} title="Enviar email">
          <Mail className="h-4 w-4" />
          {showLabels && "Email"}
        </Button>
        <Button size={size} variant="outline" onClick={openCall} disabled={!phone && !whatsapp} title="Llamar ahora">
          <Phone className="h-4 w-4" />
          {showLabels && "Llamar"}
        </Button>
      </div>

      {modal && (
        <QuickActivityForm
          accountId={accountId}
          contactId={contactId}
          defaultType={modal}
          open
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
