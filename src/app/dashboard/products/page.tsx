import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProductsPageClient from "./ProductsPageClient";

export default async function ProductsManagePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;

  if (!userId) redirect("/login");

  const products = await db.product.findMany({
    where: { artisanId: userId },
    orderBy: { createdAt: "desc" },
  });

  return <ProductsPageClient products={products} />;
}
