import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function OrdersListPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) redirect("/login");

  const orders = await db.order.findMany({
    where: { artisanId: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, status: true, totalAmount: true, buyerCity: true, buyerState: true, createdAt: true }
  });

  return (
    <div className="min-h-screen p-6 bg-amber-100">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold text-amber-800">Orders</h1>
        <div className="border rounded-md divide-y border-amber-800">
          {orders.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No orders yet.</div>
          )}
          {orders.map(o => (
            <div key={o.id} className="p-4 flex items-center justify-between">
              <div>
                <p>#{o.id.slice(0,6)} · ₹{(o.totalAmount/100).toFixed(2)} · {o.status}</p>
                <p className="text-xs text-gray-500">{o.buyerCity || "Unknown"}, {o.buyerState || ""} · {new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <Link href={`/dashboard/orders/${o.id}`} className="text-xs underline">View</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 