import { Construction } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function Page() {
  return (
    <div className="max-w-3xl">
      <EmptyState
        icon={Construction}
        title="Módulo en la siguiente fase"
        description="Esta sección está en el roadmap (ver README, fases 6–10). La estructura de datos ya existe en Prisma."
      />
    </div>
  );
}
