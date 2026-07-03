"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun, Building2, Users, Tag, Target, BarChart3, Settings, Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Menú simple (Modo Operador): solo lo necesario para el trabajo diario.
 * Reportes y Configuración quedan al final (Modo Admin).
 */
const NAV = [
  { href: "/dashboard", label: "Mi Día", icon: Sun },
  { href: "/accounts", label: "Cuentas", icon: Building2 },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/promotions", label: "Promociones", icon: Tag },
  { href: "/opportunities", label: "Oportunidades", icon: Target },
  { href: "/reports", label: "Reportes", icon: BarChart3, admin: true },
  { href: "/settings", label: "Configuración", icon: Settings, admin: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col bg-fairway-900 text-white">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
          <Flag className="h-5 w-5 text-brass-400" />
          <div className="leading-tight">
            <p className="font-display text-[15px]">Golf Partner Hub</p>
            <p className="text-[11px] text-white/50">CRM Comercial</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, admin }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive(href)
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5",
                admin && "opacity-90"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
        <p className="px-5 py-4 text-[11px] text-white/30">Solmar Golf Links · v0.1</p>
      </aside>

      {/* Navegación inferior móvil — para visitas comerciales en campo */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around bg-fairway-900 text-white/60 py-1.5 pb-[env(safe-area-inset-bottom)]">
        {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
              isActive(href) && "text-brass-400"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
