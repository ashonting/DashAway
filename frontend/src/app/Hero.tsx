'use client';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="text-center py-20">
            <h1 className="text-5xl font-bold text-text">Write with Clarity. Instantly.</h1>
            <p className="text-xl text-text/80 mt-4 max-w-2xl mx-auto">
                DashAway helps you find and fix em-dashes, cliches, and jargon to make your writing more impactful.
                Try it below or sign up to save your work and unlock more features.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
                <a href="#tool" className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform">
                    Try the Tool
                </a>
                <a href="#how-it-works" className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:scale-105 transition-transform">
                    How It Works
                </a>
            </div>
        </section>
    );
}
