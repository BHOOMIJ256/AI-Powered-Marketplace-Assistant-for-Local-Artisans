// src/app/api/storytelling/route.ts
import { NextRequest, NextResponse } from "next/server";

// Remove trailing slash if it exists
const STORYTELLING_API_URL = (process.env.STORYTELLING_API_URL || "http://localhost:8000").replace(/\/$/, '');

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
    
    // Debug logging
    console.log("STORYTELLING_API_URL:", STORYTELLING_API_URL);
    const targetUrl = `${STORYTELLING_API_URL}/generate-story`;
    console.log("Target URL:", targetUrl);
    
    // Get the endpoint from query params (for backwards compatibility)
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint') || 'transcribe-and-respond';

    // Forward the request to the Python backend
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
      headers: {
        // Let fetch handle Content-Type for FormData automatically
      }
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FastAPI Error Response:', errorText);
      throw new Error(`Storytelling API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as BackendResponse;
    console.log("Backend response success:", data.success);
    console.log("Backend response data keys:", Object.keys(data));
    
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
      if (error.message.includes('fetch') || 
          error.message.includes('ENOTFOUND') || 
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('network')) {
        errorMessage = `Could not connect to storytelling service at ${STORYTELLING_API_URL}. Service may be down.`;
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        debug: {
          storytelling_url: STORYTELLING_API_URL,
          target_url: `${STORYTELLING_API_URL}/generate-story`,
          error_type: error instanceof Error ? error.constructor.name : typeof error
        },
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  try {
    const healthUrl = `${STORYTELLING_API_URL}/health`;
    console.log("Health check URL:", healthUrl);
    
    // Health check - ping the Python service
    const healthResponse = await fetch(healthUrl, {
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
      health_check_url: healthUrl,
      backend_health: healthData,
      endpoints: {
        "POST /api/storytelling": "Generate artisan product content from image + optional audio/text",
        "POST /api/storytelling?endpoint=transcribe-and-respond": "Legacy endpoint (same as above)",
      },
      supported_audio_formats: ["wav", "mp3", "m4a", "flac", "ogg", "webm"],
      supported_languages: ["en-US", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "hi-IN", "ja-JP", "ko-KR"],
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      message: "AI Storytelling API Endpoint",
      service_status: "unknown",
      python_service_url: STORYTELLING_API_URL,
      error: "Could not check Python service health",
      error_details: error instanceof Error ? error.message : "Unknown error",
      endpoints: {
        "POST /api/storytelling": "Generate artisan product content from image + optional audio/text",
        "POST /api/storytelling?endpoint=transcribe-and-respond": "Legacy endpoint (same as above)",
      }
    });
  }
}