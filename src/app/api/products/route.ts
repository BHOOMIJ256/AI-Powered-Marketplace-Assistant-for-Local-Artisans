import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = imageFile.name.split('.').pop() || 'jpg';
        const filename = `${timestamp}-${randomString}.${fileExtension}`;
        const filepath = path.join(uploadsDir, filename);

        // Convert file to buffer and save
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Set the public URL
        imageUrl = `/uploads/products/${filename}`;
      } catch (error) {
        console.error("Failed to save image:", error);
        return NextResponse.json({ success: false, message: "Failed to save image" }, { status: 500 });
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