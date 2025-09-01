import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// Minimal lookup for Indian states/cities to lat/lng
const GEO: Record<string, { lat: number; lng: number }> = {
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Rajasthan": { lat: 26.9124, lng: 75.7873 }, // Jaipur
  "Gujarat": { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
  "Maharashtra": { lat: 19.0760, lng: 72.8777 }, // Mumbai
  "Karnataka": { lat: 12.9716, lng: 77.5946 }, // Bengaluru
  "Tamil Nadu": { lat: 13.0827, lng: 80.2707 }, // Chennai
  "Kerala": { lat: 10.8505, lng: 76.2711 },
  "Telangana": { lat: 17.3850, lng: 78.4867 }, // Hyderabad
  "Andhra Pradesh": { lat: 16.5062, lng: 80.6480 }, // Vijayawada
  "Madhya Pradesh": { lat: 23.2599, lng: 77.4126 }, // Bhopal
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 }, // Lucknow
  "Bihar": { lat: 25.5941, lng: 85.1376 }, // Patna
  "West Bengal": { lat: 22.5726, lng: 88.3639 }, // Kolkata
  "Punjab": { lat: 31.1471, lng: 75.3412 },
  "Haryana": { lat: 29.0588, lng: 76.0856 },
  "Odisha": { lat: 20.2961, lng: 85.8245 }, // Bhubaneswar
};

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get("session_user")?.value;
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const start30d = new Date(now);
    start30d.setDate(now.getDate() - 29);
    start30d.setHours(0,0,0,0);

    const completed = await db.order.findMany({
      where: { artisanId: userId, status: "completed", createdAt: { gte: start30d, lte: now } },
      select: { buyerCity: true, buyerState: true }
    });

    const buckets = new Map<string, { lat: number; lng: number; count: number }>();
    for (const o of completed) {
      const key = (o.buyerCity || o.buyerState || '').trim();
      if (!key) continue;
      const geo = GEO[o.buyerCity || o.buyerState || ''] || GEO[o.buyerState || ''];
      if (!geo) continue;
      const k = `${geo.lat},${geo.lng}`;
      const prev = buckets.get(k);
      if (prev) prev.count += 1; else buckets.set(k, { ...geo, count: 1 });
    }

    return NextResponse.json({ success: true, data: Array.from(buckets.values()) });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Failed to load locations" }, { status: 500 });
  }
}
