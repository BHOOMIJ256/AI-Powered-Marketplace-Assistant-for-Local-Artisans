import Link from "next/link";

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-6xl p-4 md:p-6">
				<div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
					<aside className="border rounded-md p-3 h-fit sticky top-4">
						<nav className="space-y-2 text-sm">
							<p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Dashboard</p>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard">Overview</Link>
							<p className="text-xs uppercase tracking-wide text-gray-500 mt-4 mb-2">Features</p>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard/orders">Orders</Link>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard/products">Products</Link>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard/marketing">AI Marketing</Link>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard/insights">Customer Insights</Link>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard/pricing">Pricing & Trends</Link>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard/storytelling">Storytelling</Link>
							<Link className="block rounded-md px-3 py-2 hover:bg-foreground/5" href="/dashboard/finance">Finance & Support</Link>
						</nav>
					</aside>
					<main>{children}</main>
				</div>
			</div>
		</div>
	);
} 