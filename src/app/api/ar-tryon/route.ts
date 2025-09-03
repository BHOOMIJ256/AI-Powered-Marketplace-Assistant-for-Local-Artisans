import { NextRequest, NextResponse } from "next/server";

const AR_API_URL = process.env.AR_API_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const { productImageUrl, action } = await request.json();
    
    // For now, return the product image URL and instructions
    // In a full implementation, this would start the AR service
    return NextResponse.json({
      success: true,
      message: "AR Try-On service initiated",
      productImageUrl,
      instructions: {
        start: "Starting AR Try-On session...",
        controls: "Use +/- to resize, p to save snapshot, q/ESC to quit",
        status: "Ready to start AR session"
      }
    });

  } catch (error) {
    console.error('Error calling AR API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to start AR try-on session" 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AR Try-On API Endpoint",
    endpoints: {
      "POST /api/ar-tryon": "Start AR try-on session for a product"
    }
  });
}
