// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

// export default async function NewProductPage() {
//   const cookieStore = await cookies();
//   const userId = cookieStore.get("session_user")?.value;
//   if (!userId) redirect("/login");

//   return (
//     <div className="min-h-screen p-6">
//       <div className="max-w-xl mx-auto">
//         <h1 className="text-2xl font-semibold mb-4">Add Product</h1>
//         <form action="/api/products" method="post" className="space-y-3">
//           <input name="name" className="w-full border p-2 rounded" placeholder="Product name" required />
//           <textarea name="description" className="w-full border p-2 rounded" placeholder="Description (optional)" />
//           <input name="price" type="number" className="w-full border p-2 rounded" placeholder="Price in paise (e.g., 29900)" required />
//           <input name="stock" type="number" className="w-full border p-2 rounded" placeholder="Stock" required />
//           <input name="imageUrl" className="w-full border p-2 rounded" placeholder="Image URL (optional)" />
//           <CreateButton />
//         </form>
//       </div>
//     </div>
//   );
// }

// function CreateButton() {
//   "use client";
//   async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const form = e.currentTarget;
//     const formData = new FormData(form);
//     const payload = {
//       name: String(formData.get("name") || ""),
//       description: String(formData.get("description") || ""),
//       price: Number(formData.get("price") || 0),
//       stock: Number(formData.get("stock") || 0),
//       imageUrl: String(formData.get("imageUrl") || ""),
//     };
//     const res = await fetch("/api/products", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });
//     const data = await res.json();
//     if (res.ok) {
//       window.location.assign("/dashboard");
//     } else {
//       alert(data?.message || "Failed to create product");
//     }
//   }
//   return (
//     <button onClick={(e)=>{}} className="w-full rounded-md bg-foreground text-background py-2.5 font-medium" formAction={undefined}>
//       {/* The actual submit is handled in JS above */}
//       <span onClick={(e)=>{ const form = (e.currentTarget as any).closest('form'); if (form) (onSubmit as any)({ preventDefault: ()=>{}, currentTarget: form }); }}>Create Product</span>
//     </button>
//   );
// }
