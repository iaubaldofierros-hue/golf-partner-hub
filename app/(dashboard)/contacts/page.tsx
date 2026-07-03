import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { QuickActionButtons } from "@/components/shared/quick-action-buttons";
import { EmptyState } from "@/components/shared/empty-state";
import { CHANNEL_LABELS } from "@/lib/labels";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const where: Prisma.ContactWhereInput = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { whatsapp: { contains: q } },
          { account: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const contacts = await prisma.contact.findMany({
    where,
    include: { account: { include: { accountType: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-fairway-900">Contactos</h1>
        <p className="text-sm text-ink/50">{contacts.length} resultados</p>
      </div>

      {/* Búsqueda global (server-side, sin JS extra) */}
      <form className="max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, cuenta, email o WhatsApp…"
          className="h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-500"
        />
      </form>

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin contactos"
          description="Los contactos se crean desde la ficha de cada cuenta o al dar de alta una cuenta nueva."
        />
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="hidden md:block overflow-hidden rounded-card border border-ink/10 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 text-left text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Cuenta</th>
                  <th className="px-4 py-3">Canal preferido</th>
                  <th className="px-4 py-3">Último contacto</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {contacts.map((c: (typeof contacts)[number]) => (
                  <tr key={c.id} className="hover:bg-sand-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {c.firstName} {c.lastName ?? ""}
                      </p>
                      {c.position && <p className="text-xs text-ink/50">{c.position}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/accounts/${c.accountId}`} className="text-fairway-700 hover:underline">
                        {c.account.name}
                      </Link>
                      <p className="text-xs text-ink/50">{c.account.accountType.name}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {CHANNEL_LABELS[c.preferredChannel] ?? c.preferredChannel}
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {c.lastContactDate ? timeAgo(c.lastContactDate) : "Nunca"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <QuickActionButtons
                          accountId={c.accountId}
                          contactId={c.id}
                          whatsapp={c.whatsapp}
                          email={c.email}
                          phone={c.phone}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas móvil */}
          <div className="grid gap-3 md:hidden">
            {contacts.map((c: (typeof contacts)[number]) => (
              <div key={c.id} className="rounded-card border border-ink/10 bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">
                      {c.firstName} {c.lastName ?? ""}
                    </p>
                    <Link href={`/accounts/${c.accountId}`} className="text-xs text-fairway-700">
                      {c.account.name}
                    </Link>
                  </div>
                  <span className="text-xs text-ink/50">
                    {c.lastContactDate ? timeAgo(c.lastContactDate) : "Sin contacto"}
                  </span>
                </div>
                <div className="mt-3">
                  <QuickActionButtons
                    accountId={c.accountId}
                    contactId={c.id}
                    whatsapp={c.whatsapp}
                    email={c.email}
                    phone={c.phone}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
