'use client';
import Link from 'next/link';
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function Footer() {
    const [showFeedback, setShowFeedback] = useState(false);

    return (
        <>
            <footer className="bg-gray-800/50 backdrop-blur-lg border-t border-white/10 mt-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 text-sm text-white/70">
                        <p>&copy; {new Date().getFullYear()} DashAway. All rights reserved.</p>
                        <div className="flex space-x-4 items-center">
                            <Link href="/pricing" className="hover:underline">Pricing</Link>
                            <Link href="/terms" className="hover:underline">Terms</Link>
                            <Link href="/privacy" className="hover:underline">Privacy</Link>
                            <Link href="/refund-policy" className="hover:underline">Refunds</Link>
                            <Link href="/faq" className="hover:underline">FAQ</Link>
                            <Link href="/contact" className="hover:underline">Contact</Link>
                            <button
                                onClick={() => setShowFeedback(true)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                            >
                                <MessageSquare className="h-3 w-3" />
                                Feedback
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
            
            <FeedbackModal 
                isOpen={showFeedback} 
                onClose={() => setShowFeedback(false)} 
            />
        </>
    );
}
