'use client';

import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReasoningContextValue {
  isOpen: boolean;
  isStreaming: boolean;
  setIsOpen: (open: boolean) => void;
}

const ReasoningContext = createContext<ReasoningContextValue>({
  isOpen: false,
  isStreaming: false,
  setIsOpen: () => {},
});

interface AIReasoningProps {
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
  isStreaming?: boolean;
  defaultOpen?: boolean;
}

export function AIReasoning({
  children,
  className,
  isOpen: externalIsOpen,
  isStreaming = false,
  defaultOpen = false,
}: AIReasoningProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = externalIsOpen ?? internalIsOpen;

  return (
    <ReasoningContext.Provider
      value={{
        isOpen,
        isStreaming,
        setIsOpen: setInternalIsOpen,
      }}
    >
      <div
        className={cn(
          'flex flex-col rounded-lg border border-muted bg-background p-4',
          className,
        )}
      >
        {children}
      </div>
    </ReasoningContext.Provider>
  );
}

export function AIReasoningTrigger({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { isOpen, isStreaming, setIsOpen } = useContext(ReasoningContext);

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Reasoning
        {isStreaming && <span className="animate-pulse"> ...</span>}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-6 w-6 rounded-full',
          isOpen && 'bg-muted',
          className,
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <Lightbulb className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function AIReasoningContent({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  const { isOpen, isStreaming } = useContext(ReasoningContext);
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'mt-2 rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap',
        isStreaming && 'animate-pulse',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
