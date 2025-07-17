'use client'

import { useState, useRef } from 'react'
import Stats from './Stats'
import Popover from './Popover'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Features from './Features'
import Tooltip from './Tooltip'
import Toast from './Toast'
import useTextAnalysis from '@/hooks/useTextAnalysis'

export const dynamic = 'force-dynamic';

interface Segment {
  type: 'text' | 'em_dash' | 'cliche' | 'jargon' | 'ai_tell';
  content: string;
  suggestions?: string[];
}

const highlightColors = {
    'em_dash': '#14b8a6',
    'cliche': '#8b5cf6',
    'jargon': '#f59e0b',
    'ai_tell': '#ec4899',
}

type HighlightableSegmentType = keyof typeof highlightColors;

export default function Home() {
  const { text, setText, segments, setSegments, readabilityScore, loading, error, analyzeText } = useTextAnalysis();
  const [activePopover, setActivePopover] = useState<number | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [activeType, setActiveType] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const outputBoxRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 10000

  const handleCleanText = () => {
    analyzeText(text);
  };

  const handleReplace = (index: number, suggestion: string) => {
    const newSegments = [...segments];
    
    // If the suggestion is a punctuation mark, merge it with the previous segment.
    if ([',', ';', ':', '.'].includes(suggestion.trim()) && index > 0 && index < newSegments.length - 1) {
        const prevSegment = newSegments[index - 1];
        const nextSegment = newSegments[index + 1];

        // Merge the previous segment, the suggestion, and the next segment
        prevSegment.content = prevSegment.content.trimEnd() + suggestion + ' ' + nextSegment.content.trimStart();
        
        // Remove the dash and the now-merged next segment
        newSegments.splice(index, 2);
    } else {
        newSegments[index].content = suggestion;
    }

    setSegments(newSegments);
    setActivePopover(null);
  }

  const handleReplaceAll = () => {
    if (!activeType || activeType === 'readability') {
      alert("Please select an issue type by clicking on one of the stat boxes below.");
      return;
    }
    const replacementText = (document.getElementById('replace-all-input') as HTMLInputElement).value;
    const newSegments = segments.map(segment => 
        segment.type === activeType ? { ...segment, content: replacementText, type: 'text' as const, suggestions: [] } : segment
    );
    setSegments(newSegments);
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(segments.map(s => s.content).join(""));
    setShowToast(true);
  }

  const charCount = text.length
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const emDashCount = segments.filter(s => s.type === 'em_dash').length;
  const clicheCount = segments.filter(s => s.type === 'cliche').length;
  const jargonCount = segments.filter(s => s.type === 'jargon').length;
  const aiTellCount = segments.filter(s => s.type === 'ai_tell').length;
  const isOverLimit = charCount > MAX_CHARS

  const handleToggleHiddenType = (type: string) => {
    setHiddenTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  return (
    <>
      <Hero />
      <main id="tool" className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          <div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl flex flex-col">
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-lg font-semibold">Your Text</h2>
              </div>
              <div className="p-4 flex-grow">
                <textarea
                  className="w-full h-full min-h-[400px] bg-transparent placeholder-white/50 focus:outline-none resize-none"
                  placeholder="Paste your text here to start cleaning..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </div>
              <div className="p-4 border-t border-white/10 flex-shrink-0 flex justify-between items-center text-sm text-white/70">
                <div><span>{wordCount} Words</span></div>
                <div className={`${isOverLimit ? 'text-red-400' : ''}`}>
                  <span>{charCount} / {MAX_CHARS}</span>
                </div>
              </div>
            </div>
            <Tooltip text="Analyze your text for issues.">
              <button onClick={handleCleanText} disabled={loading} className="mt-4 w-full px-5 py-3 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50">
                  {loading ? 'Cleaning...' : 'Clean Text Now'}
              </button>
            </Tooltip>
          </div>

          <div className={`bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl flex flex-col transition-all duration-300 ${loading ? 'animate-pulse' : ''} relative`}>
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-semibold">Cleaned Output</h2>
            </div>
            <div ref={outputBoxRef} className="p-4 flex-grow overflow-y-auto h-[400px]">
              <div className="text-white/90 whitespace-pre-wrap">
                {segments.length > 0 ? segments.map((segment, index) => {
                  const isHighlightable = segment.type !== 'text';
                  const isHidden = hiddenTypes.has(segment.type);
                  const shouldHighlight = isHighlightable && !isHidden;

                  if (shouldHighlight) {
                    return (
                      <span key={index} className="relative">
                        <span
                          className="cursor-pointer"
                          style={{ backgroundColor: `${highlightColors[segment.type as HighlightableSegmentType]}80` }}
                          onClick={() => setActivePopover(index)}
                        >
                          {segment.content}
                        </span>
                        {activePopover === index && (
                          <Popover
                            onSelect={(suggestion) => handleReplace(index, suggestion)}
                            onClose={() => setActivePopover(null)}
                            suggestions={segment.type === 'em_dash' ? ['—', ...(segment.suggestions || [])] : (segment.suggestions || [])}
                            disableReplace={false}
                            containerRef={outputBoxRef}
                          />
                        )}
                      </span>
                    );
                  }
                  return <span key={index}>{segment.content}</span>;
                }) : "Your cleaned text will appear here."}
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex-shrink-0 flex justify-end items-center space-x-3">
                <div className="flex items-center space-x-2">
                    <Tooltip text="Enter text to replace all instances of the selected issue type.">
                      <input type="text" id="replace-all-input" className="bg-gray-700 text-white rounded-lg px-3 py-2" placeholder="Replace all with..." />
                    </Tooltip>
                    <Tooltip text={`Replace all ${activeType ? activeType.replace('_', ' ') + 's' : 'issues'}`}>
                      <button onClick={handleReplaceAll} disabled={!activeType || activeType === 'readability'} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50">
                          Replace All
                      </button>
                    </Tooltip>
                </div>
                <div className="flex-grow"></div>
                <Tooltip text="Copy the cleaned text to your clipboard.">
                  <button onClick={handleCopyToClipboard} className="px-5 py-2 bg-gray-600 text-white font-bold rounded-lg hover:scale-105 transition-transform">
                      Copy to Clipboard
                  </button>
                </Tooltip>
            </div>
          </div>
        </div>
        <div className="mt-6">
            <Stats 
              emDashes={emDashCount} 
              cliches={clicheCount} 
              jargon={jargonCount} 
              aiTells={aiTellCount} 
              readabilityScore={readabilityScore} 
              hiddenTypes={hiddenTypes}
              activeType={activeType}
              onToggle={handleToggleHiddenType}
              onSetActive={setActiveType}
            />
        </div>
      </main>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Features />
      <Toast message="Copied to clipboard!" show={showToast} onClose={() => setShowToast(false)} />
      {error && <Toast message={error} show={true} onClose={() => {}} />}
    </>
  )
}