import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get user data and verify they are an artisan
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'artisan') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get date range for analysis (last 6 months)
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0);

    // Get all completed orders for this artisan
    const orders = await db.order.findMany({
      where: { 
        artisanId: userId, 
        status: "completed",
        createdAt: { gte: startDate }
      },
      include: {
        buyer: { select: { name: true, city: true, state: true } },
        items: { 
          include: { 
            product: { 
              select: { 
                name: true, 
                price: true, 
                description: true 
              } 
            } 
          } 
        }
      }
    });

    if (orders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        insights: {
          topRegions: [],
          topProducts: [],
          buyerPreferences: {
            priceRange: { min: 0, max: 0, avg: 0 },
            popularCategories: [],
            seasonalTrends: []
          },
          totalCustomers: 0,
          repeatCustomers: 0,
          averageOrderValue: 0
        }
      });
    }

    // Calculate top regions
    const regionStats = new Map<string, { orders: number; sales: number }>();
    orders.forEach(order => {
      const region = `${order.buyerCity || order.buyer?.city || 'Unknown'}, ${order.buyerState || order.buyer?.state || ''}`;
      const orderTotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      
      const existing = regionStats.get(region);
      if (existing) {
        existing.orders += 1;
        existing.sales += orderTotal;
      } else {
        regionStats.set(region, { orders: 1, sales: orderTotal });
      }
    });

    const topRegions = Array.from(regionStats.entries())
      .map(([region, stats]) => ({ region, ...stats }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Calculate top products
    const productStats = new Map<string, { name: string; sales: number; orders: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const productName = item.product.name;
        const itemTotal = item.unitPrice * item.quantity;
        
        const existing = productStats.get(productName);
        if (existing) {
          existing.sales += itemTotal;
          existing.orders += item.quantity;
        } else {
          productStats.set(productName, { 
            name: productName, 
            sales: itemTotal, 
            orders: item.quantity 
          });
        }
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Calculate buyer preferences
    const allPrices: number[] = [];
    const categoryStats = new Map<string, number>();
    const monthlyStats = new Map<string, number>();

    orders.forEach(order => {
      const orderTotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      allPrices.push(orderTotal);

      // Categorize products (simple categorization based on keywords)
      order.items.forEach(item => {
        const name = item.product.name.toLowerCase();
        let category = 'Other';
        
        if (name.includes('diya') || name.includes('candle') || name.includes('lamp')) {
          category = 'Home Decor';
        } else if (name.includes('scarf') || name.includes('shirt') || name.includes('dress') || name.includes('fabric')) {
          category = 'Textiles';
        } else if (name.includes('pot') || name.includes('planter') || name.includes('vase')) {
          category = 'Kitchenware';
        } else if (name.includes('ring') || name.includes('necklace') || name.includes('earring')) {
          category = 'Jewelry';
        } else if (name.includes('basket') || name.includes('rug') || name.includes('mat')) {
          category = 'Home Decor';
        }

        const existing = categoryStats.get(category);
        categoryStats.set(category, (existing || 0) + item.quantity);
      });

      // Monthly trends
      const month = order.createdAt.toLocaleString('en-US', { month: 'short' });
      const existing = monthlyStats.get(month);
      monthlyStats.set(month, (existing || 0) + 1);
    });

    const priceRange = {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices),
      avg: Math.round(allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length)
    };

    const popularCategories = Array.from(categoryStats.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const seasonalTrends = Array.from(monthlyStats.entries())
      .map(([month, orders]) => ({ month, orders }))
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    // Calculate customer metrics
    const uniqueCustomers = new Set(orders.map(order => order.buyerId));
    const totalCustomers = uniqueCustomers.size;

    // Count repeat customers (customers with more than 1 order)
    const customerOrderCounts = new Map<string, number>();
    orders.forEach(order => {
      const existing = customerOrderCounts.get(order.buyerId);
      customerOrderCounts.set(order.buyerId, (existing || 0) + 1);
    });
    const repeatCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;

    const averageOrderValue = Math.round(
      orders.reduce((sum, order) => {
        const orderTotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        return sum + orderTotal;
      }, 0) / orders.length
    );

    const insights = {
      topRegions,
      topProducts,
      buyerPreferences: {
        priceRange,
        popularCategories,
        seasonalTrends
      },
      totalCustomers,
      repeatCustomers,
      averageOrderValue
    };

    return NextResponse.json({ success: true, insights });

  } catch (error) {
    console.error('Error generating customer insights:', error);
    return NextResponse.json(
      { success: false, message: "Failed to generate insights" }, 
      { status: 500 }
    );
  }
}
