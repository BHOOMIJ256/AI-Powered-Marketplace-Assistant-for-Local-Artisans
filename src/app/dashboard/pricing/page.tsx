"use client";

import { useEffect, useMemo, useState } from "react";

type PricingSuggestion = {
	productId: string;
	name: string;
	currentPrice: number;
	avgPaid: number;
	minPaid: number;
	maxPaid: number;
	unitsSold: number;
	revenue: number;
	demandTrend: "rising" | "falling" | "stable";
	suggestedPrice: number;
	rationale: string;
};

type SeasonalPoint = { month: string; orders: number };

export default function PricingPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pricing, setPricing] = useState<PricingSuggestion[]>([]);
	const [seasonal, setSeasonal] = useState<SeasonalPoint[]>([]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/insights/pricing-trends", { cache: "no-store" });
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = await res.json();
				if (isMounted) {
					setPricing(Array.isArray(data.pricing) ? data.pricing : []);
					setSeasonal(Array.isArray(data.seasonalDemand) ? data.seasonalDemand : []);
				}
			} catch (e: any) {
				if (isMounted) setError(e?.message || "Failed to load pricing insights");
			} finally {
				if (isMounted) setLoading(false);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, []);

	const trendBadge = (trend: PricingSuggestion["demandTrend"]) => {
		const base = "px-2 py-0.5 rounded text-xs font-medium";
		if (trend === "rising") return <span className={`${base} bg-green-100 text-green-700`}>Rising</span>;
		if (trend === "falling") return <span className={`${base} bg-red-100 text-red-700`}>Falling</span>;
		return <span className={`${base} bg-amber-100 text-amber-700`}>Stable</span>;
	};

	const seasonalMax = useMemo(() => Math.max(1, ...seasonal.map(s => s.orders)), [seasonal]);

	return (
		<div className="space-y-4 bg-amber-100 min-h-[calc(100vh-8rem)] p-4">
			<h1 className="text-xl font-semibold text-amber-800">Pricing & Trend Analytics</h1>

			{loading && (
				<div className="text-sm text-amber-700">Loading insights…</div>
			)}
			{error && (
				<div className="text-sm text-red-600">{error}</div>
			)}

			{!loading && !error && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="border rounded-md p-4 bg-amber-50">
						<h2 className="font-medium text-amber-800">Price Suggestions</h2>
						{pricing.length === 0 ? (
							<div className="h-40 mt-2 bg-foreground/5 rounded flex items-center justify-center text-sm text-amber-500">
								No data yet. Complete orders to see suggestions.
							</div>
						) : (
							<div className="mt-3 overflow-x-auto">
								<table className="min-w-full text-sm">
									<thead>
										<tr className="text-left text-amber-700">
											<th className="py-2 pr-4">Product</th>
											<th className="py-2 pr-4">Current</th>
											<th className="py-2 pr-4">Avg Paid</th>
											<th className="py-2 pr-4">Sold</th>
											<th className="py-2 pr-4">Trend</th>
											<th className="py-2 pr-4">Suggested</th>
										</tr>
									</thead>
									<tbody>
										{pricing.map((p) => (
											<tr key={p.productId} className="border-t border-amber-100">
												<td className="py-2 pr-4 font-medium text-amber-900">{p.name}</td>
												<td className="py-2 pr-4">₹{p.currentPrice.toFixed(2)}</td>
												<td className="py-2 pr-4">₹{p.avgPaid.toFixed(2)} <span className="text-xs text-amber-500">(min ₹{p.minPaid.toFixed(0)}, max ₹{p.maxPaid.toFixed(0)})</span></td>
												<td className="py-2 pr-4">{p.unitsSold}</td>
												<td className="py-2 pr-4">{trendBadge(p.demandTrend)}</td>
												<td className="py-2 pr-4 font-semibold text-amber-900">₹{p.suggestedPrice.toFixed(2)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					<div className="border rounded-md p-4 bg-amber-50">
						<h2 className="font-medium text-amber-800">Seasonal Demand</h2>
						{seasonal.length === 0 ? (
							<div className="h-40 mt-2 bg-foreground/5 rounded flex items-center justify-center text-sm text-amber-500">
								No demand data yet.
							</div>
						) : (
							<div className="mt-4 grid grid-cols-12 gap-2 items-end h-48">
								{seasonal.map((s) => {
									const h = Math.round((s.orders / seasonalMax) * 100);
									return (
										<div key={s.month} className="flex flex-col items-center">
											<div className="w-4 bg-amber-400 rounded-t" style={{ height: `${h}%` }} title={`${s.orders} orders`} />
											<div className="text-[10px] mt-1 text-amber-700">{s.month}</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}