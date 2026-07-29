import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("terraiq_auth");

  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
