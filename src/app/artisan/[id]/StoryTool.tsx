// StoryTool.tsx - Updated with better error handling and UX
"use client";

import { useEffect, useRef, useState } from "react";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface StoryResult {
  description: string;
  caption: string;
  hashtags: string[];
  title: string;
}

interface Props {
  onPostCreated?: (post: {
    title: string;
    description: string;
    caption: string;
    hashtags: string[];
    imageUrl?: string;
  }) => Promise<void>;
}

export default function StoryTool({ onPostCreated }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<null | StoryResult>(null);
  const [aiBackendStatus, setAiBackendStatus] = useState<"checking" | "available" | "unavailable">("checking");

  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    checkVoiceSupport();
    checkAIBackendStatus();
  }, []);

  // Clear success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Check microphone permission and voice support
  const checkVoiceSupport = async () => {
    try {
      const SR = (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition));
      if (!SR) {
        setVoiceSupported(false);
        return;
      }

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermission(permission.state);
          permission.onchange = () => setMicPermission(permission.state);
        } catch (e) {
          setMicPermission("prompt");
        }
      } else {
        setMicPermission("prompt");
      }

      const rec = new SR();
      rec.lang = "en-IN";
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      
      rec.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNote(prev => (prev ? prev + " " : "") + transcript.trim());
        setIsRecording(false);
        setError(null);
      };
      
      rec.onend = () => setIsRecording(false);
      
      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access in your browser settings and try again.");
          setMicPermission("denied");
        } else if (event.error === "no-speech") {
          setError("No speech detected. Please speak clearly and try again.");
        } else if (event.error === "audio-capture") {
          setError("Microphone not available. Please check your microphone connection.");
        } else {
          setError(`Voice recognition error: ${event.error}`);
        }
        
        setIsRecording(false);
      };
      
      recognitionRef.current = rec;
      setVoiceSupported(true);
      
    } catch (e) {
      console.error("Failed to initialize speech recognition:", e);
      setVoiceSupported(false);
    }
  };

  async function checkAIBackendStatus() {
    try {
        const res = await fetch("https://artisan-aiservice-production.up.railway.app/health", { 
        method: "GET",
        signal: AbortSignal.timeout(2000)
      });
      setAiBackendStatus(res.ok ? "available" : "unavailable");
    } catch {
      setAiBackendStatus("unavailable");
    }
  }

  async function requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission("granted");
      setError(null);
      return true;
    } catch (e) {
      console.error("Failed to get microphone permission:", e);
      setMicPermission("denied");
      setError("Microphone permission denied. You can still type your notes or upload audio files.");
      return false;
    }
  }

  async function startRecording() {
    if (!recognitionRef.current || !voiceSupported) {
      setError("Voice input not supported in this browser. Try using the text area instead.");
      return;
    }
    
    if (micPermission === "denied") {
      setError("Microphone access is blocked. Please enable it in your browser settings.");
      return;
    }
    
    if (micPermission === "prompt") {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }
    
    setError(null);
    setIsRecording(true);
    
    try {
      recognitionRef.current.start();
      console.log("Started recording...");
    } catch (e) {
      console.error("Failed to start recording:", e);
      setError("Failed to start voice recording. Please try again.");
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      console.log("Stopped recording");
    } catch (e) {
      console.error("Failed to stop recording:", e);
    }
  }

   async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setError("Please select a product photo");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      const form = new FormData();
      form.append("image", imageFile);
      if (audioFile) form.append("audio", audioFile);
      if (note.trim()) form.append("note", note.trim());
      form.append("language_code", "en-US");
      form.append("model_name", "gemini-1.5-flash");

      console.log("🚀 Sending request to /api/storytelling");
      const res = await fetch("https://artisan-aiservice-production.up.railway.app/generate-story", { method: "POST", body: form });
      
      console.log("📡 Response status:", res.status, res.statusText);
      const data = await res.json();
      console.log("📦 Full response data:", data);
      
      if (!res.ok) {
        console.error("❌ Request failed:", data);
        throw new Error(data?.error || data?.message || "Failed to generate story");
      }
      
      let extractedResult = null;
      
      if (data.artisan_content) {
        extractedResult = data.artisan_content;
      } else if (data.data) {
        extractedResult = data.data;
      } else if (data.ai_response) {
        try {
          extractedResult = JSON.parse(data.ai_response);
        } catch (e) {
          console.error("Failed to parse ai_response:", e);
        }
      }
      
      console.log("🎯 Final extracted result:", extractedResult);
      
      if (extractedResult && extractedResult.title) {
        setResult(extractedResult);
        setSuccess("✅ Story generated successfully! You can now save it as a post.");
        console.log("✅ Result set successfully!");
      } else {
        console.error("❌ No valid result found in response");
        setError("Received response but couldn't extract story data. Check console for details.");
      }
      
    } catch (err: any) {
      console.error("💥 Error in onSubmit:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Save post function
  async function saveAsPost() {
    if (!result || !onPostCreated) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Upload image first if exists
      let imageUrl = undefined;
      if (imageFile) {
        console.log("About to upload image:", imageFile.name);
        const formData = new FormData();
        formData.append('image', imageFile);
        
        console.log("Making request to /api/uploads");
        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        console.log("Upload response status:", uploadRes.status);
        console.log("Upload response ok:", uploadRes.ok);

        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          console.log("Upload success:", uploadData);
          imageUrl = uploadData.url;
        }else {
        console.error("Upload failed:", uploadRes.status, uploadRes.statusText);
        }
      }

      // Call the callback with post data
      await onPostCreated({
        title: result.title,
        description: result.description,
        caption: result.caption,
        hashtags: result.hashtags,
        imageUrl: imageUrl,
      });

      // Clear the form
      setResult(null);
      setImageFile(null);
      setAudioFile(null);
      setNote("");
      setError(null);
      
      // Show success message
      setSuccess("🎉 Post saved successfully! Check the Posts tab to see it.");
      
    } catch (err: any) {
      console.error("Failed to save post:", err);
      setError("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }

  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("📋 Copied to clipboard!");
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }

  function drawPoster() {
    if (!canvasRef.current || !previewUrl || !result) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const W = 800; const H = 1000;
      canvas.width = W; canvas.height = H;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);

      const margin = 32;
      const imgH = 560;
      ctx.fillStyle = "#f3f3f3";
      ctx.fillRect(margin, margin, W - margin * 2, imgH);

      const aspect = img.width / img.height;
      let drawW = W - margin * 2;
      let drawH = drawW / aspect;
      if (drawH > imgH) { drawH = imgH; drawW = drawH * aspect; }
      const dx = margin + (W - margin * 2 - drawW) / 2;
      const dy = margin + (imgH - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);

      ctx.fillStyle = "#111";
      ctx.font = "bold 28px Arial";
      ctx.fillText(result.title, margin, imgH + margin + 36);

      ctx.fillStyle = "#333";
      ctx.font = "18px Arial";
      const caption = result.caption + "\n" + result.hashtags.map(h => `#${h}`).join(" ");
      wrapText(ctx, caption, margin, imgH + margin + 72, W - margin * 2, 26);

      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Made with Marketplace Assistant", margin, H - margin);
    };
    img.src = previewUrl;
  }

  function downloadPoster() {
    drawPoster();
    setTimeout(() => {
      const url = canvasRef.current?.toDataURL("image/png");
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = "story_poster.png";
      a.click();
      setSuccess("📥 Poster downloaded!");
    }, 50);
  }

  function getVoiceButtonContent() {
    if (micPermission === "denied") {
      return (
        <button 
          type="button" 
          onClick={() => setError("Please enable microphone access in your browser settings (🔒 lock icon in address bar)")}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100"
        >
          🔒 Mic Blocked
        </button>
      );
    }
    
    if (isRecording) {
      return (
        <button 
          type="button" 
          onClick={stopRecording} 
          className="rounded-md border border-foreground px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800 animate-pulse"
        >
          🛑 Stop Recording
        </button>
      );
    }
    
    return (
      <button 
        type="button" 
        onClick={startRecording} 
        className="rounded-md border border-foreground px-3 py-1.5 text-xs font-medium hover:bg-foreground/5"
      >
        🎤 Record Voice
      </button>
    );
  }

  return (
    <section className="border rounded-md p-4 space-y-3 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-lg">🎨 One-Click Story Generator</h2>
        <div className="flex items-center gap-2">
          {aiBackendStatus === "checking" && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded animate-pulse">Checking AI...</span>
          )}
          {aiBackendStatus === "available" && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">🤖 AI Ready</span>
          )}
          {aiBackendStatus === "unavailable" && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">📝 Template Mode</span>
          )}
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={e=>setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <span className="rounded-md border border-foreground px-3 py-1.5 text-xs font-medium hover:bg-foreground/5 inline-block">
                📸 {imageFile ? 'Change Image' : 'Choose Image'}
              </span>
            </label>
            
            <label className="cursor-pointer">
              <input 
                type="file" 
                accept="audio/*" 
                onChange={e=>setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <span className="rounded-md border border-foreground px-3 py-1.5 text-xs font-medium hover:bg-foreground/5 inline-block">
                🎵 {audioFile ? 'Change Audio' : 'Add Audio'}
              </span>
            </label>
            
            {voiceSupported ? getVoiceButtonContent() : (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                🚫 Voice not supported
              </span>
            )}
          </div>

          {imageFile && (
            <div className="text-xs text-gray-600">
              📁 Selected: {imageFile.name}
            </div>
          )}
          
          {audioFile && (
            <div className="text-xs text-gray-600">
              🎵 Audio: {audioFile.name}
            </div>
          )}
          
          <textarea 
            className="w-full border rounded-md p-3 min-h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder={voiceSupported ? "Type your product description here, or use the voice button above..." : "Type your product description here (voice not supported in this browser)"} 
            value={note} 
            onChange={e=>setNote(e.target.value)}
            rows={4}
          />
          
          <button 
            disabled={loading || !imageFile} 
            className="w-full rounded-md bg-foreground text-background px-4 py-3 text-sm font-medium disabled:opacity-60 hover:bg-foreground/90 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Story...
              </span>
            ) : "✨ Generate Story"}
          </button>

          {/* Status Messages */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          
          {!voiceSupported && (
            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              💡 Voice recording requires HTTPS or localhost. You can still type or upload audio files.
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          {previewUrl && (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="preview" 
                className="w-full h-52 object-cover rounded-md border shadow-sm" 
              />
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
          
          {result && (
            <div className="space-y-4 border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm">
              <div className="text-center">
                <h3 className="font-medium text-green-700 mb-2">🎉 Story Generated!</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-medium mb-1">📝 Title</p>
                  <p className="text-sm font-medium bg-white p-2 rounded border">{result.title}</p>
                  <button type="button" className="mt-1 text-xs underline text-blue-600 hover:text-blue-800" onClick={()=>copy(result.title)}>📋 Copy</button>
                </div>
                
                <div>
                  <p className="text-xs uppercase text-gray-500 font-medium mb-1">📄 Description</p>
                  <p className="text-sm whitespace-pre-wrap bg-white p-2 rounded border max-h-24 overflow-y-auto">{result.description}</p>
                  <button type="button" className="mt-1 text-xs underline text-blue-600 hover:text-blue-800" onClick={()=>copy(result.description)}>📋 Copy</button>
                </div>
                
                <div>
                  <p className="text-xs uppercase text-gray-500 font-medium mb-1">💬 Caption</p>
                  <p className="text-sm whitespace-pre-wrap bg-white p-2 rounded border">{result.caption}</p>
                  <button type="button" className="mt-1 text-xs underline text-blue-600 hover:text-blue-800" onClick={()=>copy(result.caption)}>📋 Copy</button>
                </div>
                
                <div>
                  <p className="text-xs uppercase text-gray-500 font-medium mb-1"># Hashtags</p>
                  <div className="flex flex-wrap gap-1 bg-white p-2 rounded border">
                    {result.hashtags.map((h, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        #{h}
                      </span>
                    ))}
                  </div>
                  <button type="button" className="mt-1 text-xs underline text-blue-600 hover:text-blue-800" onClick={()=>copy(result.hashtags.map(h=>`#${h}`).join(" "))}>📋 Copy All</button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t">
                {onPostCreated && (
                  <button 
                    type="button" 
                    onClick={saveAsPost}
                    disabled={saving}
                    className="flex-1 rounded-md bg-green-600 text-white px-3 py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : "📌 Save as Post"}
                  </button>
                )}
                <button 
                  type="button" 
                  className="rounded-md border border-foreground px-3 py-2.5 text-sm font-medium hover:bg-foreground/5 transition-colors" 
                  onClick={downloadPoster}
                >
                  📥 Download Poster
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </form>
    </section>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line.trim(), x, y);
}