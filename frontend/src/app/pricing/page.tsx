'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { paddleService, PricingConfig } from '@/services/paddleService';
import { Check, ArrowRight, Star, Users, Zap, Loader2 } from 'lucide-react';

export default function Pricing() {
    const { user } = useSupabaseAuth();
    const { subscriptionInfo, createCheckout, loading: subscriptionLoading } = useSubscription();
    const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const billingCycle = 'monthly'; // Only monthly billing supported
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

    useEffect(() => {
        const loadPricingConfig = async () => {
            try {
                const config = await paddleService.getPricingConfig();
                setPricingConfig(config);
            } catch (error) {
                console.error('Failed to load pricing config:', error);
            } finally {
                setLoadingConfig(false);
            }
        };

        loadPricingConfig();
    }, []);

    const handleCheckout = async (tier: string) => {
        if (!user) {
            window.location.href = '/login?redirect=/pricing';
            return;
        }

        setCheckoutLoading(tier);
        try {
            await createCheckout(tier, 'monthly');
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setCheckoutLoading(null);
        }
    };

    const basicFeatures = [
        "2 AI content cleanings per month",
        "Em-dash detection & removal (biggest AI tell)", 
        "Remove ChatGPT & Claude fingerprints",
        "AI detection bypass",
        "Corporate jargon removal",
        "Robotic phrase elimination",
        "Email support"
    ];

    if (loadingConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <PageHead page="pricing" />
            <main className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">
                            They&apos;ll Never Know AI Wrote It
                        </h1>
                        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                            Turn ChatGPT, Claude, and other AI-generated content into authentic human writing. 
                            Remove every AI fingerprint so you can confidently use it as your own work.
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
                                <p className="text-foreground/60">Perfect for trying AI content cleaning</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold">$0</span>
                                    <span className="text-foreground/60 ml-2">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {basicFeatures.map((feature, index) => (
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

                        {/* Pro Plan */}
                        {pricingConfig?.pro && (
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
                                    <h3 className="text-2xl font-bold mb-2">{pricingConfig.pro.name}</h3>
                                    <p className="text-foreground/60">For unlimited AI content humanization</p>
                                    <div className="mt-6">
                                        <span className="text-5xl font-bold">${pricingConfig.pro.monthly.price}</span>
                                        <span className="text-foreground/60 ml-2">/month</span>
                                    </div>
                                    <p className="text-sm text-foreground/50 mt-2">
                                        Billed monthly • Cancel anytime
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {pricingConfig.pro.monthly.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-foreground/80 font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="text-center">
                                    <button 
                                        onClick={() => handleCheckout('pro')}
                                        disabled={checkoutLoading === 'pro' || subscriptionLoading}
                                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {checkoutLoading === 'pro' ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {subscriptionInfo?.tier === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                                                {subscriptionInfo?.tier !== 'pro' && <ArrowRight className="ml-2 h-4 w-4" />}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-foreground/50 mt-2">Easy cancellations • Transparent billing</p>
                                </div>
                            </div>
                        )}

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