"use client"

import React, { useState, useEffect, useRef } from "react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { SendHorizonal } from "lucide-react"
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from '@/components/ui/ai/conversation'
import { AIMessage, AIMessageContent } from '@/components/ui/ai/message'
import { AIResponse } from '@/components/ui/ai/response'
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface AIQuestionAnswerProps {
  selectedCandidates: any[]
  className?: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIQuestionAnswer({ selectedCandidates, className }: AIQuestionAnswerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // When selected candidates change, reset the conversation
  useEffect(() => {
    if (selectedCandidates.length > 0) {
      setMessages([
        { 
          role: "assistant", 
          content: `I can answer questions about ${
            selectedCandidates.length === 1 
              ? `the selected candidate, ${selectedCandidates[0].name}` 
              : `the ${selectedCandidates.length} selected candidates`
          }. What would you like to know?` 
        }
      ])
    } else {
      setMessages([])
    }
  }, [selectedCandidates])
  
  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }
  
  // Scroll to bottom of conversation when messages change
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, streamingContent])
  
  // Handle submit question
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!input.trim() || isLoading || selectedCandidates.length === 0) return
    
    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent("")
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    try {
      // Request answer from API with streaming support
      const response = await apiClient.askAboutCandidates(selectedCandidates, input)
      
      // Simulate streaming for now - would be replaced with real streaming
      const tokens = response.answer.split(" ")
      let accumulatedContent = ""
      
      for (const token of tokens) {
        await new Promise(resolve => setTimeout(resolve, 20))
        accumulatedContent += token + " "
        setStreamingContent(accumulatedContent)
      }
      
      // Add assistant response
      setMessages(prev => [...prev, { role: "assistant", content: response.answer }])
      
    } catch (error) {
      console.error("Error getting answer:", error)
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: "Sorry, I encountered an error while trying to answer your question. Please try again." 
        }
      ])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent("")
    }
  }
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={cn("minimal-chat-container", className)}>
      {selectedCandidates.length > 0 ? (
        <div className="flex flex-col h-full">
          {/* Conversation Area */}
          <div className="flex-1 overflow-hidden mb-4">
            <AIConversation className="relative h-full rounded-xl border border-black/10 dark:border-white/10 shadow-sm">
              <AIConversationContent className="p-3">
                {messages.map((message, index) => (
                  <AIMessage 
                    from={message.role} 
                    key={index}
                    className={cn(
                      "p-3 mb-3",
                      message.role === "assistant" 
                        ? "bg-slate-100 dark:bg-slate-800/60 rounded-xl" 
                        : "rounded-xl"
                    )}
                  >
                    <AIMessageContent>
                      {message.role === "assistant" ? (
                        <AIResponse>{message.content}</AIResponse>
                      ) : (
                        message.content
                      )}
                    </AIMessageContent>
                  </AIMessage>
                ))}
                
                {isStreaming && (
                  <AIMessage 
                    from="assistant"
                    className="bg-slate-100 dark:bg-slate-800/60 p-3 mb-3 rounded-xl"
                  >
                    <AIMessageContent>
                      <AIResponse>{streamingContent}</AIResponse>
                    </AIMessageContent>
                  </AIMessage>
                )}
                <div ref={conversationEndRef} />
              </AIConversationContent>
              <AIConversationScrollButton />
            </AIConversation>
          </div>
          
          {/* Input Area - Styled similar to candidate search */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative rounded-xl border border-black/10 dark:border-white/10 bg-neutral-800/5">
              <Textarea
                ref={textareaRef}
                placeholder={`Ask anything about ${
                  selectedCandidates.length === 1 
                    ? selectedCandidates[0].name 
                    : "the selected candidates"
                }...`}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl px-4 py-3 pr-14 min-h-[48px] max-h-[120px] bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:outline-none"
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3">
                <Button 
                  type="submit" 
                  size="icon"
                  className={cn(
                    "rounded-full p-2",
                    input.trim() && !isLoading
                      ? "bg-neutral-800 dark:bg-neutral-700 text-white hover:bg-neutral-700"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  )}
                  disabled={!input.trim() || isLoading}
                >
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {isLoading && (
              <p className="text-xs text-neutral-500 mt-1.5 ml-1">Generating response...</p>
            )}
          </form>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full rounded-xl border border-black/10 dark:border-white/10 p-8 text-center text-muted-foreground">
          Select one or more candidates to ask questions about them
        </div>
      )}
    </div>
  )
}
