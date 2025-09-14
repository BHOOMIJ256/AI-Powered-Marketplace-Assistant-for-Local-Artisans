import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sendOrderNotification } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const buyerId = (await cookieStore).get("session_buyer")?.value;
    if (!buyerId) return NextResponse.json({ success: false, message: "Not authenticated as buyer" }, { status: 401 });

    const body = await req.json();
    
    // Debug logging - let's see what we're receiving
    console.log("=== ORDER REQUEST DEBUG ===");
    console.log("Raw body:", JSON.stringify(body, null, 2));
    console.log("Body type:", typeof body);
    console.log("Body keys:", Object.keys(body || {}));
    
    const items: { productId: string; quantity: number }[] = body.items || [];
    const address: string = body.address || "";

    console.log("Parsed items:", items);
    console.log("Items length:", items.length);
    console.log("Parsed address:", address);
    console.log("Address length:", address.length);
    console.log("=== END DEBUG ===");

    if (!items.length || !address) {
      console.log("Validation failed:");
      console.log("- Items empty:", !items.length);
      console.log("- Address empty:", !address);
      return NextResponse.json({ 
        success: false, 
        message: "Missing items or address",
        debug: {
          itemsLength: items.length,
          addressLength: address.length,
          receivedBody: body
        }
      }, { status: 400 });
    }

    const buyer = await db.user.findUnique({ where: { id: buyerId }, select: { city: true, state: true } });

    // Load products and group by artisan
    const productIds = items.map(i => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } }, include: { artisan: true } });
    if (products.length !== productIds.length) return NextResponse.json({ success: false, message: "Invalid products" }, { status: 400 });

    const artisanId = products[0].artisanId;
    if (!products.every(p => p.artisanId === artisanId)) {
      return NextResponse.json({ success: false, message: "All items must be from the same artisan for this MVP" }, { status: 400 });
    }

    let totalAmount = 0;
    for (const it of items) {
      const p = products.find(pp => pp.id === it.productId)!;
      if (p.stock < it.quantity) return NextResponse.json({ success: false, message: `Insufficient stock for ${p.name}` }, { status: 400 });
      totalAmount += p.price * it.quantity;
    }

    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          buyerId,
          artisanId,
          status: "pending",
          totalAmount,
          address,
          buyerCity: buyer?.city || null,
          buyerState: buyer?.state || null,
          items: {
            create: items.map(it => {
              const p = products.find(pp => pp.id === it.productId)!;
              return { productId: p.id, quantity: it.quantity, unitPrice: p.price };
            })
          }
        },
        include: { items: true, artisan: true }
      });

      for (const it of items) {
        await tx.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
      }

      return createdOrder;
    });

    // Send SMS notification to artisan
    if (order.artisan.phone) {
      const buyerLocation = buyer?.city && buyer?.state ? `${buyer.city}, ${buyer.state}` : undefined;
      
      try {
        const smsSent = await sendOrderNotification(
          order.artisan.phone, 
          order.id, 
          order.totalAmount, 
          buyerLocation
        );
        
        if (smsSent) {
          console.log(`[SMS] Order notification sent successfully to artisan ${order.artisan.phone}`);
        } else {
          console.warn(`[SMS] Failed to send order notification to artisan ${order.artisan.phone}`);
        }
      } catch (smsError) {
        console.error('[SMS] Error sending order notification:', smsError);
        // Don't fail the order if SMS fails
      }
    } else {
      console.warn(`[SMS] No phone number found for artisan ${order.artisan.id}`);
    }

    return NextResponse.json({ success: true, data: { orderId: order.id } });
  } catch (e) {
    console.error("Order creation error:", e);
    return NextResponse.json({ success: false, message: "Failed to place order" }, { status: 500 });
  }
}