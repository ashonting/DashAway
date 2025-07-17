'use client';
import Script from 'next/script';
import Link from 'next/link';

declare global {
    interface Window {
        Paddle: any;
    }
}

export default function Pricing() {
    const handleCheckout = () => {
        alert("Paddle checkout is not yet implemented.");
    };

    return (
        <>
            <Script
                src="https://cdn.paddle.com/paddle/paddle.js"
                onLoad={() => {
                    if (window.Paddle) {
                        // window.Paddle.Setup({ vendor: YOUR_PADDLE_VENDOR_ID });
                    }
                }}
            />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-background/50 p-8 rounded-2xl border border-text/10 flex flex-col">
                        <h2 className="text-3xl font-bold text-text">Basic</h2>
                        <p className="text-text/70 mt-2">For casual use</p>
                        <p className="text-5xl font-bold text-text mt-6">$0<span className="text-lg font-normal text-text/70">/month</span></p>
                        <ul className="mt-6 space-y-3 text-text/90 flex-grow">
                            <li>✓ 2 runs per month</li>
                            <li>✓ Em-dash detection</li>
                            <li>✓ Standard support</li>
                        </ul>
                        <button disabled className="mt-8 w-full block text-center px-8 py-3 bg-gray-700 text-white font-bold rounded-lg opacity-50 cursor-not-allowed">
                            Sign Up
                        </button>
                    </div>

                    {/* Plus Plan */}
                    <div className="bg-primary/20 p-8 rounded-2xl border-2 border-primary flex flex-col">
                        <h2 className="text-3xl font-bold text-text">Plus</h2>
                        <p className="text-text/70 mt-2">For power users</p>
                        <p className="text-5xl font-bold text-text mt-6">$4<span className="text-lg font-normal text-text/70">/month</span></p>
                        <ul className="mt-6 space-y-3 text-text/90 flex-grow">
                            <li>✓ Unlimited runs</li>
                            <li>✓ Full feature set</li>
                            <li>✓ Document history</li>
                            <li>✓ Priority support</li>
                        </ul>
                        <button onClick={handleCheckout} className="mt-8 w-full px-8 py-3 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform">
                            Upgrade to Plus
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-background/50 p-8 rounded-2xl border border-text/10 flex flex-col">
                        <h2 className="text-3xl font-bold text-text">Pro</h2>
                        <p className="text-text/70 mt-2">For teams & businesses</p>
                        <p className="text-5xl font-bold text-text mt-6">Contact Us</p>
                        <ul className="mt-6 space-y-3 text-text/90 flex-grow">
                            <li>✓ Everything in Plus</li>
                            <li>✓ Team management</li>
                            <li>✓ API access</li>
                            <li>✓ Custom integrations</li>
                        </ul>
                        <button disabled className="mt-8 w-full px-8 py-3 bg-gray-600 text-white font-bold rounded-lg opacity-50 cursor-not-allowed">
                            Coming Soon
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
