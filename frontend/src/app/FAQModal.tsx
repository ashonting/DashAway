'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFAQs();
    }
  }, [isOpen]);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faq`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-foreground/60 mt-2">Loading FAQs...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-8 text-center">
              <HelpCircle className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/60">No FAQs available at the moment.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-border/20 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    {openItems.has(faq.id) ? (
                      <ChevronDown className="h-5 w-5 text-foreground/60 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-foreground/60 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.has(faq.id) && (
                    <div className="px-4 pb-4 border-t border-border/10">
                      <div className="pt-3 text-foreground/80 whitespace-pre-wrap">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 p-4 bg-accent/20">
          <p className="text-sm text-foreground/60 text-center">
            Still have questions? Contact us at{' '}
            <a href="mailto:support@dashaway.io" className="text-primary hover:underline">
              support@dashaway.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}