export default function MarketingPage() {
	return (
		<div className="min-h-screen p-6 bg-[rgba(139,69,19,0.1)]">
		
			<h1 className="text-xl font-semibold text-amber-800">AI Marketing Suggestions</h1>
			<div className="border rounded-md p-4">
				<h2 className="font-medium text-amber-900">This week</h2>
				<ul className="mt-2 list-disc pl-6 space-y-1 text text-amber-800">
					<li>Post a reel on Holi festival featuring your colorful crafts.</li>
					<li>Auto-generated hashtags and captions available.</li>
					<li>Best time to post: 7:00 PM IST.</li>
				</ul>
				<div className="mt-4 flex gap-2">
					<button className="rounded-md bg-amber-800 text-[#F5F5DC] px-3 py-2 text-sm">Generate Post</button>
					<button className="rounded-md bg-amber-800 text-[#F5F5DC] px-3 py-2 text-sm">Export</button>
				</div>
			</div>
		</div>
	
	);
} 