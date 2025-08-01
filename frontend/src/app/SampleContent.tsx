'use client';

import { useState } from 'react';
import { X, Zap, Copy, Check } from 'lucide-react';

interface SampleContentProps {
  isOpen: boolean;
  onClose: () => void;
  onUseSample: (text: string) => void;
}

const sampleTexts = [
  {
    title: "ChatGPT Blog Post",
    description: "Typical AI-generated content with em-dashes and robotic phrases",
    content: `In today's rapidly evolving business landscape, organizations must delve into innovative strategies to leverage cutting-edge technologies. Furthermore, it&apos;s crucial to understand that—while AI can streamline operations—companies need to utilize comprehensive solutions that optimize their workflows.

The key is to harness the power of data-driven insights. Moreover, enterprises should implement robust frameworks that facilitate seamless integration. At the end of the day, businesses that embrace these transformative approaches will undoubtedly gain a competitive advantage.

It&apos;s worth noting that—despite initial challenges—organizations can achieve remarkable results through strategic implementation. Additionally, stakeholders must collaborate effectively to ensure sustainable growth and maximize ROI.`
  },
  {
    title: "Claude Academic Paper",
    description: "Formal AI writing with excessive jargon and em-dashes",
    content: `This comprehensive analysis seeks to elucidate the multifaceted dimensions of contemporary organizational paradigms. The research methodology employed—a mixed-methods approach—enables a nuanced understanding of complex phenomena.

Furthermore, the findings demonstrate that organizations must navigate intricate challenges while simultaneously capitalizing on emerging opportunities. It&apos;s important to note that—contrary to conventional wisdom—traditional frameworks may prove inadequate in addressing modern complexities.

Subsequently, this investigation reveals that stakeholders should prioritize innovative solutions that enhance operational efficiency. Moreover, the implications of these findings suggest that organizations must fundamentally reconsider their strategic approaches to remain competitive in today's dynamic marketplace.`
  },
  {
    title: "AI Marketing Copy",
    description: "Sales-focused content with AI tells and corporate buzzwords",
    content: `Unlock unprecedented growth potential with our revolutionary solution! In today's competitive landscape, businesses need to leverage cutting-edge technologies to stay ahead.

Our comprehensive platform enables organizations to streamline their operations while maximizing efficiency. Furthermore, clients can utilize advanced features that—without a doubt—deliver exceptional results.

At the end of the day, it&apos;s all about driving meaningful outcomes. That&apos;s why industry leaders choose our innovative approach to transform their workflows and achieve sustainable success. Don&apos;t miss out on this game-changing opportunity to revolutionize your business!`
  }
];

export default function SampleContent({ isOpen, onClose, onUseSample }: SampleContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyText = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleUseSample = (text: string) => {
    onUseSample(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">Try Sample AI Content</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              See DashAway in action with real AI-generated text examples
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {sampleTexts.map((sample, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{sample.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{sample.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyText(sample.content, index)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleUseSample(sample.content)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:from-teal-500 hover:to-purple-500 transition-all duration-200"
                    >
                      <Zap className="h-4 w-4" />
                      Use This Sample
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {sample.content}
                  </pre>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 text-xs rounded-full border border-teal-200 dark:border-teal-700">
                    <Zap className="h-3 w-3 mr-1" />
                    Em-dashes detected
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full border border-purple-200 dark:border-purple-700">
                    Robotic phrases
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs rounded-full border border-orange-200 dark:border-orange-700">
                    Corporate jargon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            💡 <strong>Tip:</strong> After using a sample, click &quot;Humanize AI Content&quot; to see DashAway detect and fix AI tells in real-time.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}