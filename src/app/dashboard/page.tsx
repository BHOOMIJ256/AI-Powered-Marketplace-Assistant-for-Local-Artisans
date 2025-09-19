import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import TranslatedText from "@/components/TranslatedText";
import MapView from "./MapView";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  const buyerSession = cookieStore.get("session_buyer");

  if (buyerSession) redirect("/buyer");
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!user || user.role !== "artisan") {
    redirect("/login");
  }

  const [totalSales, pendingOrders, completedOrders, recentOrders] =
    await Promise.all([
      db.order.aggregate({
        where: { artisanId: userId, status: "completed" },
        _sum: { totalAmount: true },
      }),
      db.order.count({ where: { artisanId: userId, status: "pending" } }),
      db.order.count({ where: { artisanId: userId, status: "completed" } }),
      db.order.findMany({
        where: { artisanId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          buyer: { select: { name: true, city: true, state: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
    ]);

  const salesAmount = totalSales._sum.totalAmount || 0;

  const navbarAmber = "#8b4513";
  const beige = "#FAF3E0";

  return (
    <div className="min-h-screen space-y-8">
      {/* Welcome Header */}
      <div
        className="rounded-lg p-8 shadow-md"
        style={{
          backgroundColor: beige,
          borderLeft: `6px solid ${navbarAmber}`,
        }}
      >
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "Cinzel, serif", color: "#8b4513" }}
        >
          Welcome {user.name}!
        </h1>
        <p className="text-[#4a2c21] text-lg">
          Your craft business dashboard - where tradition meets commerce
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: <TranslatedText translationKey="totalSales" />,
            value: `₹${(salesAmount / 100).toFixed(2)}`,
            note: "Total Revenue Earned",
          },
          {
            label: <TranslatedText translationKey="pendingOrders" />,
            value: pendingOrders,
            note: "Orders to Process",
          },
          {
            label: <TranslatedText translationKey="completedOrders" />,
            value: completedOrders,
            note: "Successfully Delivered",
          },
          {
            label: <TranslatedText translationKey="totalOrders" />,
            value: pendingOrders + completedOrders,
            note: "Total Business Volume",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-lg p-6 shadow-md hover:shadow-lg transition transform hover:scale-[1.02]"
            style={{
              backgroundColor: beige,
              borderLeft: `6px solid ${navbarAmber}`,
            }}
          >
            <div className="text-2xl font-bold mb-2" style={{ color: navbarAmber }}>
              {card.value}
            </div>
            <h3
              className="text-sm font-bold uppercase tracking-wide mb-1"
              style={{ fontFamily: "Cinzel, serif", color: "8b4513" }}
            >
              {card.label}
            </h3>
            <p className="text-sm text-[#4a2c21]">{card.note}</p>
          </div>
        ))}
      </div>

      {/* Business Actions */}
      <div
        className="rounded-lg p-8 shadow-md"
        style={{
          backgroundColor: beige,
          borderLeft: `6px solid ${navbarAmber}`,
        }}
      >
        <h2
          className="text-xl font-bold mb-6"
          style={{ fontFamily: "Cinzel, serif", color: "8b4513" }}
        >
          Business Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/products"
            className="px-6 py-3 rounded-md font-semibold border transition-all"
            style={{
              backgroundColor: beige,
              borderColor: navbarAmber,
              color: navbarAmber,
            }}
          >
            <TranslatedText translationKey="manageProducts" />
          </Link>
          <Link
            href={`/artisan/${userId}`}
            className="px-6 py-3 rounded-md font-semibold border transition-all"
            style={{
              backgroundColor: beige,
              borderColor: navbarAmber,
              color: navbarAmber,
            }}
          >
            <TranslatedText translationKey="viewPublicProfile" />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-lg shadow-md"
        style={{
          backgroundColor: beige,
          borderLeft: `6px solid ${navbarAmber}`,
        }}
      >
        <div className="p-6 border-b border-[#e6d4c8]">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "Cinzel, serif", color: "8b4513" }}
          >
            <TranslatedText translationKey="recentOrders" />
          </h2>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <p className="text-center text-[#4a2c21]">
              <TranslatedText translationKey="noOrders" /> <br />
              New orders will appear here
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-md p-4 shadow-sm hover:shadow-md transition transform hover:scale-[1.01]"
                  style={{
                    backgroundColor: beige,
                    border: `1px solid ${navbarAmber}`,
                  }}
                >
                  <p className="font-bold" style={{ color: "8b4513" }}>
                    <TranslatedText translationKey="order" /> #
                    {order.id.slice(-8)}
                  </p>
                  <p className="text-sm text-[#4a2c21]">
                    {order.buyer.name} • {order.buyer.city},{" "}
                    {order.buyer.state}
                  </p>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="inline-block mt-2 px-4 py-2 rounded-md text-sm font-bold border transition-all"
                    style={{
                      backgroundColor: beige,
                      borderColor: navbarAmber,
                      color: navbarAmber,
                    }}
                  >
                    <TranslatedText translationKey="viewDetails" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div
        className="rounded-lg shadow-md"
        style={{
          backgroundColor: beige,
          borderLeft: `6px solid ${navbarAmber}`,
        }}
      >
        <div className="p-6 border-b border-[#e6d4c8]">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "Cinzel, serif", color: "8b4513" }}
          >
            <TranslatedText translationKey="customerInsights" />
          </h2>
        </div>
        <div className="p-6">
          <div
            className="rounded-md p-4"
            style={{ backgroundColor: beige, border: `1px solid ${navbarAmber}` }}
          >
            <MapView />
          </div>
        </div>
      </div>
    </div>
  );
}
