export default function MarketingPage() {
	return (
		<div className="space-y-4">
			<h1 className="text-xl font-semibold">AI Marketing Suggestions</h1>
			<div className="border rounded-md p-4">
				<h2 className="font-medium">This week</h2>
				<ul className="mt-2 list-disc pl-6 space-y-1 text-sm text-gray-700">
					<li>Post a reel on Holi festival featuring your colorful crafts.</li>
					<li>Auto-generated hashtags and captions available.</li>
					<li>Best time to post: 7:00 PM IST.</li>
				</ul>
				<div className="mt-4 flex gap-2">
					<button className="rounded-md bg-foreground text-background px-3 py-2 text-sm">Generate Post</button>
					<button className="rounded-md border border-foreground px-3 py-2 text-sm hover:bg-foreground/5">Export</button>
				</div>
			</div>
		</div>
	);
} 