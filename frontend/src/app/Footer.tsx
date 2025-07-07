'use client'

import Link from 'next/link';
import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function Footer() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <footer className="bg-transparent py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; 2025 DashAway. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/terms" className="hover:text-accent">Terms</Link>
            <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-accent">Refund Policy</Link>
            <button onClick={() => setShowFeedbackModal(true)} className="hover:text-accent">Feedback</button>
          </div>
        </div>
      </footer>
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
    </>
  );
}