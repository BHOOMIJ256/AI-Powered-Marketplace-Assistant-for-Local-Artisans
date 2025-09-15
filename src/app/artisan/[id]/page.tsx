import { db } from "@/lib/db";
import Link from "next/link";
import StoryTool from "./StoryTool";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ArtisanProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;

  const artisan = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, city: true, state: true, craftType: true }
  });

  if (!artisan) {
    return (
      <div className="min-h-screen p-6 bg-[url('/textures/picture.jpeg')] bg-cover bg-center">
        <div className="max-w-5xl mx-auto">
          <p>Artisan not found.</p>
        </div>
      </div>
    );
  }

  const activeTab = (tab === "shop" ? "shop" : "posts") as "posts" | "shop";

  return (
    <div className="min-h-screen p-6 bg-[url('/textures/picture.jpeg')] bg-cover bg-center">
      <div className="max-w-5xl mx-auto space-y-6 bg-white/70 backdrop-blur-sm p-6 rounded-lg">
        {/* Header */}
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

        {/* Tabs */}
        <nav className="flex gap-3 border-b">
          <Link
            href={`/artisan/${artisan.id}?tab=posts`}
            className={`px-3 py-2 text-sm ${
              activeTab === "posts"
                ? "border-b-2 border-foreground font-medium"
                : "text-gray-500"
            }`}
          >
            Posts
          </Link>
          <Link
            href={`/artisan/${artisan.id}?tab=shop`}
            className={`px-3 py-2 text-sm ${
              activeTab === "shop"
                ? "border-b-2 border-foreground font-medium"
                : "text-gray-500"
            }`}
          >
            Shop
          </Link>
        </nav>

        {/* Posts */}
        {activeTab === "posts" ? (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded bg-foreground/5 flex items-center justify-center text-xs text-gray-500 shadow-lg shadow-amber-900/50"
              >
                Post {i + 1}
              </div>
            ))}
          </section>
        ) : (
          /* Shop products */
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-md p-3 bg-white/80 shadow-md shadow-amber-900/40"
              >
                <div className="h-36 bg-foreground/5 rounded" />
                <div className="mt-2">
                  <h3 className="font-medium">Product {i + 1}</h3>
                  <p className="text-sm text-gray-500">
                    Short description here
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">₹{(i + 1) * 199}</span>
                    <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium">
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <StoryTool />
      </div>
    </div>
  );
}
