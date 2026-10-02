'use client'
/**
 * Terminal — animated typewriter terminal window
 *
 * Used on the homepage hero to demo evnx commands.
 *
 * Usage:
 *   <Terminal lines={terminalLines} speed={28} />
 *
 * Line types:
 *   prompt  — orange $ prefix, user input
 *   output  — dim white, command output
 *   success — green text
 *   error   — red text
 *   warning — yellow text
 */

import { useState, useEffect } from 'react'

type LineType = 'prompt' | 'output' | 'success' | 'error' | 'warning'

export type TerminalLine = {
  type: LineType
  content: string
}

type Props = {
  lines: TerminalLine[]
  speed?: number        // ms per character
  startDelay?: number   // ms before first character
  loop?: boolean        // restart after finishing
}

const lineStyles: Record<LineType, string> = {
  prompt:  'text-brand-400',
  output:  'text-terminal-text',
  success: 'text-success',
  error:   'text-danger',
  warning: 'text-warning',
}

export function Terminal({ lines, speed = 30, startDelay = 600, loop = true }: Props) {
  // Which lines are fully visible, plus partial char count of current line
  const [completedLines, setCompletedLines] = useState<TerminalLine[]>([])
  const [currentLineIdx, setCurrentLineIdx] = useState(0)
  const [currentCharIdx, setCurrentCharIdx] = useState(0)
  const [started, setStarted] = useState(false)

  // Initial delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  useEffect(() => {
    if (!started) return
    if (currentLineIdx >= lines.length) {
      // All lines done
      if (loop) {
        const t = setTimeout(() => {
          setCompletedLines([])
          setCurrentLineIdx(0)
          setCurrentCharIdx(0)
        }, 3000)
        return () => clearTimeout(t)
      }
      return
    }

    const currentLine = lines[currentLineIdx]
    const isPrompt = currentLine.type === 'prompt'

    if (currentCharIdx < currentLine.content.length) {
      // Type next character
      const t = setTimeout(
        () => setCurrentCharIdx(c => c + 1),
        isPrompt ? speed : speed * 0.4  // output lines appear faster
      )
      return () => clearTimeout(t)
    } else {
      // Line complete — pause then move to next
      const pauseAfter = isPrompt ? 180 : 80
      const t = setTimeout(() => {
        setCompletedLines(prev => [...prev, currentLine])
        setCurrentLineIdx(i => i + 1)
        setCurrentCharIdx(0)
      }, pauseAfter)
      return () => clearTimeout(t)
    }
  }, [started, currentLineIdx, currentCharIdx, lines, speed, loop])

  const currentLine = currentLineIdx < lines.length ? lines[currentLineIdx] : null
  const currentText = currentLine ? currentLine.content.slice(0, currentCharIdx) : ''

  return (
    <div className="bg-terminal-bg border border-border-muted rounded-xl overflow-hidden shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-surface">
        <div className="w-3 h-3 rounded-full bg-danger/70" />
        <div className="w-3 h-3 rounded-full bg-warning/70" />
        <div className="w-3 h-3 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-xs text-text-muted">evnx — terminal</span>
      </div>

      {/* Content */}
      <div className="p-5 font-mono text-sm space-y-1 min-h-[320px]">
        {completedLines.map((line, i) => (
          <div key={i} className={`leading-relaxed ${lineStyles[line.type]}`}>
            {line.type === 'prompt' && (
              <span className="text-brand-500 select-none">$ </span>
            )}
            {line.content}
          </div>
        ))}

        {/* Currently typing line */}
        {currentLine && (
          <div className={`leading-relaxed ${lineStyles[currentLine.type]}`}>
            {currentLine.type === 'prompt' && (
              <span className="text-brand-500 select-none">$ </span>
            )}
            {currentText}
            <span className="inline-block w-2 h-4 bg-brand-500 animate-pulse ml-0.5 align-middle" />
          </div>
        )}

        {/* Idle cursor when nothing is typing */}
        {!currentLine && !started && (
          <div className="flex items-center gap-1">
            <span className="text-brand-500">$ </span>
            <span className="inline-block w-2 h-4 bg-brand-500 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}