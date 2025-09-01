import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("session_user");
    const buyerSession = cookieStore.get("session_buyer");

    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });

    // Clear both session cookies
    if (userSession) {
      response.cookies.set("session_user", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        expires: new Date(0)
      });
    }

    if (buyerSession) {
      response.cookies.set("session_buyer", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        expires: new Date(0)
      });
    }

    return response;

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.set("session_user", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
} 