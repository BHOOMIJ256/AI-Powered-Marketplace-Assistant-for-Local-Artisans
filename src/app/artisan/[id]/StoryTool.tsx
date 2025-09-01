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

export default function StoryTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    description: string;
    caption: string;
    hashtags: string[];
    title: string;
  }>(null);
  const [aiBackendStatus, setAiBackendStatus] = useState<"checking" | "available" | "unavailable">("checking");

  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check microphone permission and voice support
    const checkVoiceSupport = async () => {
      try {
        // Check if voice recording is supported
        const SR = (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition));
        if (!SR) {
          setVoiceSupported(false);
          return;
        }

        // Check microphone permission
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setMicPermission(permission.state);
            
            permission.onchange = () => {
              setMicPermission(permission.state);
            };
          } catch (e) {
            console.log("Permission API not supported, will prompt user");
            setMicPermission("prompt");
          }
        } else {
          setMicPermission("prompt");
        }

        // Initialize speech recognition
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
        
        rec.onend = () => {
          setIsRecording(false);
        };
        
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

    checkVoiceSupport();
    checkAIBackendStatus();
  }, []);

  async function checkAIBackendStatus() {
    try {
      const res = await fetch("http://localhost:8000/health", { 
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
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
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
    
    // Check permission first
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
    setNote(""); // Clear previous note when starting new recording
    
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
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", imageFile);
      if (audioFile) form.append("audio", audioFile);
      if (note.trim()) form.append("note", note.trim());

      const res = await fetch("/api/generate-story", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to generate story");
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
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
          className="rounded-md border border-foreground px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800"
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
    <section className="border rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">One-Click Story Generator</h2>
        <div className="flex items-center gap-2">
          {aiBackendStatus === "checking" && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">Checking AI...</span>
          )}
          {aiBackendStatus === "available" && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">🤖 AI Backend Available</span>
          )}
          {aiBackendStatus === "unavailable" && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">📝 Template Mode</span>
          )}
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0] || null)} />
            <input type="file" accept="audio/*" onChange={e=>setAudioFile(e.target.files?.[0] || null)} />
            {voiceSupported ? getVoiceButtonContent() : (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                🚫 Voice not supported
              </span>
            )}
          </div>
          <textarea 
            className="w-full border rounded p-2 min-h-24" 
            placeholder={voiceSupported ? "Type your note here, or use the voice button above" : "Type your product description here (voice not supported in this browser)"} 
            value={note} 
            onChange={e=>setNote(e.target.value)} 
          />
          <button disabled={loading || !imageFile} className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-60">
            {loading ? "Generating..." : "Generate Story"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!voiceSupported && (
            <p className="text-xs text-gray-500">
              💡 Tip: Voice recording requires HTTPS or localhost. You can still type your notes or upload audio files.
            </p>
          )}
          {micPermission === "denied" && (
            <p className="text-xs text-red-600">
              🔒 Microphone access blocked. Click the lock icon in your browser address bar to enable it.
            </p>
          )}
        </div>
        <div className="space-y-2">
          {previewUrl && <img src={previewUrl} alt="preview" className="w-full h-52 object-cover rounded border" />}
          {result && (
            <div className="space-y-2">
              <div>
                <p className="text-xs uppercase text-gray-500">Description</p>
                <p className="text-sm whitespace-pre-wrap">{result.description}</p>
                <button type="button" className="mt-1 text-xs underline" onClick={()=>copy(result.description)}>Copy</button>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Caption</p>
                <p className="text-sm whitespace-pre-wrap">{result.caption}</p>
                <button type="button" className="mt-1 text-xs underline" onClick={()=>copy(result.caption)}>Copy</button>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Hashtags</p>
                <p className="text-sm">{result.hashtags.map(h=>`#${h}`).join(" ")}</p>
                <button type="button" className="mt-1 text-xs underline" onClick={()=>copy(result.hashtags.map(h=>`#${h}`).join(" "))}>Copy</button>
              </div>
              <div className="pt-2">
                <button type="button" className="rounded-md border border-foreground px-3 py-1.5 text-xs font-medium hover:bg-foreground/5" onClick={downloadPoster}>Download Poster</button>
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
