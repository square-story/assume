import React from 'react';

interface ScoreStampProps {
  grade: string;
  score: number;
}

const ScoreStamp: React.FC<ScoreStampProps> = ({ grade, score }) => {
  const getColor = (g: string) => {
    if (g.startsWith('A')) return 'text-ink-red border-ink-red';
    if (g.startsWith('B')) return 'text-ink-red border-ink-red';
    if (g.startsWith('C')) return 'text-red-700 border-red-700';
    return 'text-red-900 border-red-900';
  };

  const colorClass = getColor(grade);

  return (
    <div
      className={`
        relative w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center 
        border-4 rounded-full select-none
        animate-stamp mix-blend-multiply opacity-90
        ${colorClass}
      `}
      style={{ borderColor: 'currentColor' }}
      role="img"
      aria-label={`Grade: ${grade}, Score: ${score} out of 100`}
    >
      <div
        className="absolute inset-0 border-[1px] rounded-full border-current opacity-60 scale-95"
        aria-hidden="true"
      />
      <span className="font-marker text-4xl md:text-5xl font-bold tracking-tighter rotate-[-5deg]">
        {grade}
      </span>
      <span className="font-hand text-lg md:text-xl font-bold mt-1 rotate-[-2deg]">
        {score}/100
      </span>
    </div>
  );
};

export default ScoreStamp;
