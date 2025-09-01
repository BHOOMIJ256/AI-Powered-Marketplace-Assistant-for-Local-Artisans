import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("session_user");
    const buyerSession = cookieStore.get("session_buyer");

    if (userSession) {
      // Check if it's an artisan
      const user = await db.user.findUnique({
        where: { id: userSession },
        select: { id: true, name: true, role: true }
      });

      if (user && user.role === 'artisan') {
        return NextResponse.json({ 
          authenticated: true, 
          role: 'artisan',
          user: { id: user.id, name: user.name }
        });
      }
    }

    if (buyerSession) {
      // Check if it's a buyer
      const user = await db.user.findUnique({
        where: { id: buyerSession },
        select: { id: true, name: true, role: true }
      });

      if (user && user.role === 'buyer') {
        return NextResponse.json({ 
          authenticated: true, 
          role: 'buyer',
          user: { id: user.id, name: user.name }
        });
      }
    }

    return NextResponse.json({ 
      authenticated: false, 
      role: null,
      user: null
    });

  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ 
      authenticated: false, 
      role: null,
      user: null
    }, { status: 500 });
  }
}
