import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const secret = (process.env.TERRAIQ_ADMIN_PASSWORD || "").trim();
  const authCookie = request.cookies.get("terraiq_auth");

  if (!(await verifyAdminSessionToken(authCookie?.value, secret))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
