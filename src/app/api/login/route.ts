import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();
    
    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    // Clean the identifier (trim, lowercase email, strip non-digits for phone)
    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes('@');
    const searchField = isEmail ? cleanIdentifier.toLowerCase() : cleanIdentifier.replace(/\D/g, '');

    let user;
    
    if (isEmail) {
      // Search by email only
      user = await db.user.findFirst({
        where: { email: searchField }
      });
    } else {
      // Search by phone only
      user = await db.user.findFirst({
        where: { phone: searchField }
      });
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Check if user is a seller/artisan
    if (user.role !== 'artisan') {
      return NextResponse.json({ success: false, message: "This login is for sellers/artisans only. Please use buyer login for buyer accounts." }, { status: 403 });
    }

    // Create session cookie for seller
    const response = NextResponse.json({ 
      success: true, 
      message: "Login successful",
      redirectTo: "/dashboard"
    });

    // Set session cookie for seller
    response.cookies.set("session_user", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
} 