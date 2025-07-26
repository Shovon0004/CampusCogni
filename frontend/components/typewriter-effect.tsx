"use client";

import React, { useState, useEffect, useRef } from 'react';

type TypewriterProps = {
  text: string;
  delay?: number;
  onComplete?: () => void;
};

export default function TypewriterEffect({ text, delay = 15, onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldUseMarkdown, setShouldUseMarkdown] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    
    // Check if text contains markdown symbols
    setShouldUseMarkdown(
      text.includes('```') || 
      text.includes('#') || 
      text.includes('*') || 
      text.includes('_') ||
      text.includes('$') ||
      text.includes('|')
    );
  }, [text]);

  useEffect(() => {
    // If the text has markdown content, we may want to render it all at once
    // instead of character by character to avoid strange visual effects
    if (shouldUseMarkdown) {
      const timeout = setTimeout(() => {
        setDisplayedText(text);
        setCurrentIndex(text.length);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }, 300); // Brief delay before showing content
      
      return () => clearTimeout(timeout);
    }
    
    // Standard typewriter effect for non-markdown text
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, delay, text, isComplete, onComplete, shouldUseMarkdown]);

  return <span className="whitespace-pre-wrap">{displayedText}</span>;
}
