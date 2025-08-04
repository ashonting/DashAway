'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Stats from './Stats'
import Popover from './Popover'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Features from './Features'
import Tooltip from './Tooltip'
import Toast from './Toast'
import GlobalCounter from './GlobalCounter';
import UpgradeModal from './UpgradeModal';
import WelcomeModal from './WelcomeModal';
import SampleContent from './SampleContent';
import ProductTour from './ProductTour';
import SignupCTAModal from './SignupCTAModal';
import PageHead from '@/components/PageHead';
import useTextAnalysis from '@/hooks/useTextAnalysis'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Download, FileText, FileCheck, Undo2, Redo2 } from 'lucide-react'

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

interface HistoryState {
  segments: Segment[];
  action: string;
  timestamp: number;
}

export default function Home() {
  const { text, setText, segments, setSegments, readabilityScore, loading, error, analyzeText, showUpgradeModal, setShowUpgradeModal, showSignupCTA, setShowSignupCTA } = useTextAnalysis();
  const { user } = useSupabaseAuth();
  const [activePopover, setActivePopover] = useState<number | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [activeType, setActiveType] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const outputBoxRef = useRef<HTMLDivElement>(null);
  
  // Undo/Redo functionality
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Progressive onboarding state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSampleContent, setShowSampleContent] = useState(false);
  const [showProductTour, setShowProductTour] = useState(false);
  // showSignupCTA now comes from useTextAnalysis hook
  
  const MAX_CHARS_FREE = 10000
  const MAX_CHARS_PRO = 500000 // 500K characters for Pro users
  const isProUser = user?.is_pro || false
  const maxChars = isProUser ? MAX_CHARS_PRO : MAX_CHARS_FREE

  // Add state to history
  const addToHistory = useCallback((newSegments: Segment[], action: string) => {
    const newHistoryState: HistoryState = {
      segments: [...newSegments],
      action,
      timestamp: Date.now()
    };
    
    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newHistoryState);
      
      // Keep only last 50 states to prevent memory issues
      return newHistory.slice(-50);
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setSegments(previousState.segments);
      setHistoryIndex(prev => prev - 1);
      
      // Announce to screen readers
      const announcement = `Undid ${previousState.action}`;
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), 1000);
    }
  }, [history, historyIndex, setSegments]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSegments(nextState.segments);
      setHistoryIndex(prev => prev + 1);
      
      // Announce to screen readers
      const announcement = `Redid ${nextState.action}`;
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), 1000);
    }
  }, [history, historyIndex, setSegments]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Check if user should see onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('dashaway-onboarding-completed');
    if (!hasSeenOnboarding && user) {
      setShowWelcomeModal(true);
    }
  }, [user]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('dashaway-onboarding-completed', 'true');
    setShowWelcomeModal(false);
  };

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    setShowProductTour(true);
  };

  const handleTrySample = () => {
    setShowWelcomeModal(false);
    setShowSampleContent(true);
  };

  const handleUseSample = (sampleText: string) => {
    setText(sampleText);
    setShowSampleContent(false);
    // Auto-analyze the sample text
    setTimeout(() => {
      analyzeText(sampleText);
    }, 500);
  };

  const handleCloseTour = () => {
    setShowProductTour(false);
    handleCompleteOnboarding();
  };

  const handleCloseSample = () => {
    setShowSampleContent(false);
    handleCompleteOnboarding();
  };

  const handleCleanText = useCallback(() => {
    if (text.trim() && !loading) {
      analyzeText(text);
    }
  }, [text, loading, analyzeText]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCleanText();
      }
      // Escape to close popovers
      if (e.key === 'Escape') {
        setActivePopover(null);
      }
      // Ctrl+Z or Cmd+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y or Cmd+Shift+Z to redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCleanText, undo, redo]);

  const handleReplace = (index: number, suggestion: string) => {
    const newSegments = [...segments];
    const segment = newSegments[index];

    if (segment.type === 'em_dash' && index > 0 && index < newSegments.length - 1) {
      // The punctuation segment's content is just the suggestion.
      segment.content = suggestion;

      // Adjust spacing of surrounding text segments.
      const prevSegment = newSegments[index - 1];
      const nextSegment = newSegments[index + 1];

      // 1. Reset spacing: remove space from end of previous and start of next.
      prevSegment.content = prevSegment.content.trimEnd();
      nextSegment.content = nextSegment.content.trimStart();

      // 2. Apply correct spacing based on English grammar rules.
      switch (suggestion.trim()) {
        case ',':
        case '.':
        case ';':
        case ':':
        case ')':
        case ']':
        case '}':
          // No space before, one space after.
          nextSegment.content = ' ' + nextSegment.content;
          break;
        case '(':
        case '[':
        case '{':
          // Space before, no space after.
          prevSegment.content = prevSegment.content + ' ';
          break;
        case '—':
          // Space before and after.
          prevSegment.content = prevSegment.content + ' ';
          nextSegment.content = ' ' + nextSegment.content;
          break;
        case '-':
          // No space on either side. The initial trim handles this.
          break;
        default:
          // Default for any other character.
          nextSegment.content = ' ' + nextSegment.content;
          break;
      }
    } else {
      // For other types (cliches, jargon) or if the dash is at the start/end,
      // replace the content and remove the highlight.
      newSegments[index] = { ...segment, content: suggestion, type: 'text' };
    }

    setSegments(newSegments);
    setActivePopover(null);
    
    // Add to history
    const oldContent = segment.content;
    addToHistory(newSegments, `replace "${oldContent}" with "${suggestion}"`);
    
    // Announce replacement to screen readers
    const announcement = `Replaced "${oldContent}" with "${suggestion}"`;
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
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
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 600);
  }

  const handleExportTxt = async () => {
    setExportLoading(true);
    try {
      const cleanedText = segments.map(s => s.content).join("");
      const blob = new Blob([cleanedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowToast(true);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 600);
    } finally {
      setExportLoading(false);
    }
  }

  const handleExportDocx = async () => {
    setExportLoading(true);
    try {
      const cleanedText = segments.map(s => s.content).join("");
      // Create a simple HTML document for Word compatibility
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cleaned Text - DashAway</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 40px;">
          <h1>Cleaned Text - DashAway</h1>
          <p style="color: #666; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString()}</p>
          <div style="white-space: pre-wrap;">${cleanedText}</div>
          <hr style="margin-top: 40px;">
          <p style="font-size: 12px; color: #999;">Humanized with DashAway - They&apos;ll never know AI wrote it</p>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned-text.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowToast(true);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 600);
    } finally {
      setExportLoading(false);
    }
  }

  const charCount = text.length
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const emDashCount = segments.filter(s => s.type === 'em_dash').length;
  const clicheCount = segments.filter(s => s.type === 'cliche').length;
  const jargonCount = segments.filter(s => s.type === 'jargon').length;
  const aiTellCount = segments.filter(s => s.type === 'ai_tell').length;
  const isOverLimit = charCount > maxChars

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
      <PageHead page="home" />
      <Hero />
      <GlobalCounter />
      <main id="tool" className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full">
          <div>
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl flex flex-col">
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <h2 className="text-lg font-semibold">Your Text</h2>
              </div>
              <div className="p-4 flex-grow">
                <textarea
                  className="w-full h-full min-h-[300px] lg:min-h-[400px] bg-transparent placeholder-white/50 focus:outline-none resize-none text-sm sm:text-base"
                  placeholder="Paste your AI-generated content here to humanize it..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  aria-label="Input text for cleaning"
                  aria-describedby="input-help"
                ></textarea>
              </div>
              <div id="input-help" className="sr-only">
                Paste or type your text here. The tool will identify em-dashes, clichés, jargon, and AI tells for you to review and replace.
              </div>
              <div className="p-3 lg:p-4 border-t border-white/10 flex-shrink-0 flex justify-between items-center text-xs sm:text-sm text-white/70">
                <div><span>{wordCount} Words</span></div>
                <div className={`${isOverLimit ? 'text-red-400' : ''}`}>
                  {isProUser ? (
                    <span>{charCount.toLocaleString()} Characters</span>
                  ) : (
                    <span>{charCount} / {maxChars.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
            <Tooltip text="Analyze your text for issues. Press Ctrl+Enter (Cmd+Enter on Mac) for quick access.">
              <button 
                onClick={handleCleanText} 
                disabled={loading || isOverLimit || !text.trim()} 
                className="mt-4 w-full px-4 sm:px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-2xl hover:scale-105 hover:from-teal-500 hover:to-purple-500 active:scale-95 transform transition-all duration-200 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 relative text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label={loading ? "Analyzing text, please wait" : "Analyze text for issues"}
                aria-describedby="clean-button-help"
              >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      Humanize AI Content
                      <span className="hidden sm:inline text-xs opacity-70 ml-2">(Ctrl+Enter)</span>
                    </>
                  )}
              </button>
            </Tooltip>
          </div>

          <div className={`bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl flex flex-col transition-all duration-300 ${loading ? 'animate-pulse' : ''} relative`} data-tour="output">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-semibold">Cleaned Output</h2>
            </div>
            <div ref={outputBoxRef} className="p-4 flex-grow overflow-y-auto h-[300px] lg:h-[400px]">
              <div className="text-white/90 whitespace-pre-wrap">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/60" role="status" aria-live="polite">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mb-4" aria-hidden="true"></div>
                    <p className="text-lg font-medium mb-2">Humanizing your AI content...</p>
                    <p className="text-sm mb-6">Detecting em-dashes, AI phrases, robotic language, and corporate jargon</p>
                    
                    {/* Loading Skeleton */}
                    <div className="w-full max-w-md space-y-3 animate-pulse">
                      <div className="flex space-x-4">
                        <div className="rounded-full bg-slate-700 h-4 w-4"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="rounded-full bg-slate-700 h-4 w-4"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                          <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="rounded-full bg-slate-700 h-4 w-4"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-700 rounded w-4/5"></div>
                          <div className="h-3 bg-slate-700 rounded w-3/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : segments.length > 0 ? segments.map((segment, index) => {
                  const isHighlightable = segment.type !== 'text';
                  const isHidden = hiddenTypes.has(segment.type);
                  const shouldHighlight = isHighlightable && !isHidden;

                  if (shouldHighlight) {
                    const typeLabels = {
                      'em_dash': 'Em dash',
                      'cliche': 'Cliché',
                      'jargon': 'Jargon',
                      'ai_tell': 'AI tell'
                    };
                    const typeLabel = typeLabels[segment.type as HighlightableSegmentType];
                    
                    return (
                      <span key={index} className="relative">
                        <button
                          className="cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit leading-inherit focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                          style={{ 
                            backgroundColor: `${highlightColors[segment.type as HighlightableSegmentType]}80`,
                            boxShadow: activePopover === index ? `0 0 0 2px ${highlightColors[segment.type as HighlightableSegmentType]}` : 'none'
                          }}
                          onClick={() => setActivePopover(index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActivePopover(index);
                            } else if (e.key === 'Escape') {
                              setActivePopover(null);
                            }
                          }}
                          aria-label={`${typeLabel}: ${segment.content}. Press Enter or Space to view replacement suggestions.`}
                          aria-describedby={`tooltip-${index}`}
                          aria-expanded={activePopover === index}
                          role="button"
                          tabIndex={0}
                        >
                          {segment.content}
                        </button>
                        <div id={`tooltip-${index}`} className="sr-only">
                          {typeLabel} detected. {segment.suggestions?.length || 0} replacement suggestions available.
                        </div>
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
                }) : (
                  <div className="flex items-center justify-center h-full text-white/60">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Your humanized content will appear here.</p>
                      <p className="text-sm mt-1">Paste AI-generated text in the left panel and click &quot;Humanize AI Content&quot; to get started.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 lg:p-4 border-t border-white/10 flex-shrink-0">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-3 mb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                    <Tooltip text="Enter text to replace all instances of the selected issue type.">
                      <input type="text" id="replace-all-input" className="w-full sm:w-auto bg-gray-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="Replace all with..." />
                    </Tooltip>
                    <Tooltip text={`Replace all ${activeType ? activeType.replace('_', ' ') + 's' : 'issues'}`}>
                      <button 
                        onClick={handleReplaceAll} 
                        disabled={!activeType || activeType === 'readability'} 
                        className="w-full sm:w-auto px-3 lg:px-5 py-2 bg-primary text-white font-bold rounded-lg hover:scale-105 hover:bg-primary/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100 text-sm"
                      >
                          Replace All
                      </button>
                    </Tooltip>
                </div>
                <div className="flex items-center space-x-2">
                  <Tooltip text="Undo last change (Ctrl+Z)">
                    <button 
                      onClick={undo} 
                      disabled={!canUndo} 
                      className="px-2 py-2 bg-gray-600 text-white rounded-lg hover:scale-105 hover:bg-gray-500 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      aria-label="Undo last change"
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Redo last undone change (Ctrl+Y)">
                    <button 
                      onClick={redo} 
                      disabled={!canRedo} 
                      className="px-2 py-2 bg-gray-600 text-white rounded-lg hover:scale-105 hover:bg-gray-500 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      aria-label="Redo last undone change"
                    >
                      <Redo2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Copy the cleaned text to your clipboard.">
                    <button 
                      onClick={handleCopyToClipboard} 
                      disabled={segments.length === 0} 
                      className={`px-3 lg:px-5 py-2 font-bold rounded-lg transition-all duration-200 disabled:opacity-50 text-sm relative overflow-hidden ${
                        showSuccessAnimation 
                          ? 'bg-green-600 hover:bg-green-500 scale-105 shadow-lg' 
                          : 'bg-gray-600 hover:bg-gray-500 hover:scale-105 active:scale-95'
                      } text-white`}
                    >
                      {showSuccessAnimation && (
                        <div className="absolute inset-0 bg-green-400 animate-ping rounded-lg opacity-75"></div>
                      )}
                      <span className="relative">Copy to Clipboard</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
              
              {segments.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-2 border-t border-white/5">
                  <span className="text-xs sm:text-sm text-white/60 sm:mr-2">Export as:</span>
                  <div className="flex space-x-2">
                    <Tooltip text="Download as plain text file">
                      <button 
                        onClick={handleExportTxt} 
                        disabled={exportLoading}
                        className={`px-2 sm:px-3 py-1 sm:py-2 text-white rounded-lg transition-all duration-200 flex items-center space-x-1 disabled:opacity-50 disabled:scale-100 active:scale-95 ${
                          showSuccessAnimation 
                            ? 'bg-green-600 hover:bg-green-500 scale-105 shadow-lg' 
                            : 'bg-gray-600 hover:bg-gray-500 hover:scale-105'
                        }`}
                      >
                        {exportLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        ) : (
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        <span className="text-xs sm:text-sm">TXT</span>
                      </button>
                    </Tooltip>
                    <Tooltip text="Download as Word document">
                      <button 
                        onClick={handleExportDocx} 
                        disabled={exportLoading}
                        className={`px-2 sm:px-3 py-1 sm:py-2 text-white rounded-lg transition-all duration-200 flex items-center space-x-1 disabled:opacity-50 disabled:scale-100 active:scale-95 ${
                          showSuccessAnimation 
                            ? 'bg-green-600 hover:bg-green-500 scale-105 shadow-lg' 
                            : 'bg-gray-600 hover:bg-gray-500 hover:scale-105'
                        }`}
                      >
                        {exportLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        ) : (
                          <FileCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        <span className="text-xs sm:text-sm">DOCX</span>
                      </button>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6" data-tour="stats">
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
      {error && !error.includes('You have used your 1 free try') && (
        <Toast message={error} show={true} onClose={() => {}} />
      )}
      
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        isAnonymous={!user}
      />
      
      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={handleCompleteOnboarding}
        onStartTour={handleStartTour}
        onTrySample={handleTrySample}
      />
      
      <SampleContent 
        isOpen={showSampleContent}
        onClose={handleCloseSample}
        onUseSample={handleUseSample}
      />
      
      <ProductTour 
        isOpen={showProductTour}
        onClose={handleCloseTour}
      />
      
      <SignupCTAModal 
        isOpen={showSignupCTA}
        onClose={() => setShowSignupCTA(false)}
      />
    </>
  )
}