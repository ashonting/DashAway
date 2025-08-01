'use client';
import { useState, useEffect } from 'react';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import Header from './Header';
import Footer from './Footer';
import { siteMetadata } from '@/lib/metadata';
import './globals.css';

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
      <head>
        <title>{siteMetadata.title}</title>
        <meta name="description" content={siteMetadata.description} />
        <meta name="keywords" content={siteMetadata.keywords.join(", ")} />
        <meta name="author" content={siteMetadata.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* OpenGraph */}
        <meta property="og:title" content={siteMetadata.title} />
        <meta property="og:description" content={siteMetadata.description} />
        <meta property="og:url" content={siteMetadata.url} />
        <meta property="og:image" content={`${siteMetadata.url}${siteMetadata.image}`} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content={siteMetadata.twitterCard} />
        <meta name="twitter:title" content={siteMetadata.title} />
        <meta name="twitter:description" content={siteMetadata.description} />
        <meta name="twitter:image" content={`${siteMetadata.url}${siteMetadata.image}`} />
        
        {/* Canonical */}
        <link rel="canonical" href={siteMetadata.url} />
        
        {/* Cache control */}
        <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
        <meta name="pragma" content="no-cache" />
        <meta name="expires" content="0" />
        <meta name="build-timestamp" content={Date.now().toString()} />
        <meta name="version" content="v2.0.2" />
        <meta name="cache-buster" content={process.env.CACHE_BUSTER || 'default'} />
      </head>
      <body>
        <SupabaseAuthProvider>
          <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Header toggleTheme={toggleTheme} theme={theme} />
            {children}
            <Footer />
          </div>
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}