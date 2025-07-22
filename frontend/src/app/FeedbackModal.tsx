'use client';

import { useState } from 'react';
import { X, Send, MessageSquare, Bug, Lightbulb } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<string>('bug');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, description: 'Report a problem or error' },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, description: 'Suggest a new feature or improvement' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, description: 'General comments or questions' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: feedbackType,
          content: content.trim(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setContent('');
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 2000);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Send Feedback</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Thank You!</h3>
              <p className="text-foreground/60">Your feedback has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  What type of feedback is this?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          feedbackType === type.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border/40 hover:bg-accent/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="feedbackType"
                          value={type.value}
                          checked={feedbackType === type.value}
                          onChange={(e) => setFeedbackType(e.target.value)}
                          className="sr-only"
                        />
                        <Icon className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{type.label}</div>
                          <div className="text-sm text-foreground/60">{type.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="feedback-content">
                  Your feedback
                </label>
                <textarea
                  id="feedback-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Please describe your feedback in detail..."
                  rows={5}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  required
                />
                <p className="text-xs text-foreground/50">
                  {content.length}/1000 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !content.trim() || content.length > 1000}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}