'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Sun, Moon, HelpCircle, Menu, X, ChevronDown, BookOpen } from 'lucide-react'; // Using lucide-react for icons

export default function Header({ toggleTheme, theme }: { toggleTheme: () => void; theme: string }) {
  const { user, signOut } = useSupabaseAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const handleShowOnboarding = () => {
    // Clear onboarding flag and redirect to home page
    localStorage.removeItem('dashaway-onboarding-completed');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            DashAway
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
            
            {/* Help Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowHelpMenu(!showHelpMenu)}
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60"
              >
                <HelpCircle className="h-4 w-4" />
                Help
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showHelpMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowHelpMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-20">
                    <div className="py-1">
                      <Link 
                        href="/faq"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setShowHelpMenu(false)}
                      >
                        <HelpCircle className="h-4 w-4" />
                        FAQ
                      </Link>
                      {user && (
                        <button 
                          onClick={() => {
                            handleShowOnboarding();
                            setShowHelpMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent transition-colors text-left"
                        >
                          <BookOpen className="h-4 w-4" />
                          Show Tutorial
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {user ? (
              <>
                <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Dashboard</Link>
                <button onClick={signOut} className="transition-colors hover:text-foreground/80 text-foreground/60">Log Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="transition-colors hover:text-foreground/80 text-foreground/60">Login</Link>
                <Link href="/register" className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">Register</Link>
              </>
            )}
          </nav>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              href="/pricing" 
              className="block py-2 text-base transition-colors hover:text-foreground/80 text-foreground/60"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/faq"
              className="flex items-center gap-2 py-2 text-base transition-colors hover:text-foreground/80 text-foreground/60"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </Link>
            {user && (
              <button 
                onClick={() => {
                  handleShowOnboarding();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 py-2 text-base transition-colors hover:text-foreground/80 text-foreground/60 text-left"
              >
                <BookOpen className="h-4 w-4" />
                Show Tutorial
              </button>
            )}
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block py-2 text-base transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="block w-full text-left py-2 text-base transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block py-2 text-base transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium text-base text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
            <div className="pt-2 border-t border-border/20">
              <button 
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center gap-2 py-2 text-base transition-colors hover:text-foreground/80 text-foreground/60"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
