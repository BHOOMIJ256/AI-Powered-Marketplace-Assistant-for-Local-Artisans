"use client";

import type { Product } from "@prisma/client";
import AddProductForm from "./AddProductForm";

interface ProductsPageClientProps {
  products: Product[];
}

export default function ProductsPageClient({ products }: ProductsPageClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Add Product */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Add Product</h2>
        <div className="border border-amber-800 bg-[#FAF3E0] rounded-md p-3 shadow-sm hover:shadow-md transition">
          <AddProductForm />
        </div>
      </section>

      {/* Right: Products List */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Your Products</h2>
        <div className="grid grid-cols-1 gap-4 mt-3">
          {products.length === 0 ? (
            <p className="text-gray-600">No products yet. Add your first product!</p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="p-3 border rounded-md bg-white shadow-sm hover:shadow-md"
              >
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-gray-700">{product.description}</p>
                <p className="text-amber-800 font-semibold mt-1">
                  ₹{(product.price / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-32 h-32 object-cover mt-2 rounded-md"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
