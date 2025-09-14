"use client";

import { useState } from "react";

interface ARTryOnProps {
  productImageUrl: string;
  productName: string;
}

export default function ARTryOn({ productImageUrl, productName }: ARTryOnProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  async function startARSession() {
    if (!productImageUrl) {
      setError("Product image not available for AR try-on");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ar-tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productImageUrl: productImageUrl,
          action: 'start',
          camIndex: 0 // Default camera
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        
        // Show success message with instructions
        alert(`AR Try-On Started Successfully!\n\nInstructions:\n${data.instructions?.controls || 'Use +/- to resize, p to save snapshot, q/ESC to quit'}\n\nThe AR window should open on your screen.`);
        
        console.log('AR Session started:', data);
      } else {
        setError(data.error || 'Failed to start AR session');
        
        if (data.hint) {
          console.warn('AR Backend Hint:', data.hint);
        }
      }
    } catch (error) {
      console.error('Error starting AR session:', error);
      setError('Network error: Could not connect to AR service');
    } finally {
      setIsLoading(false);
    }
  }

  async function stopARSession() {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/ar-tryon/stop/${sessionId}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(null);
        alert('AR Session stopped successfully');
      } else {
        console.error('Failed to stop AR session:', data.error);
      }
    } catch (error) {
      console.error('Error stopping AR session:', error);
    }
  }

  return (
    <div className="space-y-2">
      {/* AR Try-On Button */}
      <button
        onClick={startARSession}
        disabled={isLoading || !productImageUrl}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Starting AR...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Try AR</span>
          </>
        )}
      </button>

      {/* Stop Session Button (only shown when session is active) */}
      {sessionId && (
        <button
          onClick={stopARSession}
          className="w-full bg-red-600 text-white py-1 px-4 rounded-md hover:bg-red-700 text-sm"
        >
          Stop AR Session
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-xs p-2 bg-red-50 rounded border">
          {error}
          {error.includes('not available') && (
            <div className="mt-1 text-red-500">
              Make sure to run: <code>python ar_backend.py</code> in your ai_backend directory
            </div>
          )}
        </div>
      )}

      {/* Success/Info Message */}
      {sessionId && (
        <div className="text-green-600 text-xs p-2 bg-green-50 rounded border">
          AR session active (ID: {sessionId.slice(-8)})
          <br />
          Check for AR window on your desktop
        </div>
      )}
    </div>
  );
}