import { NextResponse } from "next/server";
import { createAdminSessionToken } from "@/lib/admin-auth";

const isProduction = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = (process.env.TERRAIQ_ADMIN_PASSWORD || "").trim();

    if (!expectedPassword) {
      return NextResponse.json(
        { success: false, error: "Admin password is not configured." },
        { status: 503 },
      );
    }

    if (typeof password === "string" && password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set(
        "terraiq_auth",
        await createAdminSessionToken(expectedPassword),
        {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 60 * 60 * 8,
        },
      );
      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
