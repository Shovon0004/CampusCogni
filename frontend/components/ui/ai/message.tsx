'use client';

import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { useContext, createContext } from 'react';

type Role = 'user' | 'assistant';

interface MessageContextValue {
  from?: Role;
}

const MessageContext = createContext<MessageContextValue>({});

export function AIMessage({
  from = 'user',
  className,
  children,
  ...props
}: ComponentProps<'div'> & { from?: Role }) {
  const isUser = from === 'user';

  return (
    <MessageContext.Provider value={{ from }}>
      <div
        className={cn(
          'flex w-full items-start gap-4 py-2',
          isUser && 'justify-end',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'rounded-lg border px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted dark:bg-muted/50',
            'max-w-[85%]',
          )}
        >
          {children}
        </div>
      </div>
    </MessageContext.Provider>
  );
}

export function AIMessageContent({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  const { from } = useContext(MessageContext);
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        from === 'assistant' && 'prose-p:leading-relaxed prose-pre:mt-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
