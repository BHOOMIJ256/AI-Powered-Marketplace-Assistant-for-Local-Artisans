"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import TranslatedText from "@/components/TranslatedText";
import ARTryOn from "@/components/ARTryOn";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  artisanId: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function BuyerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/buyer/check-auth");
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        router.push("/login/buyer");
      }
    } catch (error) {
      router.push("/login/buyer");
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/products");
      const data = await res.json();
      
      console.log("API Response:", data); // Debug log
      
      if (res.ok) {
        // Handle different response structures
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (data.success && data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          console.warn("Unexpected API response structure:", data);
          setProducts([]);
        }
      } else {
        setError(data?.message || "Failed to load products");
        setProducts([]);
      }
    } catch (error) {
      setError("Failed to fetch products: " + (error instanceof Error ? error.message : String(error)));
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  async function checkout() {
    if (cart.length === 0) return;

    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        priceAtOrder: item.price
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: cartTotal
        })
      });

      if (res.ok) {
        alert("Order placed successfully!");
        setCart([]);
        router.push("/buyer/orders");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to place order");
      }
    } catch (error) {
      alert("Failed to place order");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p><TranslatedText translationKey="loading" /></p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-100">
      {/* Header with Language Selector */}
      <header className="bg-amber-200 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-amber-900">
              <TranslatedText translationKey="shop" />
            </h1>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-amber-900 hover:text-amber-900"
                >
                  <TranslatedText translationKey="logout" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">
              <TranslatedText translationKey="products" />
            </h2>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-amber-500 text-lg">No products available at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new artisan products.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-amber-200 rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-amber-400">No image</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-amber-900">{product.name}</h3>
                      {product.description && (
                        <p className="text-amber-600 text-sm mb-3">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-amber-600">
                          ₹{(product.price / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-amber-500">
                          <TranslatedText translationKey="stock" />: {product.stock}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full bg-amber-900 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <TranslatedText translationKey="addToCart" />
                        </button>
                        
                        {/* AR Try-On Feature - Always visible */}
                        <ARTryOn 
                          productImageUrl={product.imageUrl || ""} 
                          productName={product.name}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-amber-200 rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-amber-900">
                <TranslatedText translationKey="cart" />
              </h3>
              
              {cart.length === 0 ? (
                <p className="text-amber-500 text-center py-8">
                  <TranslatedText translationKey="cartEmpty" />
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 text-amber-900">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-amber-600 text-sm">
                            ₹{(item.price / 100).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-900">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">
                        <TranslatedText translationKey="total" />:
                      </span>
                      <span className="text-lg font-bold text-amber-600">
                        ₹{(cartTotal / 100).toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={checkout}
                      className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700"
                    >
                      <TranslatedText translationKey="placeOrder" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}