"use client";

import { useState } from "react";

export default function AddProductForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create product");

      alert("✅ Product added successfully!");
      window.location.reload(); // refresh to show new product
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="name"
        placeholder="Product name"
        className="border p-2 w-full rounded-md"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        className="border p-2 w-full rounded-md"
      />

      <input
        type="number"
        name="price"
        placeholder="Price (in paise)"
        className="border p-2 w-full rounded-md"
        required
      />

      <input
        type="number"
        name="stock"
        placeholder="Stock"
        className="border p-2 w-full rounded-md"
        required
      />

      <input
        type="file"
        name="image"
        accept="image/*"
        className="border p-2 w-full rounded-md"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-amber-700 text-white px-4 py-2 rounded-md hover:bg-amber-800 transition"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
