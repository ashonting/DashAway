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

  const handleSelect = (item: string) => {
    if (disableReplace) return;
    onSelect(item);
  };

  return (
    <div 
      ref={wrapperRef} 
      className={`absolute z-10 w-64 bg-gray-800 rounded-lg shadow-2xl border border-white/10 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="p-2">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              onClick={() => handleSelect(item)}
              className={`px-3 py-1 bg-gray-700 text-white rounded-md text-sm transition-colors ${!disableReplace && 'hover:bg-primary'}`}
              disabled={disableReplace}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onClose} className="absolute top-1 right-1 text-gray-500 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
