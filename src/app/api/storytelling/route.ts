// src/app/api/storytelling/route.ts
import { NextRequest, NextResponse } from "next/server";

const STORYTELLING_API_URL = process.env.STORYTELLING_API_URL || "http://localhost:8000";

// Type definitions for the API responses
interface TranscriptionResponse {
  success: boolean;
  transcription?: string;
  confidence?: number;
  word_count?: number;
  character_count?: number;
  error?: string;
}

interface AIResponseResponse {
  success: boolean;
  ai_response?: string;
  error?: string;
}

interface CombinedResponse {
  success: boolean;
  transcription?: string;
  confidence?: number;
  word_count?: number;
  character_count?: number;
  ai_response?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get the endpoint from query params or default to combined
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint') || 'transcribe-and-respond';
    
    // Validate endpoint
    const validEndpoints = ['transcribe', 'generate-ai-response', 'transcribe-and-respond'];
    if (!validEndpoints.includes(endpoint)) {
      return NextResponse.json(
        { success: false, error: "Invalid endpoint" },
        { status: 400 }
      );
    }

    // Forward the request to the Python backend - FIXED: Use correct variable name
    const response = await fetch(`${STORYTELLING_API_URL}/generate-story`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FastAPI Error:', errorText);
      throw new Error(`Storytelling API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as CombinedResponse | TranscriptionResponse | AIResponseResponse;
    
    // Add some metadata about the processing
    const responseData = {
      ...data,
      processed_at: new Date().toISOString(),
      endpoint_used: endpoint,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error calling storytelling API:', error);
    
    // More specific error messages
    let errorMessage = "Failed to process storytelling request.";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = "Could not connect to the storytelling service. Please ensure the Python service is running.";
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  try {
    // Health check - ping the Python service
    const healthResponse = await fetch(`${STORYTELLING_API_URL}/health`, {
      method: 'GET',
    });

    const isHealthy = healthResponse.ok;
    
    return NextResponse.json({
      message: "AI Storytelling API Endpoint",
      service_status: isHealthy ? "healthy" : "unhealthy",
      python_service_url: STORYTELLING_API_URL,
      endpoints: {
        "POST /api/storytelling?endpoint=transcribe": "Convert audio to text only",
        "POST /api/storytelling?endpoint=generate-ai-response": "Generate AI response from text + optional image",
        "POST /api/storytelling?endpoint=transcribe-and-respond": "Combined transcription + AI response (default)",
      },
      supported_audio_formats: ["wav", "mp3", "m4a", "flac", "ogg", "webm"],
      supported_languages: ["en-US", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "hi-IN", "ja-JP", "ko-KR"],
    });
  } catch (error) {
    return NextResponse.json({
      message: "AI Storytelling API Endpoint",
      service_status: "unknown",
      python_service_url: STORYTELLING_API_URL,
      error: "Could not check Python service health",
      endpoints: {
        "POST /api/storytelling?endpoint=transcribe": "Convert audio to text only",
        "POST /api/storytelling?endpoint=generate-ai-response": "Generate AI response from text + optional image", 
        "POST /api/storytelling?endpoint=transcribe-and-respond": "Combined transcription + AI response (default)",
      }
    });
  }
}