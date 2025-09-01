import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export const runtime = "nodejs";

// Check if AI backend is available
async function checkAIBackend(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:8000/health", { 
      method: "GET",
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const image = form.get("image");
    const audio = form.get("audio");
    const note = (form.get("note") as string | null)?.toString().slice(0, 500) || "";

    if (!(image instanceof File)) {
      return NextResponse.json<ApiResponse<null>>({ success: false, message: "Image is required", error: "Image is required", data: null }, { status: 400 });
    }

    // Try AI backend first
    const aiBackendAvailable = await checkAIBackend();
    
    if (aiBackendAvailable) {
      console.log("Using AI backend for content generation...");
      
      // Forward to Python AI backend
      const aiForm = new FormData();
      aiForm.append("image", image);
      if (audio) aiForm.append("audio", audio);
      if (note.trim()) aiForm.append("note", note.trim());

      try {
        const aiRes = await fetch("http://localhost:8000/generate-story", {
          method: "POST",
          body: aiForm,
          signal: AbortSignal.timeout(30000) // 30 second timeout for AI generation
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          return NextResponse.json<ApiResponse<{ description: string; caption: string; hashtags: string[]; title: string }>>({
            success: true,
            message: "AI Generated",
            data: aiData.data
          });
        } else {
          console.warn("AI backend failed, falling back to template generator");
        }
      } catch (aiError) {
        console.warn("AI backend error, falling back to template generator:", aiError);
      }
    }

    // Fallback to simple template generator
    console.log("Using template generator...");
    
    // Basic heuristic title from filename
    const filename = image.name?.replace(/[-_]/g, " ").replace(/\.[^.]+$/, "").trim() || "Handcrafted Product";

    // For MVP, simulate image caption + audio transcript
    const imageCaption = `Photo of ${filename.toLowerCase()} crafted by local artisan.`;
    const transcript = note || (audio ? "Voice note provided by the artisan." : "");

    // Compose promptless deterministic outputs
    const description = composeDescription(imageCaption, transcript);
    const caption = composeCaption(imageCaption, transcript);
    const hashtags = dedupe(["Handmade", "LocalArtisan", "MadeInIndia", "Sustainable", "CraftCulture"]);

    return NextResponse.json<ApiResponse<{ description: string; caption: string; hashtags: string[]; title: string }>>({
      success: true,
      message: "Template Generated (AI backend not available)",
      data: { description, caption, hashtags, title: toTitleCase(filename) }
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? (error as Error)?.message : 'Internal server error',
      data: null
    }, { status: 500 });
  }
}

function composeDescription(caption: string, transcript: string) {
  const cultural = transcript ? ` ${transcript}` : " This piece reflects traditional craftsmanship and cultural heritage.";
  return `${toSentence(caption)}${cultural} Crafted with care using locally sourced materials, it blends utility with tradition.`;
}

function composeCaption(caption: string, transcript: string) {
  const hint = transcript ? ` — ${transcript}` : "";
  return `${toSentence(caption)}${hint} Support local makers!`;
}

function toTitleCase(s: string) {
  return s.replace(/\s+/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function toSentence(s: string) {
  const t = s.trim();
  return /[.!?]$/.test(t) ? t : t + ".";
}

function dedupe<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
