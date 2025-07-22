'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, HelpCircle } from 'lucide-react'; // Using lucide-react for icons
import FAQModal from './FAQModal';

export default function Header({ toggleTheme, theme }: { toggleTheme: () => void; theme: string }) {
  const { user, logout } = useAuth();
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            DashAway
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
            <button 
              onClick={() => setShowFAQ(true)}
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </button>
            {user ? (
              <>
                <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Dashboard</Link>
                <button onClick={logout} className="transition-colors hover:text-foreground/80 text-foreground/60">Log Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="transition-colors hover:text-foreground/80 text-foreground/60">Login</Link>
                <Link href="/register" className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">Register</Link>
              </>
            )}
          </nav>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        
      </div>
      
      <FAQModal 
        isOpen={showFAQ} 
        onClose={() => setShowFAQ(false)} 
      />
    </header>
  );
}
