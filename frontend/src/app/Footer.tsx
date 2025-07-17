'use client';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-800/50 backdrop-blur-lg border-t border-white/10 mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 text-sm text-white/70">
                    <p>&copy; {new Date().getFullYear()} DashAway. All rights reserved.</p>
                    <div className="flex space-x-4">
                        <Link href="/terms" className="hover:underline">Terms</Link>
                        <Link href="/privacy" className="hover:underline">Privacy</Link>
                        <Link href="/refund-policy" className="hover:underline">Refunds</Link>
                        <Link href="/faq" className="hover:underline">FAQ</Link>
                        <Link href="/contact" className="hover:underline">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
