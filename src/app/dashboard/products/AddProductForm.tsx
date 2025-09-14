"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AddProductForm() {
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      
      // Add image file to FormData if present
      if (imageFile) {
        fd.append("image", imageFile);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: fd, // Send FormData directly (not JSON)
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(data?.message || "Failed to create product");
        return;
      }

      // Reset form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      
      window.location.reload();
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border rounded-md p-3">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-amber-800 mb-1">
          {t("productName")}
        </label>
        <input 
          id="name"
          name="name" 
          className="w-full border p-2 rounded text-black"
          placeholder="Enter product name"
          required 
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-amber-800 mb-1">
          {t("description")}
        </label>
        <textarea 
          id="description"
          name="description" 
          className="w-full border p-2 rounded text-black"
          placeholder="Enter product description (optional)"
        />
      </div>
      
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-amber-800 mb-1">
          {t("price")}
        </label>
        <input 
          id="price"
          name="price" 
          type="number"
          className="w-full border p-2 rounded text-black"
          placeholder="Price in paise (e.g., 29900)"
          required 
        />
      </div>
      
      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-amber-800 mb-1">
          {t("stock")}
        </label>
        <input 
          id="stock"
          name="stock" 
          type="number"
          className="w-full border p-2 rounded text-black"
          placeholder="Available stock"
          required 
        />
      </div>
      
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-2">
          Product Image
        </label>
        
        {!imagePreview ? (
          <div className="space-y-2">
            {/* Upload from Gallery */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-amber-600">Upload from Gallery</p>
                  <p className="text-xs text-amber-500">PNG, JPG up to 5MB</p>
                </div>
              </label>
            </div>
            
            {/* Take Photo */}
            <div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
                id="camera-capture"
              />
              <label
                htmlFor="camera-capture"
                className="w-full flex items-center justify-center px-4 py-2 bg-amber-200 border border-amber-300 rounded-lg cursor-pointer hover:bg-amber-300 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-1 text-sm text-amber-600">Take Photo</p>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Image Preview */}
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Product preview" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-amber-600">
              {imageFile?.name} ({imageFile ? (imageFile.size / 1024 / 1024).toFixed(1) : '0'}MB)
            </p>
          </div>
        )}
      </div>
      
      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[#8B5E3C] hover:bg-[#A67B5B] text-[#F5F5DC] py-2.5 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creating..." : t("createProduct")}
      </button>
      
      <p className="text-xs text-amber-800">
        {t("addFirstProduct")}
      </p>
    </form>
  );
}