import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";
import MapView from "./MapView";

type SalesPoint = { key: string; amount: number };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  const buyerSession = cookieStore.get("session_buyer");

  // Redirect buyers to buyer page
  if (buyerSession) redirect("/buyer");

  // Redirect to login if not authenticated
  if (!userId) redirect("/login");

  // Get user data and verify they are an artisan
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true }
  });

  if (!user || user.role !== "artisan") {
    redirect("/login");
  }

  // Get dashboard data
  const [totalSales, pendingOrders, completedOrders, recentOrders] =
    await Promise.all([
      db.order.aggregate({
        where: { artisanId: userId, status: "completed" },
        _sum: { totalAmount: true }
      }),
      db.order.count({
        where: { artisanId: userId, status: "pending" }
      }),
      db.order.count({
        where: { artisanId: userId, status: "completed" }
      }),
      db.order.findMany({
        where: { artisanId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          buyer: { select: { name: true, city: true, state: true } },
          items: { include: { product: { select: { name: true } } } }
        }
      })
    ]);

  const salesAmount = totalSales._sum.totalAmount || 0;

  return (
    <div className="min-h-screen bg-amber-100">
      {/* Header */}
      <header className="bg-white shadow border-b-4 border-[#8B4513]">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            {/* Dashboard Title */}
            <h1 className="text-xl font-semibold text-[#8B4513]">
              <TranslatedText translationKey="dashboard" />
            </h1>

            {/* Language + Logout */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>



      {/* Dashboard Content */}
      
      <div className="w-full px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="totalSales" />
            </h3>
            <p className="text-2xl font-bold text-green-700 mt-2">
              ₹{(salesAmount / 100).toFixed(2)}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="pendingOrders" />
            </h3>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {pendingOrders}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="completedOrders" />
            </h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {completedOrders}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="totalOrders" />
            </h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {pendingOrders + completedOrders}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 shadow-sm"
          >
            <TranslatedText translationKey="manageProducts" />
          </Link>

          <Link
            href={`/artisan/${userId}`}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 shadow-sm"
          >
            <TranslatedText translationKey="viewPublicProfile" />
          </Link>

          
        </div>

        {/* Recent Orders */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-black">
            <h2 className="text-lg font-semibold text-amber-800">
              <TranslatedText translationKey="recentOrders" />
            </h2>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                <TranslatedText translationKey="noOrders" />
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-amber-800 rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        <TranslatedText translationKey="order" /> #
                        {order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.buyer.name} - {order.buyer.city},{" "}
                        {order.buyer.state}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{(order.totalAmount / 100).toFixed(2)} • {order.status}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <TranslatedText translationKey="viewDetails" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Customer Insights */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-amber-800">
              <TranslatedText translationKey="customerInsights" />
            </h2>
            <p className="text-sm text-gray-600">
              <TranslatedText translationKey="locationWiseDemand" />
            </p>
          </div>
          <div className="p-6">
            <MapView />
          </div>
        </div>
      </div>
    </div>
  );
}
