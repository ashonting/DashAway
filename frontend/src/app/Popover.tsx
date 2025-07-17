import { useEffect, useRef } from 'react';

interface PopoverProps {
  onSelect: (char: string) => void;
  onClose: () => void;
  suggestions: string[];
  disableReplace?: boolean;
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



export default function Popover({ onSelect, onClose, suggestions, disableReplace }: PopoverProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useOutsideAlerter(wrapperRef, onClose);

  const handleSelect = (item: string) => {
    if (disableReplace) return;
    if (item === ',') {
      onSelect(item + ' ');
    } else {
      onSelect(item);
    }
  };

  return (
    <div ref={wrapperRef} className="absolute z-10 bg-gray-700 rounded-lg shadow-lg p-2 max-w-xs">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            onClick={() => handleSelect(item)}
            className={`px-3 py-1 bg-gray-600 text-white rounded ${!disableReplace && 'hover:bg-gray-500'}`}
            disabled={disableReplace}
          >
            {item}
          </button>
        ))}
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
        >
          Ignore
        </button>
      </div>
      <button onClick={onClose} className="mt-2 w-full text-center text-xs text-gray-400 hover:text-white">Close</button>
    </div>
  );
}
