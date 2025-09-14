// app/artisan/[id]/page.tsx - Updated for your schema
import { db } from "@/lib/db";
import Link from "next/link";
import ArtisanProfileClient from "./ArtisanProfileClient";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ArtisanProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;

  const artisan = await db.user.findUnique({
    where: { id },
    select: { 
      id: true, 
      name: true, 
      city: true, 
      state: true, 
      craftType: true 
    }
  });

  // Fetch existing posts from database with hashtags parsing
  const existingPosts = await db.post.findMany({
    where: { 
      userId: id 
    },
    select: {
      id: true,
      title: true,
      description: true,
      caption: true,
      hashtags: true,
      imageUrl: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Parse hashtags JSON strings to arrays
  const postsWithParsedHashtags = existingPosts.map(post => ({
    ...post,
    hashtags: JSON.parse(post.hashtags)
  }));

  // Fetch shop products using your existing schema
  const shopProducts = await db.product.findMany({
    where: {
      artisanId: id // Your Product model uses artisanId field
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true, // This is in paise/cents in your schema
      imageUrl: true,
      stock: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Convert products to match the expected interface
  const formattedProducts = shopProducts.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price / 100, // Convert paise to rupees for display
    imageUrl: product.imageUrl,
    category: undefined, // Your schema doesn't have category
    inStock: product.stock > 0
  }));

  if (!artisan) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          <p>Artisan not found.</p>
        </div>
      </div>
    );
  }

  const activeTab = (tab === "shop" ? "shop" : "posts") as "posts" | "shop";

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{artisan.name}</h1>
            <p className="text-sm text-gray-500">
              {artisan.craftType ?? "Artisan"} • {artisan.city}, {artisan.state}
            </p>
          </div>
          <Link 
            href={`/dashboard`} 
            className="rounded-md border border-foreground px-4 py-2 text-sm font-medium hover:bg-foreground/5"
          >
            Go to dashboard
          </Link>
        </header>

        <ArtisanProfileClient 
          artisan={artisan}
          initialPosts={postsWithParsedHashtags}
          shopProducts={formattedProducts}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}