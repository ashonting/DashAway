'use client'

import Link from 'next/link';

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-gray-800/50 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-3xl font-bold tracking-tight">
                DashAway
              </Link>
            </div>
            <nav className="hidden md:flex md:space-x-8">
              <Link href="/dashboard" className="hover:text-accent transition-colors duration-300">
                Dashboard
              </Link>
              <Link href="/faq" className="hover:text-accent transition-colors duration-300">
                FAQ
              </Link>
              <Link href="/pricing" className="hover:text-accent transition-colors duration-300">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-accent transition-colors duration-300">
                Login
              </Link>
              <Link href="/register" className="hover:text-accent transition-colors duration-300">
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
