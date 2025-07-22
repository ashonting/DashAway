'use client';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import './globals.css';

import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState('dark'); // Default to dark theme

  useEffect(() => {
    // On component mount, set the theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    // Whenever the theme state changes, update the DOM and localStorage
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <Header toggleTheme={toggleTheme} theme={theme} />
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}