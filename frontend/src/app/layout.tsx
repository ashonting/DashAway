'use client';
import { useState, useEffect } from 'react';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import Header from './Header';
import Footer from './Footer';
import { siteMetadata } from '@/lib/metadata';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData';
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
        <meta name="theme-color" content={siteMetadata.themeColor} />
        
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* OpenGraph */}
        <meta property="og:title" content={siteMetadata.title} />
        <meta property="og:description" content={siteMetadata.description} />
        <meta property="og:url" content={siteMetadata.url} />
        <meta property="og:image" content={`${siteMetadata.url}${siteMetadata.ogImage}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteMetadata.siteName} />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content={siteMetadata.twitterCard} />
        <meta name="twitter:title" content={siteMetadata.title} />
        <meta name="twitter:description" content={siteMetadata.description} />
        <meta name="twitter:image" content={`${siteMetadata.url}${siteMetadata.ogImage}`} />
        <meta name="twitter:site" content="@dashaway" />
        <meta name="twitter:creator" content="@dashaway" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="3 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Canonical */}
        <link rel="canonical" href={siteMetadata.url} />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <WebsiteStructuredData />
        <OrganizationStructuredData />
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