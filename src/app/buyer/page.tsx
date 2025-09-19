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
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
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

      if (res.ok) {
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
      setError(
        "Failed to fetch products: " +
          (error instanceof Error ? error.message : String(error))
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function proceedToCheckout() {
    if (cart.length === 0) return;
    setShowCheckout(true);
  }

  async function checkout() {
    if (cart.length === 0) return;
    if (!deliveryAddress.trim()) {
      alert("Please enter your delivery address");
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        priceAtOrder: item.price,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: cartTotal,
        }),
      });

      if (res.ok) {
        alert("Order placed successfully!");
        setCart([]);
        setDeliveryAddress("");
        setShowCheckout(false);
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
        <p>
          <TranslatedText translationKey="loading" />
        </p>
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
    <div className="min-h-screen bg-amber-100 relative">
      {/* Background Texture Overlay - Fixed */}
      <div
        className="absolute inset-0 bg-repeat opacity-70"
        style={{
          backgroundImage: "url('/images/indian-texture1.jpeg')",
          backgroundSize: "300px 300px",
          backgroundPosition: "center",
          zIndex: 1,
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Navbar - Updated with burnt sienna */}
        <nav className="sticky top-0 z-20 mx-auto flex w-full items-center justify-between px-10 py-4 
         bg-amber-900/85 
         backdrop-blur-md shadow-md border-b border-amber-950/40">
          {/* Brand / Logo */}
          <div
            className="text-4xl font-extrabold tracking-wider text-white drop-shadow-md
                       hover:scale-[1.05] transition-transform duration-500 ease-out"
            style={{ fontFamily: "Cinzel Decorative, Cormorant Garamond, serif" }}
          >
            ARTISAN
          </div>

          {/* Nav Links */}
          <div className="hidden gap-4 md:flex items-center">
            {[
              { href: "/", label: "HOME" },
              { href: "/about", label: "ABOUT" },
              { href: "#contact", label: "CONTACT" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-white tracking-wide font-medium
                          transition-all duration-300 hover:text-amber-300"
              >
                {item.label}
              </a>
            ))}

            {/* Login & Signup */}
            <a
              href="/login"
              className="px-4 py-2 border border-white text-white
                        rounded-md font-medium shadow-sm transition-all duration-300
                        hover:bg-white hover:text-amber-900 hover:scale-105"
            >
              <TranslatedText translationKey="login" />
            </a>
            <a
              href="/signup"
              className="px-4 py-2 border border-white text-white
                        rounded-md font-medium shadow-sm transition-all duration-300
                        hover:bg-white hover:text-amber-900 hover:scale-105"
            >
              <TranslatedText translationKey="Signup" />
            </a>

            {/* Language Selector */}
            <div className="ml-4">
              <LanguageSelector />
            </div>

            {/* Logout */}
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="px-4 py-2 border border-white text-white
                          rounded-md font-medium shadow-sm transition-all duration-300
                          hover:bg-white hover:text-amber-900 hover:scale-105"
              >
                <TranslatedText translationKey="logout" />
              </button>
            </form>
          </div>
        </nav>

        {/* Main Content - Fixed Layout */}
        <div className="relative">
          {/* Products Grid - Shifted Left */}
          <div className="max-w-5xl ml-12 px-4 sm:px-6 lg:px-8 py-8 pr-10">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              <TranslatedText translationKey="products" />
            </h2>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-amber-500 text-lg">
                  No products available at the moment.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Check back later for new artisan products.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 ml-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md transform translate-x-2 translate-y-4 border-2 border-amber-700 w-70"
                  >
                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-amber-400">No image</span>
                      )}
                    </div>
                    {/* Beige lower half */}
                    <div className="p-3 bg-[#f5f5dc]">
                      <h3 className="font-semibold text-sm mb-1 text-amber-900">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-amber-600 text-xs mb-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-amber-600">
                          ₹{(product.price / 100).toFixed(2)}
                        </span>
                        <span className="text-xs text-amber-500">
                          <TranslatedText translationKey="stock" />:{" "}
                          {product.stock}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full bg-amber-900/90 text-white py-1.5 px-3 rounded-md hover:bg-amber-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
                        >
                          <TranslatedText translationKey="addToCart" />
                        </button>

                        {/* AR Try-On Feature - No icon */}
                        <ARTryOn
                          productImageUrl={product.imageUrl || ""}
                          productName={product.name}
                          hideIcon={true}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar - Shifted Down and Repositioned */}
          {/* Cart Sidebar - Shifted Down and Repositioned */}
<div className="fixed right-4 top-32 w-96 h-[calc(100vh-8rem)] overflow-y-auto z-20">
  <div className="p-4">
    <div className="bg-[#f5f5dc] backdrop-blur-sm rounded-lg shadow-md overflow-hidden border-l-4 border-amber-900">
      {/* Cart Header */}
      <div className="p-6 border-b border-amber-700">
        <h3 className="text-lg font-semibold text-amber-900">
          <TranslatedText translationKey="cart" />
        </h3>
      </div>

                {/* Cart Content */}
                <div className="p-6">
                  {cart.length === 0 ? (
                    <p className="text-amber-800 text-center py-12">
                      <TranslatedText translationKey="cartEmpty" />
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between border-b border-amber-700 pb-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm text-amber-900">{item.name}</p>
                              <p className="text-amber-600 text-sm">
                                ₹{(item.price / 100).toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-7 h-7 rounded-full bg-amber-300 hover:bg-amber-600 flex items-center justify-center text-sm font-bold text-amber-900"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-semibold text-amber-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-7 h-7 rounded-full bg-amber-300 hover:bg-amber-600 flex items-center justify-center text-sm font-bold text-amber-900"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cart Footer */}
                      <div className="border-t border-amber-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-amber-900">
                            <TranslatedText translationKey="total" />:
                          </span>
                          <span className="text-xl font-bold text-amber-600">
                            ₹{(cartTotal / 100).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={checkout}
                          className="w-full bg-amber-800 hover:bg-amber-700 text-white py-3 px-4 rounded-md font-semibold transition-colors"
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
      </div>
    </div>
  );
}