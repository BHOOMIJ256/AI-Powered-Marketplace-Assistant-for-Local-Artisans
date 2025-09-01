import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOrderCompletionSMS } from "@/lib/sms";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // Get the order with buyer and artisan details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { 
        buyer: { select: { phone: true } },
        artisan: { select: { id: true } }
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Update order status to completed
    await db.order.update({
      where: { id: orderId },
      data: { status: "completed" }
    });

    // Send SMS notification to buyer
    if (order.buyer.phone) {
      try {
        const smsSent = await sendOrderCompletionSMS(order.buyer.phone, orderId);
        
        if (smsSent) {
          console.log(`[SMS] Order completion notification sent successfully to buyer ${order.buyer.phone}`);
        } else {
          console.warn(`[SMS] Failed to send order completion notification to buyer ${order.buyer.phone}`);
        }
      } catch (smsError) {
        console.error('[SMS] Error sending order completion notification:', smsError);
        // Don't fail the completion if SMS fails
      }
    } else {
      console.warn(`[SMS] No phone number found for buyer of order ${orderId}`);
    }

    return NextResponse.json({ success: true, message: "Order marked as completed" });
  } catch (error) {
    console.error("Error completing order:", error);
    return NextResponse.json({ success: false, message: "Failed to complete order" }, { status: 500 });
  }
}
