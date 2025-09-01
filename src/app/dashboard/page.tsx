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

  if (!user || user.role !== 'artisan') {
    redirect("/login");
  }

  // Get dashboard data
  const [totalSales, pendingOrders, completedOrders, recentOrders] = await Promise.all([
    db.order.aggregate({
      where: { artisanId: userId, status: 'completed' },
      _sum: { totalAmount: true }
    }),
    db.order.count({
      where: { artisanId: userId, status: 'pending' }
    }),
    db.order.count({
      where: { artisanId: userId, status: 'completed' }
    }),
    db.order.findMany({
      where: { artisanId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        buyer: { select: { name: true, city: true, state: true } },
        items: { include: { product: { select: { name: true } } } }
      }
    })
  ]);

  const salesAmount = totalSales._sum.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              <TranslatedText translationKey="dashboard" />
            </h1>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  <TranslatedText translationKey="logout" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="totalSales" />
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{(salesAmount / 100).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="pendingOrders" />
            </h3>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="completedOrders" />
            </h3>
            <p className="text-2xl font-bold text-blue-600">{completedOrders}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              <TranslatedText translationKey="totalOrders" />
            </h3>
            <p className="text-2xl font-bold text-purple-600">{pendingOrders + completedOrders}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/dashboard/products"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <TranslatedText translationKey="manageProducts" />
          </Link>
          
          <Link
            href={`/artisan/${userId}`}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <TranslatedText translationKey="viewPublicProfile" />
          </Link>

          <Link
            href="/dashboard/finance-support"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            <TranslatedText translationKey="financeSupport" />
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">
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
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        <TranslatedText translationKey="order" /> #{order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.buyer.name} - {order.buyer.city}, {order.buyer.state}
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

        {/* Customer Insights Map */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">
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