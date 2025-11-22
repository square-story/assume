import React, { useEffect, useRef } from 'react';
import { Mistake } from '../types';
import { X } from 'lucide-react';
import Button from './ui/Button';
import { Drawer } from 'vaul';

interface MistakeTooltipProps {
  mistake: Mistake | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  inDrawer?: boolean;
}

const MistakeTooltip: React.FC<MistakeTooltipProps> = ({
  mistake,
  position,
  onClose,
  inDrawer = false,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inDrawer && position && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontal position if tooltip goes off screen
      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width / 2 - 16;
      }
      if (rect.left < 0) {
        adjustedX = rect.width / 2 + 16;
      }

      // Adjust vertical position if tooltip goes off screen
      if (rect.bottom > viewportHeight) {
        adjustedY = position.y - rect.height - 16;
      }
      if (rect.top < 0) {
        adjustedY = 16;
      }

      if (adjustedX !== position.x || adjustedY !== position.y) {
        tooltip.style.left = `${adjustedX}px`;
        tooltip.style.top = `${adjustedY}px`;
      }
    }
  }, [position, inDrawer]);

  if (!mistake) return null;

  if (inDrawer) {
    return (
      <div className="w-full bg-yellow-50 shadow-sm border border-yellow-200 p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <span
            className="text-xs font-sans font-bold uppercase tracking-wider text-ink-red border border-ink-red px-2 py-1 rounded"
            aria-label={`Error type: ${mistake.type}`}
          >
            {mistake.type}
          </span>
          <Drawer.Close asChild>
            <Button variant="ghost" size="sm" aria-label="Close mistake details">
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Drawer.Close>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-500 mb-1">Original:</p>
            <p className="line-through decoration-ink-red/50 text-slate-600 italic break-words">
              &ldquo;{mistake.original}&rdquo;
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Correction:</p>
            <div className="text-ink-red font-bold flex items-center gap-2 break-words">
              <span aria-hidden="true">➔</span>
              <span>{mistake.correction}</span>
            </div>
          </div>

          <div className="border-t border-yellow-200 pt-3">
            <p className="text-slate-700 text-sm break-words">{mistake.explanation}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!position) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 w-72 max-w-[calc(100vw-2rem)] bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] border border-yellow-200 p-4 rounded-sm font-hand text-lg leading-tight text-slate-800 transform -translate-x-1/2 mt-2"
      style={{ top: position.y, left: position.x }}
      role="dialog"
      aria-label={`Mistake details: ${mistake.type}`}
      aria-modal="false"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <span
          className="text-xs font-sans font-bold uppercase tracking-wider text-ink-red border border-ink-red px-1 rounded flex-shrink-0"
          aria-label={`Error type: ${mistake.type}`}
        >
          {mistake.type}
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded flex-shrink-0"
          aria-label="Close mistake details"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <p className="line-through decoration-ink-red/50 text-slate-500 mb-1 italic break-words">
        &ldquo;{mistake.original}&rdquo;
      </p>

      <div className="text-ink-red font-bold mb-2 flex items-center gap-1 break-words">
        <span aria-hidden="true" className="flex-shrink-0">➔</span>
        <span>{mistake.correction}</span>
      </div>

      <p className="text-slate-700 text-sm font-sans border-t border-yellow-200 pt-2 break-words">
        {mistake.explanation}
      </p>

      <div
        className="absolute -top-2 left-1/2 w-4 h-4 bg-yellow-50 border-t border-l border-yellow-200 transform -translate-x-1/2 rotate-45"
        aria-hidden="true"
      />
    </div>
  );
};

export default MistakeTooltip;
