import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AddProductForm from "./AddProductForm";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";
import ProductImage from "@/components/ProductImage";

export default async function ProductsManagePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) redirect("/login");

  const products = await db.product.findMany({ 
    where: { artisanId: userId }, 
    orderBy: { createdAt: "desc" } 
  });

  return (
    <div className="min-h-screen p-6 bg-amber-100">
      <div className="max-w-5xl mx-auto">
        {/* Header with Language Selector */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-amber-800">
            <TranslatedText translationKey="manageProducts" />
          </h1>
          <LanguageSelector />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-3">
            <h2 className="text-xl font-medium text-amber-800">
              <TranslatedText translationKey="products" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="border rounded-md p-3 bg-white shadow-sm">
                  {/* Product Image */}
                  <div className="h-32 bg-gray-100 rounded overflow-hidden mb-2">
                    <ProductImage 
                      src={p.imageUrl} 
                      alt={p.name}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-amber-900 line-clamp-2">{p.name}</h3>
                    {p.description && (
                      <p className="text-xs text-amber-600 line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-amber-700">₹{(p.price/100).toFixed(2)}</p>
                      <p className="text-xs text-amber-500">
                        <TranslatedText translationKey="stock" />: {p.stock}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <div className="text-amber-400 mb-2">
                    <svg className="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-sm text-amber-500">
                    <TranslatedText translationKey="noProducts" />
                  </p>
                  <p className="text-xs text-amber-400 mt-1">
                    Add your first product using the form on the right
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-amber-800 border-b border-amber-800">
              <TranslatedText translationKey="Add Product" />
            </h2>
            <AddProductForm />
          </section>
        </div>
      </div>
    </div>
  );
}