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

  const analyzeText = async (textToAnalyze: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      if (!response.ok) {
        const errorData = await response.json();
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

  return { text, setText, segments, setSegments, readabilityScore, loading, error, analyzeText };
}
