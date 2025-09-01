import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { artisan: { select: { id: true, name: true, city: true, state: true } } }
    });
    return NextResponse.json({ success: true, data: products });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get("session_user")?.value;
    if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const { name, description, price, stock, imageUrl } = await req.json();
    if (!name || typeof price !== "number" || typeof stock !== "number") {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const created = await db.product.create({
      data: { name, description: description || null, price, stock, imageUrl: imageUrl || null, artisanId: userId }
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }
}
