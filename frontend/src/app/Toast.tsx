'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setProgress(100);
      
      // Progress bar animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressTimer);
            return 0;
          }
          return prev - (100 / 30); // 3 seconds = 30 intervals of 100ms
        });
      }, 100);
      
      // Auto-close timer
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
          setProgress(100);
        }, 300); // Wait for exit animation
      }, 3000);
      
      return () => {
        clearTimeout(closeTimer);
        clearInterval(progressTimer);
      };
    }
  }, [show, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setProgress(100);
    }, 300);
  };

  if (!show) {
    return null;
  }

  return (
    <div className={`fixed bottom-5 right-5 z-50 transition-all duration-300 transform ${
      isVisible 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-2 opacity-0 scale-95'
    }`}>
      <div className="bg-green-500 text-white py-3 px-4 rounded-lg shadow-xl backdrop-blur-sm border border-green-400/20 min-w-[200px] relative overflow-hidden group">
        {/* Success animation background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 animate-pulse opacity-20"></div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-green-300 transition-all duration-100 ease-linear" 
             style={{ width: `${progress}%` }}></div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <CheckCircle className="h-5 w-5 animate-bounce" />
          <span className="font-medium">{message}</span>
          <button 
            onClick={handleClose}
            className="ml-auto p-1 hover:bg-green-600 rounded-full transition-colors duration-200 hover:scale-110 active:scale-90"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
