"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Búsqueda rápida global: cuenta, contacto, hotel, agencia, ciudad */
export function Topbar() {
  const router = useRouter();

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (q) router.push(`/accounts?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 sm:px-6 bg-sand-50/90 backdrop-blur border-b border-ink/5">
      <Flag className="h-5 w-5 text-fairway-800 lg:hidden" />
      <form onSubmit={onSearch} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
        <input
          name="q"
          placeholder="Buscar cuenta, contacto, hotel, agencia o ciudad…"
          className="h-10 w-full rounded-full border border-ink/10 bg-white pl-9 pr-4 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-fairway-500"
        />
      </form>
      <div className="ml-auto">
        <Link href="/accounts/new">
          <Button variant="brass" size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva cuenta</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
