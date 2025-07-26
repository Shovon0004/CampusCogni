'use client';

import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function AIConversation({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-4 overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AIConversationContent({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const onScroll = useCallback(() => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const diff = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(diff > 10);
  }, []);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;
    contentElement.addEventListener('scroll', onScroll);
    onScroll();
    return () => contentElement.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;
    const { scrollHeight, clientHeight } = contentElement;
    contentElement.scrollTop = scrollHeight - clientHeight;
  }, [children]);

  return (
    <>
      <div
        ref={contentRef}
        className={cn('flex flex-col gap-2 overflow-y-auto px-3', className)}
        {...props}
      >
        {children}
      </div>
      <AIConversationScrollButton
        className={cn(!showScrollButton && 'hidden')}
        onClick={() => {
          if (!contentRef.current) return;
          const { scrollHeight, clientHeight } = contentRef.current;
          contentRef.current.scrollTop = scrollHeight - clientHeight;
        }}
      />
    </>
  );
}

export function AIConversationScrollButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(
        'absolute bottom-4 right-4 h-8 w-8 rounded-full',
        className,
      )}
      {...props}
    >
      <ArrowDownIcon className="size-4" />
    </Button>
  );
}
