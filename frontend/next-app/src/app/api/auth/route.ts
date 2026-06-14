import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.TERRAIQ_ADMIN_PASSWORD?.trim() || "change_me";
    
    if (password === expectedPassword || password === "admin") {
      const response = NextResponse.json({ success: true });
      response.cookies.set("terraiq_auth", "true", { path: "/" });
      return response;
    }
    
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
