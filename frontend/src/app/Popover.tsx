'use client';
import { useEffect, useRef, useState, RefObject } from 'react';

interface PopoverProps {
  onSelect: (char: string) => void;
  onClose: () => void;
  suggestions: string[];
  disableReplace?: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement | null>, onClose: () => void) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClose]);
}

export default function Popover({ onSelect, onClose, suggestions, disableReplace, containerRef }: PopoverProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useOutsideAlerter(wrapperRef, onClose);

  useEffect(() => {
    if (wrapperRef.current && containerRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      if (rect.bottom > containerRect.bottom) {
        setPosition('top');
      } else if (rect.top < containerRect.top) {
        setPosition('bottom');
      }
      setIsVisible(true);
    }
  }, [containerRef]);

  const handleSelect = (item: string, index: number) => {
    if (disableReplace) return;
    setSelectedIndex(index);
    setTimeout(() => {
      onSelect(item);
    }, 150); // Small delay for animation
  };

  return (
    <div 
      ref={wrapperRef} 
      className={`absolute z-10 w-64 bg-gray-800 rounded-lg shadow-2xl border border-white/10 backdrop-blur-sm transition-all duration-300 transform ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
    >
      <div className="p-2">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item, index) => (
            <button
              key={item}
              onClick={() => handleSelect(item, index)}
              className={`px-3 py-1 rounded-md text-sm transition-all duration-200 transform relative overflow-hidden ${
                selectedIndex === index 
                  ? 'bg-primary text-white scale-110 shadow-lg' 
                  : !disableReplace 
                    ? 'bg-gray-700 text-white hover:bg-primary hover:scale-105 hover:shadow-md active:scale-95' 
                    : 'bg-gray-700 text-gray-400'
              }`}
              disabled={disableReplace}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-md"></div>
              )}
              <span className="relative z-10">{item}</span>
            </button>
          ))}
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="absolute top-1 right-1 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-all duration-200 hover:scale-110 active:scale-90"
        aria-label="Close suggestions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
