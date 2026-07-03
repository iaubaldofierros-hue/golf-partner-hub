import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/accounts/account-form";

export const dynamic = "force-dynamic";

export default async function NewAccountPage() {
  const [accountTypes, businessOrigins] = await Promise.all([
    prisma.accountType.findMany({ orderBy: { name: "asc" } }),
    prisma.businessOrigin.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-fairway-900">Nueva cuenta rápida</h1>
        <p className="text-sm text-ink/50">Captura lo esencial; lo demás puede agregarse después.</p>
      </div>
      <AccountForm accountTypes={accountTypes} businessOrigins={businessOrigins} />
    </div>
  );
}
