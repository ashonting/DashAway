'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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
  const currentRequestRef = useRef<AbortController | null>(null);

  const analyzeText = async (textToAnalyze: string) => {
    // Cancel any ongoing request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      console.log('Cancelled previous request');
    }
    
    setLoading(true);
    setError(null);
    setSegments([]); // Clear previous results
    setReadabilityScore(null); // Clear previous score
    setShowUpgradeModal(false); // Reset modal state
    
    console.log('Starting text analysis...', { textLength: textToAnalyze.length });
    
    try {
      // Get the current session token
      console.log('Getting session from Supabase...');
      let session = null;
      let sessionError = null;
      
      try {
        const result = await supabase.auth.getSession();
        session = result.data.session;
        sessionError = result.error;
      } catch (err) {
        console.error('Failed to get session:', err);
        sessionError = err;
      }
      
      console.log('Session retrieved:', { hasSession: !!session, error: sessionError });
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('Using auth token:', session.access_token.substring(0, 20) + '...');
      } else {
        console.log('No auth token available, proceeding without auth');
      }

      console.log('Sending request to backend...');
      const controller = new AbortController();
      currentRequestRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: textToAnalyze }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      currentRequestRef.current = null;

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

      console.log('Response received:', response.status);
      const data = await response.json();
      console.log('Data parsed successfully, segments:', data.segments?.length);
      setSegments(data.segments);
      setReadabilityScore(data.readability_score);
    } catch (e) {
      console.error('Error during text analysis:', e);
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          setError("Request timed out after 60 seconds. Please try with shorter text.");
        } else {
          setError(e.message);
        }
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
      currentRequestRef.current = null;
      console.log('Text analysis completed');
    }
  };

  return { text, setText, segments, setSegments, readabilityScore, loading, error, analyzeText, showUpgradeModal, setShowUpgradeModal };
}
