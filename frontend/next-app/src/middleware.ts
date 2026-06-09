import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="TerraIQ Admin", charset="UTF-8"',
    },
  });
}

function isAuthorized(request: NextRequest): boolean {
  const expectedUser = process.env.TERRAIQ_ADMIN_USER?.trim() || "admin";
  const expectedPassword = process.env.TERRAIQ_ADMIN_PASSWORD?.trim();

  if (!expectedPassword) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;

    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    return user === expectedUser && password === expectedPassword;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
