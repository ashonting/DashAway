'use client';

export default function HowItWorks() {
    return (
        <section className="py-20">
            <h2 className="text-4xl font-bold text-text text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10">
                    <div className="text-5xl mb-4">1.</div>
                    <h3 className="text-2xl font-bold text-white">Paste & Analyze</h3>
                    <p className="text-white/70 mt-2">
                        Simply paste your text into the editor. DashAway automatically scans for em-dashes, cliches, jargon, and common AI phrases that make writing feel robotic.
                    </p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10">
                    <div className="text-5xl mb-4">2.</div>
                    <h3 className="text-2xl font-bold text-white">Interact & Refine</h3>
                    <p className="text-white/70 mt-2">
                        Click on any highlight to see suggestions. Use the stat counters at the bottom to toggle different issue types on and off, allowing you to focus on one type of improvement at a time.
                    </p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10">
                    <div className="text-5xl mb-4">3.</div>
                    <h3 className="text-2xl font-bold text-white">Export & Improve</h3>
                    <p className="text-white/70 mt-2">
                        Once you&apos;re happy with your changes, copy the cleaned text to your clipboard. Over time, our suggestions will help you internalize best practices and become a better writer.
                    </p>
                </div>
            </div>
        </section>
    );
}
