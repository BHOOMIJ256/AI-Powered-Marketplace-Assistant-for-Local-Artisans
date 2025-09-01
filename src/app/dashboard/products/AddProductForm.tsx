"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function AddProductForm() {
  const { t } = useLanguage();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || ""),
      description: String(fd.get("description") || ""),
      price: Number(fd.get("price") || 0),
      stock: Number(fd.get("stock") || 0),
      imageUrl: String(fd.get("imageUrl") || ""),
    };
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.message || "Failed to create product");
      return;
    }
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border rounded-md p-3">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          {t("productName")}
        </label>
        <input 
          id="name"
          name="name" 
          className="w-full border p-2 rounded" 
          placeholder="Enter product name" 
          required 
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {t("description")}
        </label>
        <textarea 
          id="description"
          name="description" 
          className="w-full border p-2 rounded" 
          placeholder="Enter product description (optional)" 
        />
      </div>
      
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          {t("price")}
        </label>
        <input 
          id="price"
          name="price" 
          type="number" 
          className="w-full border p-2 rounded" 
          placeholder="Price in paise (e.g., 29900)" 
          required 
        />
      </div>
      
      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
          {t("stock")}
        </label>
        <input 
          id="stock"
          name="stock" 
          type="number" 
          className="w-full border p-2 rounded" 
          placeholder="Available stock" 
          required 
        />
      </div>
      
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          {t("imageUrl")}
        </label>
        <input 
          id="imageUrl"
          name="imageUrl" 
          className="w-full border p-2 rounded" 
          placeholder="Image URL (optional)" 
        />
      </div>
      
      <button className="w-full rounded-md bg-foreground text-background py-2.5 font-medium">
        {t("createProduct")}
      </button>
      
      <p className="text-xs text-gray-500">
        {t("addFirstProduct")}
      </p>
    </form>
  );
}
