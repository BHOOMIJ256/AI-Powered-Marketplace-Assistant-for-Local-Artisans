// src/app/api/storytelling/route.ts
import { NextRequest, NextResponse } from "next/server";

const STORYTELLING_API_URL = process.env.STORYTELLING_API_URL || "http://localhost:8000";

// Type definitions for the API responses
interface ProcessingInfo {
  has_audio_input: boolean;
  has_text_input: boolean;
  transcription_confidence: number;
  image_processed: boolean;
  model_used: string;
  language_code: string;
}

interface ArtisanContent {
  title: string;
  description: string;
  caption: string;
  hashtags: string[];
}

interface BackendResponse {
  success: boolean;
  data?: ArtisanContent;
  error?: string;
  processing_info?: ProcessingInfo;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get the endpoint from query params (for backwards compatibility)
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint') || 'transcribe-and-respond';

    // Forward the request to the Python backend - FIXED: Use correct endpoint
    const response = await fetch(`${STORYTELLING_API_URL}/generate-story`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FastAPI Error:', errorText);
      throw new Error(`Storytelling API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as BackendResponse;
    
    // Transform the response to match expected frontend format
    const responseData = {
      success: data.success,
      // Map the new backend response to old format for compatibility
      transcription: data.processing_info?.has_audio_input ? "Audio processed" : undefined,
      confidence: data.processing_info?.transcription_confidence || 0,
      ai_response: data.success ? JSON.stringify(data.data) : undefined,
      // Include new data structure
      artisan_content: data.data,
      processing_info: data.processing_info,
      error: data.error,
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
    let healthData = null;
    
    if (isHealthy) {
      try {
        healthData = await healthResponse.json();
      } catch (e) {
        console.warn('Could not parse health response JSON');
      }
    }
    
    return NextResponse.json({
      message: "AI Storytelling API Endpoint",
      service_status: isHealthy ? "healthy" : "unhealthy",
      python_service_url: STORYTELLING_API_URL,
      backend_health: healthData,
      endpoints: {
        "POST /api/storytelling": "Generate artisan product content from image + optional audio/text",
        "POST /api/storytelling?endpoint=transcribe-and-respond": "Legacy endpoint (same as above)",
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
        "POST /api/storytelling": "Generate artisan product content from image + optional audio/text",
        "POST /api/storytelling?endpoint=transcribe-and-respond": "Legacy endpoint (same as above)",
      }
    });
  }
}