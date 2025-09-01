import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const buyerId = cookieStore.get("session_buyer")?.value;

    if (!buyerId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    // Verify the buyer exists and has the correct role
    const buyer = await db.user.findUnique({
      where: { id: buyerId },
      select: { id: true, name: true, role: true }
    });

    if (!buyer || buyer.role !== 'buyer') {
      return NextResponse.json({ success: false, message: "Invalid buyer account" }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Authenticated",
      buyer: { id: buyer.id, name: buyer.name }
    });

  } catch (error) {
    console.error("Buyer auth check error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
