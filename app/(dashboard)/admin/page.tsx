import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminPanel } from "@/components/admin/admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-brass-600" />
        <div>
          <h1 className="font-display text-2xl text-fairway-900">Administración</h1>
          <p className="text-sm text-ink/50">Edita o elimina cualquier registro del sistema. Los cambios son inmediatos.</p>
        </div>
      </div>
      <AdminPanel />
    </div>
  );
}
