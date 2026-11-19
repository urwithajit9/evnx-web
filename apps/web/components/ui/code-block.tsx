/**
 * CodeBlock — a plain (unhighlighted) code block for client pages such as
 * /install. MDX uses FencedCodeBlock, which highlights with Shiki on the server.
 *
 * Both draw <CodeFrame> from @evnx/mdx, so the two cannot look different, and
 * the line colours come from the one shared lineClass().
 */
// Client-safe imports: none of these reach shiki.
import { LANG_LABELS } from '@evnx/mdx/lang-labels'
import { CodeFrame } from '@evnx/mdx/code-frame'
import { lineClass } from '@evnx/mdx/line-class'

type Props = {
  children: string
  language?: string
  filename?: string
  showLineNumbers?: boolean  // accepted for API compat, not yet implemented
  className?: string
}

export function CodeBlock({ children, language = 'bash', filename, className }: Props) {
  const lang    = language.startsWith('language-') ? language.slice('language-'.length) : language
  const label   = LANG_LABELS[lang] ?? lang
  const rawCode = (children ?? '').toString().replace(/\n$/, '')
  const lines   = rawCode.split('\n')

  return (
    <CodeFrame label={label} filename={filename} copyText={rawCode} ariaLabel={`${label} code`} className={className}>
      <pre className="p-4 m-0 font-mono text-sm leading-[1.75] whitespace-pre">
        {lines.map((line, i) => (
          <span key={i} className={`block ${lineClass(line, { commands: true })}`}>
            {line || '\u00A0'}
          </span>
        ))}
      </pre>
    </CodeFrame>
  )
}

export default CodeBlock
