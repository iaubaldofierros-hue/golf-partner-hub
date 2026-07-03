"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";

interface AccountTabsProps {
  counts: { contacts: number; activities: number; opportunities: number };
  contacts: React.ReactNode;
  activities: React.ReactNode;
  opportunities: React.ReactNode;
  notes: React.ReactNode;
  files: React.ReactNode;
}

/** Pestañas simples de la ficha ejecutiva — sin saturar la pantalla */
export function AccountTabs({ counts, contacts, activities, opportunities, notes, files }: AccountTabsProps) {
  const [active, setActive] = useState("activities");
  const tabs = [
    { id: "activities", label: "Actividades", count: counts.activities },
    { id: "contacts", label: "Contactos", count: counts.contacts },
    { id: "opportunities", label: "Oportunidades", count: counts.opportunities },
    { id: "files", label: "Archivos" },
    { id: "notes", label: "Notas" },
  ];
  return (
    <div className="space-y-4">
      <Tabs tabs={tabs} active={active} onChange={setActive} />
      <div className="pt-1">
        {active === "activities" && activities}
        {active === "contacts" && contacts}
        {active === "opportunities" && opportunities}
        {active === "files" && files}
        {active === "notes" && notes}
      </div>
    </div>
  );
}
