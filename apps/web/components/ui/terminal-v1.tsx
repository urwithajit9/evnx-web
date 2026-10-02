'use client';

import { useEffect, useState } from 'react';

interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'success' | 'warning';
  content: string;
}

interface TerminalProps {
  lines: TerminalLine[];
  speed?: number;
  blinking?: boolean;
}

export function Terminal({ lines, speed = 50, blinking = true }: TerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<(TerminalLine & { displayed: string })[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const timer = setTimeout(() => {
      const currentLine = lines[currentLineIndex];
      const currentDisplayed = displayedLines[currentLineIndex]?.displayed || '';

      if (currentCharIndex < currentLine.content.length) {
        const newDisplayed = currentLine.content.slice(0, currentCharIndex + 1);
        setDisplayedLines(prev => {
          const updated = [...prev];
          updated[currentLineIndex] = { ...currentLine, displayed: newDisplayed };
          return updated;
        });
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setDisplayedLines(prev => {
          const updated = [...prev];
          updated[currentLineIndex] = { ...currentLine, displayed: currentLine.content };
          return updated;
        });
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, lines, displayedLines, speed]);

  const getLineColor = (type: string) => {
    switch (type) {
      case 'prompt':
        return 'text-brand-500';
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-terminal-text';
    }
  };

  return (
    <div className="bg-terminal-bg border border-border-muted rounded-lg p-4 font-mono text-sm overflow-hidden">
      <div className="space-y-1">
        {displayedLines.map((line, idx) => (
          <div key={idx} className="flex">
            {line.type === 'prompt' && (
              <>
                <span className="text-brand-500">$</span>
                <span className="ml-2">{line.displayed}</span>
                {idx === currentLineIndex && blinking && (
                  <span className="ml-0.5 animate-pulse text-brand-500">|</span>
                )}
              </>
            )}
            {line.type !== 'prompt' && (
              <span className={getLineColor(line.type)}>{line.displayed}</span>
            )}
          </div>
        ))}
        {currentLineIndex < lines.length && blinking && (
          <div className="flex">
            <span className="text-brand-500">$</span>
            <span className="ml-0.5 animate-pulse text-brand-500">|</span>
          </div>
        )}
      </div>
    </div>
  );
}
