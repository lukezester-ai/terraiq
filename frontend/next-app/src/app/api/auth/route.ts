import { NextResponse } from "next/server";
import { createAdminSessionToken } from "@/lib/admin-auth";

const isProduction = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  try {
    const { password, userId } = await request.json();
    const expectedPassword = (process.env.TERRAIQ_ADMIN_PASSWORD || "").trim();

    if (!expectedPassword) {
      return NextResponse.json(
        { success: false, error: "Admin password is not configured." },
        { status: 503 },
      );
    }

    if (typeof password === "string" && password === expectedPassword) {
      // Use provided userId or default to "admin"
      const adminUserId = typeof userId === "string" ? userId : "admin";
      const token = await createAdminSessionToken(expectedPassword, adminUserId, 24); // 24 hour expiry

      const response = NextResponse.json({ success: true, userId: adminUserId });
      response.cookies.set(
        "terraiq_auth",
        token,
        {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: isProduction,
          maxAge: 60 * 60 * 24, // 24 hours
        },
      );
      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
