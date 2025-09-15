import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AddProductForm from "./AddProductForm";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";

export default async function ProductsManagePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) redirect("/login");

  const products = await db.product.findMany({
    where: { artisanId: userId },
    orderBy: { createdAt: "desc" },
  });


  return (
    <div className="min-h-screen p-6 bg-[rgba(139,69,19,0.1)]">
      {/* Amber overlay background */}

      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header with Language Selector */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-amber-900">
              <TranslatedText translationKey="manageProducts" />
            </h1>
            <LanguageSelector />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product List */}
            <section className="lg:col-span-2 space-y-3">
              <h2 className="text-xl font-medium text-amber-900">
                <TranslatedText translationKey="products" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="border-3 border-amber-800 bg-[#FAF3E0] rounded-md p-3 shadow-sm hover:shadow-md transition"
                  >
                    <div className="h-32 bg-amber-50 rounded" />
                    <div className="mt-2">
                      <h3 className="font-medium text-amber-900">{p.name}</h3>
                      <p className="text-sm text-amber-600">
                        ₹{(p.price / 100).toFixed(2)} ·{" "}
                        <TranslatedText translationKey="stock" />: {p.stock}
                      </p>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-sm text-amber-600">
                    <TranslatedText translationKey="noProducts" />
                  </p>
                )}
              </div>
            </section>

            {/* Add Product */}
            <section className="space-y-3">
              <h2 className="text-xl font-medium text-amber-900 border-b border-amber-800">
                <TranslatedText translationKey="Add Product" />
              </h2>
              <div className="border-3 border-amber-800 bg-[#FAF3E0] rounded-md p-3 shadow-sm hover:shadow-md transition">
                <AddProductForm />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
