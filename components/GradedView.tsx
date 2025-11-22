import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, Mistake } from '../types';
import MistakeTooltip from './MistakeTooltip';
import { Drawer } from 'vaul';

interface GradedViewProps {
  text: string;
  analysis: AnalysisResult;
}

const GradedView: React.FC<GradedViewProps> = ({ text, analysis }) => {
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mistakeRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMistakeClick = (mistake: Mistake, event: React.MouseEvent, index: number) => {
    if (isMobile) {
      setSelectedMistake(mistake);
      setDrawerOpen(true);
    } else {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (containerRect) {
        // Calculate position relative to viewport, but ensure it stays within bounds
        const x = rect.left + rect.width / 2;
        const y = rect.bottom + 8; // 8px offset below the text

        // Check if tooltip would go off screen
        const tooltipWidth = 288; // w-72 = 18rem = 288px
        const tooltipHeight = 200; // approximate
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let finalX = x;
        let finalY = y;

        // Adjust if tooltip would go off right edge
        if (x + tooltipWidth / 2 > viewportWidth) {
          finalX = viewportWidth - tooltipWidth / 2 - 16;
        }
        // Adjust if tooltip would go off left edge
        if (x - tooltipWidth / 2 < 0) {
          finalX = tooltipWidth / 2 + 16;
        }
        // Adjust if tooltip would go off bottom edge
        if (y + tooltipHeight > viewportHeight) {
          finalY = rect.top - tooltipHeight - 8; // Show above instead
        }

        setTooltipPos({ x: finalX, y: finalY });
        setSelectedMistake(mistake);
      }
    }
    event.stopPropagation();
  };

  const closeTooltip = () => {
    setSelectedMistake(null);
    setTooltipPos(null);
    setDrawerOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMobile && selectedMistake) {
        const target = e.target as HTMLElement;
        // Don't close if clicking on the tooltip itself
        if (!target.closest('[role="dialog"]') && !target.closest('[role="button"][aria-label*="Mistake"]')) {
          closeTooltip();
        }
      }
    };
    if (!isMobile) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, selectedMistake]);

  useEffect(() => {
    if (!isMobile && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [isMobile, drawerOpen]);

  const renderHighlightedText = () => {
    if (!analysis.mistakes || analysis.mistakes.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let segments: { text: string; mistake?: Mistake; mistakeIndex?: number }[] = [{ text }];
    let mistakeIndex = 0;

    analysis.mistakes.forEach((mistake) => {
      const newSegments: typeof segments = [];
      let found = false;

      for (const segment of segments) {
        if (segment.mistake) {
          newSegments.push(segment);
          continue;
        }

        const index = segment.text.indexOf(mistake.original);
        if (index !== -1 && !found) {
          const before = segment.text.slice(0, index);
          const match = segment.text.slice(index, index + mistake.original.length);
          const after = segment.text.slice(index + mistake.original.length);

          if (before) newSegments.push({ text: before });
          newSegments.push({ text: match, mistake, mistakeIndex: mistakeIndex++ });
          if (after) newSegments.push({ text: after });

          found = true;
        } else {
          newSegments.push(segment);
        }
      }
      segments = newSegments;
    });

    return segments.map((seg, i) => {
      if (seg.mistake) {
        return (
          <span
            key={`mistake-${seg.mistakeIndex}-${i}`}
            role="button"
            tabIndex={0}
            aria-label={`Mistake: ${seg.mistake.type}. Click for details`}
            className="cursor-pointer bg-red-100 border-b-2 border-ink-red/50 hover:bg-red-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 inline"
            onClick={(e) => handleMistakeClick(seg.mistake!, e, seg.mistakeIndex || 0)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMistakeClick(seg.mistake!, e as any, seg.mistakeIndex || 0);
              }
            }}
          >
            {seg.text}
          </span>
        );
      }
      return <span key={i}>{seg.text}</span>;
    });
  };

  return (
    <>
      <div
        className="relative font-serif text-slate-800 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words"
        ref={containerRef}
        role="article"
        aria-label="Graded resume content"
      >
        {renderHighlightedText()}
        {!isMobile && (
          <MistakeTooltip mistake={selectedMistake} position={tooltipPos} onClose={closeTooltip} />
        )}
      </div>

      {/* Mobile Drawer for Mistake Details */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[70%] mt-24 fixed bottom-0 left-0 right-0 z-50 focus-visible:outline-none">
            <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 bg-stone-300 rounded-full mb-4" />
              <div className="max-w-md mx-auto">
                {selectedMistake && (
                  <MistakeTooltip
                    mistake={selectedMistake}
                    position={null}
                    onClose={closeTooltip}
                    inDrawer={true}
                  />
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
};

export default GradedView;
