  'use client'

import { useState } from 'react'
import Stats from './Stats'
import Popover from './Popover'

interface Segment {
  type: 'text' | 'em_dash' | 'cliche' | 'jargon' | 'ai_tell' | 'complex_word' | 'long_sentence';
  content: string;
  suggestions?: string[];
}

const highlightColors = {
    'em_dash': 'bg-primary/50',
    'cliche': 'bg-secondary/50',
    'jargon': 'bg-accent/50',
    'ai_tell': 'bg-pink-500/50',
    'complex_word': 'bg-orange-500/50',
    'long_sentence': 'bg-red-500/50',
}

export default function Home() {
  const [text, setText] = useState('')
  const [segments, setSegments] = useState<Segment[]>([])
  const [activePopover, setActivePopover] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [readabilityScore, setReadabilityScore] = useState<number | null>(null)
  const MAX_CHARS = 10000

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleCleanText = async () => {
    setLoading(true);
    console.log("Cleaning text...");
    try {
      const [processResponse, readabilityResponse] = await Promise.all([
        fetch('http://localhost:8000/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        }),
        fetch('http://localhost:8000/readability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        }),
      ]);

      if (!processResponse.ok || !readabilityResponse.ok) {
        console.error("Response not OK");
        return;
      }

      const processData = await processResponse.json();
      const readabilityData = await readabilityResponse.json();

      if (processData.error || readabilityData.error) {
        console.error("Backend error:", processData.error || readabilityData.error);
        return;
      }

      // Combine the segments from both endpoints
      const combinedSegments = [...processData.segments];

      // Add complex words to the segments
      if (readabilityData.complex_words) {
        for (const word in readabilityData.complex_words) {
          const suggestions = readabilityData.complex_words[word];
          const regex = new RegExp(`\b${word}\b`, 'gi');
          const newSegments: Segment[] = [];
          for (const segment of combinedSegments) {
            if (segment.type === 'text') {
              const parts = segment.content.split(regex);
              for (let i = 0; i < parts.length - 1; i++) {
                newSegments.push({ type: 'text', content: parts[i] });
                newSegments.push({ type: 'complex_word', content: word, suggestions });
              }
              newSegments.push({ type: 'text', content: parts[parts.length - 1] });
            } else {
              newSegments.push(segment);
            }
          }
          combinedSegments.splice(0, combinedSegments.length, ...newSegments);
        }
      }

      // Add long sentences to the segments
      if (readabilityData.long_sentences) {
        for (const sentence in readabilityData.long_sentences) {
            const suggestions = readabilityData.long_sentences[sentence];
            const newSegments: Segment[] = [];
            for (const segment of combinedSegments) {
                if (segment.type === 'text' && segment.content.includes(sentence)) {
                    const parts = segment.content.split(sentence);
                    newSegments.push({ type: 'text', content: parts[0] });
                    newSegments.push({ type: 'long_sentence', content: sentence, suggestions });
                    newSegments.push({ type: 'text', content: parts[1] });
                } else {
                    newSegments.push(segment);
                }
            }
            combinedSegments.splice(0, combinedSegments.length, ...newSegments);
        }
      }


      setSegments(combinedSegments);
      setReadabilityScore(readabilityData.readability_score);

    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = (index: number, suggestion: string) => {
    const newSegments = [...segments];
    newSegments[index].content = suggestion;
    setSegments(newSegments);
    setActivePopover(null);
  }

  const handleReplaceAll = (type: 'em_dash' | 'cliche' | 'jargon' | 'ai_tell') => {
    const replacementText = (document.getElementById('replace-all-input') as HTMLInputElement).value;
    const newSegments = segments.map(segment => {
        if (segment.type === type) {
            return { type: 'text', content: replacementText };
        }
        return segment;
    });
    setSegments(newSegments);
  }

  const charCount = text.length
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const emDashCount = segments.filter(s => s.type === 'em_dash').length;
  const clicheCount = segments.filter(s => s.type === 'cliche').length;
  const jargonCount = segments.filter(s => s.type === 'jargon').length;
  const aiTellCount = segments.filter(s => s.type === 'ai_tell').length;
  const complexWordCount = segments.filter(s => s.type === 'complex_word').length;
  const longSentenceCount = segments.filter(s => s.type === 'long_sentence').length;
  const isOverLimit = charCount > MAX_CHARS

  return (
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Left Panel */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl flex flex-col">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-semibold">Your Text</h2>
            </div>
            <div className="p-4 flex-grow">
              <textarea
                className="w-full h-full min-h-[400px] bg-transparent placeholder-white/50 focus:outline-none resize-none"
                placeholder="Paste your text here to start cleaning..."
                value={text}
                onChange={handleTextChange}
              ></textarea>
            </div>
            <div className="p-4 border-t border-white/10 flex-shrink-0 flex justify-between items-center text-sm text-white/70">
              <div>
                <span>{wordCount} Words</span>
              </div>
              <div className={`${isOverLimit ? 'text-red-400' : ''}`}>
                <span>{charCount} / {MAX_CHARS}</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl flex flex-col">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-semibold">Cleaned Output</h2>
            </div>
            <div className="p-4 flex-grow">
              <div className="text-white/90 whitespace-pre-wrap">
                {segments.length > 0 ? segments.map((segment, index) => (
                  <span key={index} className={segment.type !== 'text' ? 'relative' : ''}>
                    {segment.type !== 'text' ? (
                      <span
                        className={`${highlightColors[segment.type]} cursor-pointer`}
                        onClick={() => setActivePopover(index)}
                      >
                        {segment.content}
                      </span>
                    ) : (
                      segment.content
                    )}
                    {activePopover === index && (
                      <Popover
                        onSelect={(suggestion) => handleReplace(index, suggestion)}
                        onClose={() => setActivePopover(null)}
                        suggestions={segment.suggestions || []}
                        disableReplace={segment.type === 'long_sentence'}
                      />
                    )}
                  </span>
                )) : "Your cleaned text will appear here."}
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex-shrink-0 flex justify-end items-center space-x-3">
                <div className="flex items-center space-x-2">
                    <input type="text" id="replace-all-input" className="bg-gray-700 text-white rounded-lg px-3 py-2" placeholder="Replace all with..." />
                    <button onClick={() => handleReplaceAll('em_dash')} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform">
                        Replace All Em-Dashes
                    </button>
                </div>
                <div className="flex-grow"></div>
                <button onClick={() => navigator.clipboard.writeText(segments.map(s => s.content).join(""))} className="px-5 py-2 bg-gray-600 text-white font-bold rounded-lg hover:scale-105 transition-transform">
                    Copy to Clipboard
                </button>
                <button onClick={handleCleanText} disabled={loading} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50">
                    {loading ? 'Cleaning...' : 'Clean Text'}
                </button>
            </div>
          </div>
        </div>
        <div className="mt-6">
            <Stats emDashes={emDashCount} cliches={clicheCount} jargon={jargonCount} aiTells={aiTellCount} readabilityScore={readabilityScore} complexWords={complexWordCount} longSentences={longSentenceCount} />
        </div>
      </main>
  )
}
