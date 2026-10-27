import React from 'react';
import { parseBlocks } from '@/lib/self-learning';

/** Renders generated Markdown as headings, paragraphs and lists — as text, never as HTML. */
export function Blocks({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200 break-words">
      {parseBlocks(markdown).map((b, i) =>
        b.type === 'h2' ? (
          <h2 key={i} className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white pt-2">{b.text}</h2>
        ) : b.type === 'h3' ? (
          <h3 key={i} className="text-sm font-bold text-gray-900 dark:text-white pt-1">{b.text}</h3>
        ) : b.type === 'p' ? (
          <p key={i}>{b.text}</p>
        ) : b.type === 'ul' ? (
          <ul key={i} className="list-disc pl-5 space-y-1">
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ) : b.type === 'ol' ? (
          <ol key={i} className="list-decimal pl-5 space-y-1">
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ol>
        ) : null,
      )}
    </div>
  );
}
