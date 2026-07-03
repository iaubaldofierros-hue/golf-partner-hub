import { getServerSession } from "next-auth";
import { authOptions, ADMIN_ROLES } from "@/lib/auth";

/** Verifica que la sesión actual tenga un rol con acceso a Modo Admin. */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!role || !ADMIN_ROLES.includes(role)) return null;
  return session;
}
