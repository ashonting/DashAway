'use client'

import { useState } from "react";

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState('bug');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:8000/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback_type: feedbackType, content }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="feedback_type" className="block mb-2">Feedback Type</label>
            <select id="feedback_type" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className="w-full bg-gray-700 rounded-lg p-2">
              <option value="bug">Bug Report</option>
              <option value="suggestion">Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block mb-2">Details</label>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full bg-gray-700 rounded-lg p-2"></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary rounded-lg">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
