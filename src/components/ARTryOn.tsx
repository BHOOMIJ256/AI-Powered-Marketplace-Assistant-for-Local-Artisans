"use client";

import { useState } from 'react';
import TranslatedText from './TranslatedText';

interface ARTryOnProps {
  productImageUrl: string;
  productName: string;
}

export default function ARTryOn({ productImageUrl, productName }: ARTryOnProps) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const startARTryOn = async () => {
    setStatus('starting');
    setError(null);
    
    try {
      // If no product image, use a placeholder or show demo mode
      if (!productImageUrl) {
        setStatus('active');
        setIsActive(true);
        alert(`AR Try-On Demo Mode!\n\nInstructions:\n- Use +/- to resize the product\n- Press 'p' to save a snapshot\n- Press 'q' or ESC to quit\n\nNote: This is a demo mode since no product image is available. In real mode, this would overlay the product image on your camera feed.`);
        return;
      }

      const response = await fetch('/api/ar-tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productImageUrl,
          action: 'start'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('active');
        setIsActive(true);
        
        // Show instructions
        alert(`AR Try-On Started!\n\nInstructions:\n- Use +/- to resize the product\n- Press 'p' to save a snapshot\n- Press 'q' or ESC to quit\n\nNote: This will open the AR application. Make sure your camera is connected.`);
      } else {
        throw new Error(data.error || 'Failed to start AR try-on');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to start AR try-on session');
    }
  };

  const stopARTryOn = () => {
    setStatus('idle');
    setIsActive(false);
    setError(null);
  };

  return (
    <div className="mt-3">
      {!isActive ? (
        <button
          onClick={startARTryOn}
          disabled={status === 'starting'}
          className="w-full rounded-md bg-gradient-to-r from-purple-600 to-amber-600 text-white px-4 py-2 text-sm font-medium hover:from-purple-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {status === 'starting' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <TranslatedText translationKey="startingAR" />
            </>
          ) : (
            <>
              <span className="text-lg">📱</span>
              <TranslatedText translationKey="tryInAR" />
              {!productImageUrl && <span className="text-xs opacity-75">(Demo)</span>}
            </>
          )}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-medium text-green-800">
                <TranslatedText translationKey="arSessionActive" />
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              <TranslatedText translationKey="arInstructions" />
            </p>
          </div>
          <button
            onClick={stopARTryOn}
            className="w-full rounded-md border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <TranslatedText translationKey="stopAR" />
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <span className="text-red-600">❌</span>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        <TranslatedText translationKey="arRequirement" />
      </div>
    </div>
  );
}
