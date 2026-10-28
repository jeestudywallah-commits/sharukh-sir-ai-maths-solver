import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '', block = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If whole content is block math ($$...$$) or block prop is true
    const trimmed = content.trim();

    // Check if entire content is enclosed in $$...$$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length >= 4) {
      const math = trimmed.slice(2, -2).trim();
      try {
        return katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch (e) {
        return `<span class="text-rose-400">${trimmed}</span>`;
      }
    }

    // Check if entire content is enclosed in single $...$
    if (trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length >= 2 && !trimmed.slice(1, -1).includes('$')) {
      const math = trimmed.slice(1, -1).trim();
      try {
        return katex.renderToString(math, {
          displayMode: block,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch (e) {
        return `<span class="text-rose-400">${trimmed}</span>`;
      }
    }

    // Mixed text with $...$ or $$...$$
    // Regex splits by $$...$$ then by $...$
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              output: 'htmlAndMathml',
            });
          } catch {
            return part;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              output: 'htmlAndMathml',
            });
          } catch {
            return part;
          }
        } else {
          // Plain text with linebreaks converted to <br />
          return part
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br />');
        }
      })
      .join('');
  }, [content, block]);

  return (
    <span
      className={`inline-block font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
