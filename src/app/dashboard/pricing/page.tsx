export default function PricingPage() {
	return (
		<div className="min-h-screen p-6 bg-[rgba(139,69,19,0.1)]">
			<h1 className="text-xl font-semibold text-amber-800">Pricing & Trend Analytics</h1>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="border rounded-md p-4 bg-amber-50">
					<h2 className="font-medium text-amber-800">Price Suggestions</h2>
					<div className="h-40 mt-2 bg-foreground/5 rounded flex items-center justify-center text-sm text-amber-500">Table placeholder</div>
				</div>
				<div className="border rounded-md p-4 bg-amber-50">
					<h2 className="font-medium text-amber-800">Seasonal Demand</h2>
					<div className="h-40 mt-2 bg-foreground/5 rounded flex items-center justify-center text-sm text-amber-500">Chart placeholder</div>
				</div>
			</div>
		</div>
	);
} 