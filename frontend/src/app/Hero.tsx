'use client';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="text-center py-20">
            <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-teal-100 to-purple-100 dark:from-teal-900/30 dark:to-purple-900/30 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700">
                    🤖 Turn AI Content Into Human Writing
                </span>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
                <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">
                    They&apos;ll Never Know AI Wrote It
                </span>
            </h1>
            <p className="text-xl mt-4 max-w-2xl mx-auto text-foreground/80 leading-relaxed">
                Remove every trace of AI from ChatGPT, Claude, and other AI-generated content. DashAway instantly finds and removes em-dashes, robotic phrases, and AI &quot;tells&quot; that scream artificial intelligence—so you can use it confidently as your own.
            </p>
            <div className="mt-6 flex justify-center items-center gap-4 text-sm text-foreground/60">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>1 Free Try • No Signup Required</span>
                </div>
                <span>•</span>
                <span>Used by 1,000+ writers</span>
            </div>
            <div className="mt-8">
                <a href="#tool" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-2xl hover:scale-105 transform transition-all duration-200 shadow-lg text-lg">
                    Humanize My AI Content - FREE
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </a>
                <p className="text-xs text-foreground/50 mt-3">Remove AI fingerprints in seconds</p>
            </div>
        </section>
    );
}
