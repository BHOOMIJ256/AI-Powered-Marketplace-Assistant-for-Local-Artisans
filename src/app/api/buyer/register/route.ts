import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, city, state } = await request.json();
    if (!name || !phone || !password || !city || !state) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const exists = await db.user.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] } });
    if (exists) return NextResponse.json({ success: false, message: "User already exists" }, { status: 409 });

    const hashed = await hashPassword(password);

    const created = await db.user.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashed,
        city,
        state,
        role: "buyer",
      },
      select: { id: true, name: true, role: true }
    });

    const res = NextResponse.json({ success: true, data: created });
    res.cookies.set("session_buyer", created.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
