'use client';
import Link from 'next/link';

export default function Header({ toggleTheme, theme }: { toggleTheme: () => void, theme: string }) {
    return (
        <header className="bg-background/50 backdrop-blur-lg border-b border-text/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-text">
                            DashAway
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/pricing" className="text-text hover:underline">
                            Pricing
                        </Link>
                        <button onClick={toggleTheme} className="text-2xl">
                            {theme === 'light' ? '🌞' : '🌜'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}