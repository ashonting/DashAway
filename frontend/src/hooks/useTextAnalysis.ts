'use client';
import { useState } from 'react';

interface Segment {
  type: 'text' | 'em_dash' | 'cliche' | 'jargon' | 'ai_tell';
  content: string;
  suggestions?: string[];
}

export default function useTextAnalysis() {
  const [text, setText] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [readabilityScore, setReadabilityScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const analyzeText = async (textToAnalyze: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ text: textToAnalyze }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if this is a usage limit error
        if (response.status === 403 && errorData.detail) {
          if (errorData.detail.includes("1 free try")) {
            setShowUpgradeModal(true);
            return; // Don't throw error, show modal instead
          } else if (errorData.detail.includes("2 monthly uses")) {
            setShowUpgradeModal(true);
            return; // Don't throw error, show modal instead
          }
        }
        
        throw new Error(errorData.detail || "An unknown error occurred");
      }

      const data = await response.json();
      setSegments(data.segments);
      setReadabilityScore(data.readability_score);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { text, setText, segments, setSegments, readabilityScore, loading, error, analyzeText, showUpgradeModal, setShowUpgradeModal };
}
