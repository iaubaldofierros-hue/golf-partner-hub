"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { ADMIN_ENTITIES } from "@/lib/admin-entities";
import { EntityManager } from "@/components/admin/entity-manager";
import { ImportAccountsCard } from "@/components/admin/import-accounts-card";

export function AdminPanel() {
  const [active, setActive] = useState<string>("import");
  const activeConfig = ADMIN_ENTITIES.find((e) => e.key === active);

  const tabs = [{ id: "import", label: "Importar" }, ...ADMIN_ENTITIES.map((e) => ({ id: e.key, label: e.pluralLabel }))];

  return (
    <div className="space-y-4">
      <Tabs tabs={tabs} active={active} onChange={setActive} />
      {active === "import" ? <ImportAccountsCard /> : activeConfig && <EntityManager config={activeConfig} />}
    </div>
  );
}
