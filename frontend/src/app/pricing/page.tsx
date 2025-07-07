'use client'

import { useEffect } from 'react';

interface Paddle {
  Setup: (options: { vendor: number }) => void;
  Checkout: {
    open: (options: { product: number; email?: string }) => void;
  };
}

declare global {
  interface Window {
    Paddle: Paddle;
  }
}

export default function Pricing() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    script.onload = () => {
      window.Paddle.Setup({ vendor: 12345 }); // Replace with your vendor ID
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openCheckout = () => {
    window.Paddle.Checkout.open({
      product: 123456, // Replace with your product ID
      email: 'test@example.com', // Optional: pre-fill customer email
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Pricing</h1>
      <div className="max-w-md mx-auto bg-gray-800/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center">Pro Plan</h2>
        <p className="text-center text-4xl font-bold my-4">$1.99/month</p>
        <ul className="space-y-2">
          <li>Unlimited text cleaning</li>
          <li>Priority support</li>
          <li>Access to new features</li>
        </ul>
        <button
          onClick={openCheckout}
          className="w-full mt-8 px-5 py-3 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
