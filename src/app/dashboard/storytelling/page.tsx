export default function StorytellingPage() {
	return (
		<div className="space-y-4 bg-amber-100">
			<h1 className="text-xl font-semibold text-amber-800">Storytelling Tools</h1>
			<div className="border rounded-md p-4">
				<h2 className="font-medium text-amber-800">One-click Story</h2>
				<p className="text-sm text-amber-600 mt-2">Upload product photo and a short voice note to generate cultural background and descriptions.</p>
				<div className="mt-4 flex gap-2">
					<button className="rounded-md border border-amber-800 px-3 py-2 text-amber-800 hover:bg-amber-800/5">Upload</button>
					<button className="rounded-md border border-amber-800 px-3 py-2 text-amber-800 hover:bg-amber-800/5">Generate</button>
				</div>
			</div>
		</div>
	);
} 