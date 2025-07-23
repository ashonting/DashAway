'use client';
import Script from 'next/script';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Check, ArrowRight, Star, Users, Zap } from 'lucide-react';

declare global {
    interface Window {
        Paddle: any;
    }
}

export default function Pricing() {
    const { user } = useSupabaseAuth();
    
    const handleProCheckout = () => {
        alert("Paddle checkout is not yet implemented.");
    };

    const features = {
        basic: [
            "2 text cleanings per month",
            "Em-dash detection & removal", 
            "Cliché identification",
            "AI tell detection",
            "Jargon replacement suggestions",
            "Basic readability scoring",
            "Email support"
        ],
        pro: [
            "Unlimited text cleanings",
            "All Basic features included",
            "Document history & analytics",
            "Advanced readability metrics",
            "Complex word simplification (Coming Soon)",
            "Long sentence restructuring (Coming Soon)", 
            "Priority email support",
            "Export cleaned documents",
            "No usage restrictions"
        ]
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
            <main className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">
                            Choose Your Plan
                        </h1>
                        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                            Transform your writing with our AI-powered text cleaning tool. 
                            Remove clichés, jargon, and AI tells to create authentic, engaging content.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Basic Plan */}
                        <div className="relative bg-background rounded-2xl border border-border/40 p-8 hover:border-border/60 transition-all duration-300">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                                    <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                                <p className="text-foreground/60">Perfect for occasional writers</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold">$0</span>
                                    <span className="text-foreground/60 ml-2">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {features.basic.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-foreground/80">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="text-center">
                                {user ? (
                                    <Link href="/dashboard" className="inline-flex items-center justify-center w-full px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                ) : (
                                    <Link href="/register" className="inline-flex items-center justify-center w-full px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Pro Plan - Featured */}
                        <div className="relative bg-gradient-to-br from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-teal-200 dark:border-teal-700 p-8 transform hover:scale-105 transition-all duration-300 shadow-xl">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-teal-500 to-purple-600 text-white text-sm font-medium rounded-full">
                                    <Star className="h-4 w-4 mr-1" />
                                    Most Popular
                                </span>
                            </div>

                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl mb-4">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                                <p className="text-foreground/60">For serious writers & creators</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold">$4</span>
                                    <span className="text-foreground/60 ml-2">/month</span>
                                </div>
                                <p className="text-sm text-foreground/50 mt-2">Billed monthly • Cancel anytime</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {features.pro.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-foreground/80 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="text-center">
                                <button 
                                    onClick={handleProCheckout}
                                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg"
                                >
                                    Upgrade to Pro
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                                <p className="text-xs text-foreground/50 mt-2">Easy cancellations • Transparent billing</p>
                            </div>
                        </div>

                    </div>

                    {/* FAQ Section */}
                    <div className="mt-20 text-center">
                        <h2 className="text-3xl font-bold mb-4">Questions?</h2>
                        <p className="text-foreground/70 mb-8">
                            Check out our detailed FAQ or contact us directly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/faq" className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                                View FAQ
                            </Link>
                            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}