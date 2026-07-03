import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Verifica que exista una sesión activa (cualquier rol). */
export async function requireSession() {
  return getServerSession(authOptions);
}
