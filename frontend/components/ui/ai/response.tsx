'use client';

import { cn } from '@/lib/utils';

interface AIResponseProps {
  children: string;
  className?: string;
}

// A simpler implementation that doesn't rely on markdown libraries
export function AIResponse({ children, className }: AIResponseProps) {
  // Function to format code blocks
  const formatText = (text: string) => {
    // Split by code blocks
    const parts = text.split(/```([^`]+)```/).filter(Boolean);
    
    return parts.map((part, index) => {
      // If this is a code block (odd indices in the array)
      if (index % 2 === 1) {
        // Extract language if specified
        const lines = part.split('\n');
        const firstLine = lines[0].trim();
        const codeContent = lines.slice(1).join('\n');
        
        return (
          <pre key={index} className="bg-gray-800 rounded-md p-4 overflow-x-auto my-4">
            {firstLine && <div className="text-xs text-gray-400 pb-2">{firstLine}</div>}
            <code className="text-sm font-mono text-gray-200 whitespace-pre-wrap">
              {codeContent || part}
            </code>
          </pre>
        );
      }
      
      // Format regular text with paragraphs
      return part.split('\n\n').map((paragraph, i) => (
        <p key={`${index}-${i}`} className="mb-4">
          {paragraph.split('\n').map((line, j) => (
            <span key={`${index}-${i}-${j}`}>
              {line}
              {j < paragraph.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      ));
    });
  };

  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      {formatText(children)}
    </div>
  );
}
