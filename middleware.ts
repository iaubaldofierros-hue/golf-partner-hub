import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Solo /admin y /api/admin quedan protegidos por middleware por ahora.
 * El resto del CRM no tiene un guard global — está fuera del alcance de este cambio.
 */
const ADMIN_ROLES = ["ADMIN", "SALES_DIRECTOR"];

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as { role?: string } | null)?.role;
    if (!role || !ADMIN_ROLES.includes(role)) {
      if (req.nextUrl.pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
