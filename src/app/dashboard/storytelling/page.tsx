export default function StorytellingPage() {
	return (
		<div className="space-y-4">
			<h1 className="text-xl font-semibold">Storytelling Tools</h1>
			<div className="border rounded-md p-4">
				<h2 className="font-medium">One-click Story</h2>
				<p className="text-sm text-gray-600 mt-2">Upload product photo and a short voice note to generate cultural background and descriptions.</p>
				<div className="mt-4 flex gap-2">
					<button className="rounded-md bg-foreground text-background px-3 py-2 text-sm">Upload</button>
					<button className="rounded-md border border-foreground px-3 py-2 text-sm hover:bg-foreground/5">Generate</button>
				</div>
			</div>
		</div>
	);
} 