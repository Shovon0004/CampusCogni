"use client";

import { ArrowRight, Bot, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "../../../hooks/use-auto-resize-textarea";
import "../../../app/recruiter/candidate-search/minimal-chat.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MinimalCandidateChat({ selectedCandidates = [] }: { selectedCandidates?: any[] }) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  // When component mounts or selected candidates change, update the greeting
  useEffect(() => {
    const greeting = selectedCandidates.length > 0
      ? `I can answer questions about ${selectedCandidates.length === 1 
          ? 'the selected candidate' 
          : `the ${selectedCandidates.length} selected candidates`}. What would you like to know?`
      : "Please select candidates to ask questions about them.";
      
    setMessages([{ role: "assistant", content: greeting }]);
  }, [selectedCandidates]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!value.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { role: "user" as const, content: value };
    setMessages(prev => [...prev, userMessage]);
    setValue("");
    adjustHeight(true);
    setIsLoading(true);
    
    try {
      // For now, just respond with a placeholder
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: selectedCandidates.length > 0
              ? `I can provide information about ${selectedCandidates.length} selected candidate(s). What specific details would you like to know?`
              : "This is a placeholder response. The AI chat functionality will be implemented soon."
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { role: "assistant", content: "Sorry, I encountered an error processing your request." }
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="minimal-chat-container bg-[#0D0D0D] dark:bg-[#0D0D0D] rounded-2xl p-1.5 pt-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2.5 mx-3">
        <div className="flex-1 flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-white/90" />
          <h3 className="text-white/90 text-xs tracking-tighter">
            Candidate Assistant
          </h3>
        </div>
      </div>
      
      <div className="ai-conversation flex-1 overflow-y-auto mb-2 px-1.5">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`ai-message ${message.role} p-3 rounded-lg mb-3 ${
              message.role === 'assistant' 
                ? 'bg-[#1E1E1E] text-white/90' 
                : 'bg-[#2A2A2A] text-white/90 ml-6'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-1.5">
                <Bot className="h-3.5 w-3.5 text-white/70" />
                <span className="text-xs font-medium text-white/70">AI</span>
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="ai-message assistant bg-[#1E1E1E] p-3 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-white/70 animate-spin" />
              <span className="text-xs text-white/70">thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion buttons */}
      {selectedCandidates.length > 1 && (
        <div className="px-3 mb-2 flex flex-wrap gap-2">
          <button
            onClick={() => setValue(`Compare ${selectedCandidates.length} candidates based on skills and experience`)}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            Compare candidates
          </button>
          <button
            onClick={() => setValue("Who has better technical skills?")}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            Compare technical skills
          </button>
          <button
            onClick={() => setValue("Who is more suitable for a senior position?")}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            Seniority assessment
          </button>
        </div>
      )}

      {selectedCandidates.length === 1 && (
        <div className="px-3 mb-2 flex flex-wrap gap-2">
          <button
            onClick={() => setValue(`Summarize ${selectedCandidates[0]?.name || "candidate"}'s strengths and weaknesses`)}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            Strengths & weaknesses
          </button>
          <button
            onClick={() => setValue(`What role would ${selectedCandidates[0]?.name || "this candidate"} be best suited for?`)}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            Best role fit
          </button>
        </div>
      )}

      <div className="h-14 bg-black/50 rounded-b-xl flex items-center px-2">
        <div className="relative w-full">
          <Textarea
            value={value}
            placeholder="Ask anything about the selected candidates..."
            className={cn(
              "w-full rounded-xl px-3 py-3 bg-transparent border-none text-white placeholder:text-white/50 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
              "min-h-[48px]"
            )}
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            disabled={isLoading}
          />
          
          <div className="absolute right-1 bottom-1">
            <button
              type="button"
              className={cn(
                "rounded-lg p-1.5",
                value.trim() && !isLoading 
                  ? "bg-white/10 hover:bg-white/15" 
                  : "bg-transparent text-white/30"
              )}
              aria-label="Send message"
              disabled={!value.trim() || isLoading}
              onClick={handleSendMessage}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white/70 animate-spin" />
              ) : (
                <ArrowRight
                  className={cn(
                    "w-4 h-4 text-white transition-opacity duration-200",
                    value.trim() ? "opacity-100" : "opacity-40"
                  )}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
