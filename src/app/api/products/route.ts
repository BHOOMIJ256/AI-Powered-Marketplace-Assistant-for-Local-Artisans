import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: { artisan: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value;
        
    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
        
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const imageFile = formData.get("image") as File | null;

    // Debug logging
    console.log("Form data received:", {
      name,
      description,
      price,
      stock,
      imageFile: imageFile ? { name: imageFile.name, size: imageFile.size, type: imageFile.type } : null
    });

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Product name is required" }, { status: 400 });
    }
        
    if (!price || price <= 0) {
      return NextResponse.json({ success: false, message: "Valid price is required" }, { status: 400 });
    }
        
    if (!stock || stock < 0) {
      return NextResponse.json({ success: false, message: "Valid stock is required" }, { status: 400 });
    }

    let imageUrl: string | null = null;

    // Handle image upload with Vercel Blob
    if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json({ 
            success: false, 
            message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" 
          }, { status: 400 });
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
          return NextResponse.json({ 
            success: false, 
            message: "File too large. Maximum size is 5MB" 
          }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `products/${timestamp}-${randomString}.${fileExtension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, imageFile, {
          access: 'public',
        });

        imageUrl = blob.url;
        console.log("Image uploaded successfully to Vercel Blob:", { filename, imageUrl });
      } catch (error) {
        console.error("Failed to upload image to Vercel Blob:", error);
        return NextResponse.json({ success: false, message: "Failed to upload image" }, { status: 500 });
      }
    }

    // Create product in database
    const product = await db.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price,
        stock,
        imageUrl,
        artisanId: userId,
      },
    });

    console.log("Product created successfully:", product);

    return NextResponse.json({ 
      success: true, 
      data: product,
      message: "Product created successfully"
    });

  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }
}