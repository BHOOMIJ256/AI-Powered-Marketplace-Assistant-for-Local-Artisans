import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, city, state } = await request.json();
    if (!name || !phone || !password || !city || !state) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check if phone or email already exists
    const existingUser = await db.user.findFirst({ 
      where: { 
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ] 
      } 
    });
    
    if (existingUser) {
      if (existingUser.phone === phone) {
        return NextResponse.json({ success: false, message: "Phone number already registered" }, { status: 409 });
      }
      if (email && existingUser.email === email) {
        return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 });
      }
    }

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
    console.error("Buyer registration error:", e);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error. Please try again." 
    }, { status: 500 });
  }
}
