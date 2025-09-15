import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

type PricingSuggestion = {
  productId: string;
  name: string;
  currentPrice: number;
  avgPaid: number;
  minPaid: number;
  maxPaid: number;
  unitsSold: number;
  revenue: number;
  demandTrend: "rising" | "falling" | "stable";
  suggestedPrice: number;
  rationale: string;
};

type SeasonalPoint = { month: string; orders: number };

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user || user.role !== "artisan") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Time window: last 12 months
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 12);
    startDate.setHours(0, 0, 0, 0);

    // Fetch products and completed orders with items
    const [products, orders] = await Promise.all([
      db.product.findMany({ where: { artisanId: userId }, select: { id: true, name: true, price: true } }),
      db.order.findMany({
        where: { artisanId: userId, status: "completed", createdAt: { gte: startDate } },
        include: { items: true },
      }),
    ]);

    // Seasonal demand across months (orders count)
    const monthlyOrders = new Map<string, number>();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    for (const order of orders) {
      const m = monthNames[order.createdAt.getMonth()];
      monthlyOrders.set(m, (monthlyOrders.get(m) || 0) + 1);
    }
    const seasonalDemand: SeasonalPoint[] = monthNames.map((m) => ({ month: m, orders: monthlyOrders.get(m) || 0 }));

    // Build per-product stats from order items
    const productIdToStats = new Map<string, {
      name: string;
      currentPrice: number;
      prices: number[]; // unit prices paid
      unitsSold: number;
      revenue: number;
      last30Units: number;
      last90Units: number;
    }>();

    const nowMs = now.getTime();
    const daysToMs = (d: number) => d * 24 * 60 * 60 * 1000;

    for (const order of orders) {
      for (const item of order.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) continue;

        const stats = productIdToStats.get(prod.id) || {
          name: prod.name,
          currentPrice: Number(prod.price || 0),
          prices: [],
          unitsSold: 0,
          revenue: 0,
          last30Units: 0,
          last90Units: 0,
        };

        const paid = Number(item.unitPrice || prod.price || 0);
        stats.prices.push(...Array(item.quantity).fill(paid));
        stats.unitsSold += item.quantity;
        stats.revenue += paid * item.quantity;

        const ageMs = nowMs - order.createdAt.getTime();
        if (ageMs <= daysToMs(30)) stats.last30Units += item.quantity;
        if (ageMs <= daysToMs(90)) stats.last90Units += item.quantity;

        productIdToStats.set(prod.id, stats);
      }
    }

    const pricing: PricingSuggestion[] = [];
    for (const prod of products) {
      const stats = productIdToStats.get(prod.id) || {
        name: prod.name,
        currentPrice: Number(prod.price || 0),
        prices: [],
        unitsSold: 0,
        revenue: 0,
        last30Units: 0,
        last90Units: 0,
      };

      const minPaid = stats.prices.length ? Math.min(...stats.prices) : Number(prod.price || 0);
      const maxPaid = stats.prices.length ? Math.max(...stats.prices) : Number(prod.price || 0);
      const avgPaid = stats.prices.length
        ? Math.round((stats.prices.reduce((s, p) => s + p, 0) / stats.prices.length) * 100) / 100
        : Number(prod.price || 0);

      // Simple demand trend: compare last 30-day run rate vs last 90-day run rate
      const last30Rate = stats.last30Units / 30;
      const last90Rate = stats.last90Units / 90;
      let demandTrend: "rising" | "falling" | "stable" = "stable";
      if (last30Rate > last90Rate * 1.2 && stats.last30Units >= 3) demandTrend = "rising";
      else if (last30Rate < last90Rate * 0.8 && stats.last90Units >= 3) demandTrend = "falling";

      // Suggestion heuristic:
      // - Base around avgPaid
      // - If rising demand: +5% to +10% cap to max(avgPaid*1.1, current)
      // - If falling demand: -5% to -10% floor to min(avgPaid*0.9)
      // - Otherwise: keep near avgPaid blended with current
      let suggested = avgPaid;
      let rationale = "Based on average realized price.";
      if (demandTrend === "rising") {
        suggested = Math.max(avgPaid * 1.05, stats.currentPrice);
        suggested = Math.min(suggested, avgPaid * 1.1);
        rationale = "Demand rising in last 30 days vs 90; slight increase recommended.";
      } else if (demandTrend === "falling") {
        suggested = Math.min(avgPaid * 0.95, stats.currentPrice);
        suggested = Math.max(suggested, avgPaid * 0.9);
        rationale = "Demand softening; a small discount can improve conversion.";
      } else {
        suggested = (avgPaid * 0.6) + (stats.currentPrice * 0.4);
        rationale = "Stable demand; align price closer to realized average.";
      }

      suggested = Math.round(suggested * 100) / 100;

      pricing.push({
        productId: prod.id,
        name: stats.name,
        currentPrice: Number(prod.price || 0),
        avgPaid,
        minPaid,
        maxPaid,
        unitsSold: stats.unitsSold,
        revenue: Math.round(stats.revenue * 100) / 100,
        demandTrend,
        suggestedPrice: suggested,
        rationale,
      });
    }

    // Sort by highest revenue first
    pricing.sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({ success: true, pricing, seasonalDemand });
  } catch (error) {
    console.error("Error generating pricing/trends:", error);
    return NextResponse.json({ success: false, message: "Failed to generate pricing/trends" }, { status: 500 });
  }
}


