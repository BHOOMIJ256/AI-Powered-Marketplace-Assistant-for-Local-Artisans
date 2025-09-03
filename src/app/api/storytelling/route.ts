import { NextRequest, NextResponse } from "next/server";

const STORYTELLING_API_URL = process.env.STORYTELLING_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the Python FastAPI service
    const response = await fetch(`${STORYTELLING_API_URL}/transcribe-and-respond`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Storytelling API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error calling storytelling API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process storytelling request. Please ensure the Python service is running." 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Storytelling API Endpoint",
    endpoints: {
      "POST /api/storytelling": "Process audio + image for story generation"
    }
  });
}
