import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) redirect("/login");

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } }
  });

  if (!order || order.artisanId !== userId) redirect("/dashboard/orders");

  const total = order.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Order #{order.id.slice(0,6)}</h1>
        <div className="border rounded-md p-4 space-y-2">
          <p>Status: <span className="font-medium">{order.status}</span></p>
          <p>Buyer location: {order.buyerCity || "Unknown"}, {order.buyerState || ""}</p>
          <p>Address: {order.address}</p>
          <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="border rounded-md">
          <div className="p-3 font-medium">Items</div>
          <div className="divide-y">
            {order.items.map(it => (
              <div key={it.id} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <p>{it.product.name}</p>
                  <p className="text-xs text-gray-500">₹{(it.unitPrice/100).toFixed(2)} × {it.quantity}</p>
                </div>
                <div className="font-medium">₹{((it.unitPrice*it.quantity)/100).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="p-3 flex items-center justify-between font-medium">
            <span>Total</span>
            <span>₹{(total/100).toFixed(2)}</span>
          </div>
        </div>

        <form action={`/api/orders/${order.id}/complete`} method="post">
          <button className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">Mark as Completed</button>
        </form>
      </div>
    </div>
  );
}
