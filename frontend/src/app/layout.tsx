'use client';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen font-sans">
          <Header toggleTheme={toggleTheme} theme={theme} />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}