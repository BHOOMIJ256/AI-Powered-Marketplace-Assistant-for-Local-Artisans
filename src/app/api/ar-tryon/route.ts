import { NextRequest, NextResponse } from "next/server";

const AR_BACKEND_URL = process.env.AR_BACKEND_URL || "http://localhost:8002";

export async function POST(request: NextRequest) {
  try {
    const { productImageUrl, action, camIndex = 0 } = await request.json();

    if (!productImageUrl) {
      return NextResponse.json({
        success: false,
        error: "Product image URL is required"
      }, { status: 400 });
    }

    // Convert relative URL to absolute URL for local images
    let fullImageUrl = productImageUrl;
    if (productImageUrl.startsWith('/uploads/')) {
      // For local uploaded images, convert to full URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      fullImageUrl = `${baseUrl}${productImageUrl}`;
    }

    console.log('Starting AR session for product:', fullImageUrl);

    // Call the Python backend
    const response = await fetch(`${AR_BACKEND_URL}/api/ar-tryon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productImageUrl: fullImageUrl,
        camIndex: camIndex
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: "AR Try-On session started successfully",
      sessionId: data.sessionId,
      instructions: data.instructions
    });

  } catch (error) {
    console.error('Error starting AR session:', error);
    
    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        success: false,
        error: "AR service is not available. Please make sure the AR backend is running.",
        hint: "Run: python ar_backend.py in your ai_backend directory"
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to start AR try-on session"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if AR backend is available
    const response = await fetch(`${AR_BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        message: "AR Try-On API Endpoint",
        backend_status: "connected",
        backend_info: data,
        endpoints: {
          "POST /api/ar-tryon": "Start AR try-on session for a product"
        }
      });
    } else {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    return NextResponse.json({
      message: "AR Try-On API Endpoint",
      backend_status: "disconnected",
      error: "AR backend service is not available",
      hint: "Run: python ar_backend.py in your ai_backend directory",
      endpoints: {
        "POST /api/ar-tryon": "Start AR try-on session for a product"
      }
    });
  }
}