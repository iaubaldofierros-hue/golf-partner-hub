"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email o contraseña incorrectos.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="hidden lg:flex flex-col justify-between bg-fairway-900 text-white p-10">
        <div className="flex items-center gap-2.5">
          <Flag className="h-6 w-6 text-brass-400" />
          <span className="font-display text-lg">Golf Partner Hub</span>
        </div>
        <div>
          <h1 className="font-display text-4xl leading-tight max-w-md">
            Tu día comercial, claro desde el primer tee.
          </h1>
          <p className="text-white/60 mt-3 max-w-md">
            Cuentas, promociones y seguimientos por WhatsApp, email y teléfono — en una sola vista.
          </p>
        </div>
        <p className="text-xs text-white/30">Solmar Golf Links · Uso interno</p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-2">
            <Flag className="h-5 w-5 text-fairway-800" />
            <span className="font-display text-lg text-fairway-900">Golf Partner Hub</span>
          </div>
          <div>
            <h2 className="font-display text-2xl text-fairway-900">Iniciar sesión</h2>
            <p className="text-sm text-ink/50">Accede con tu cuenta del equipo comercial.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
