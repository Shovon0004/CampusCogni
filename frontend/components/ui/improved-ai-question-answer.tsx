"use client"

import React, { useState, useEffect, useRef } from "react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Send, Sparkles } from "lucide-react"
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from '@/components/ui/ai/conversation'
import { AIMessage, AIMessageContent } from '@/components/ui/ai/message'
import { AIResponse } from '@/components/ui/ai/response'
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

interface AIQuestionAnswerProps {
  selectedCandidates: any[]
  className?: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 120

export function AIQuestionAnswer({ selectedCandidates, className }: AIQuestionAnswerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = `${MIN_HEIGHT}px`
    const newHeight = Math.max(
      MIN_HEIGHT,
      Math.min(textarea.scrollHeight, MAX_HEIGHT)
    )
    textarea.style.height = `${newHeight}px`
  }
  
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
      textareaRef.current.style.height = `${MIN_HEIGHT}px`
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
    <div className={cn("rounded-2xl overflow-hidden border border-black/10 shadow-lg", className)}>
      {selectedCandidates.length > 0 ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#ff3f17]/20 to-[#ff3f17]/5 dark:from-[#ff3f17]/30 dark:to-[#ff3f17]/10 p-4 border-b border-black/5">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-[#ff3f17] mr-2" />
              <h3 className="text-lg font-medium">
                {selectedCandidates.length === 1 
                  ? `Ask about ${selectedCandidates[0].name}`
                  : `Ask about ${selectedCandidates.length} selected candidates`}
              </h3>
            </div>
          </div>
          
          {/* Conversation Area */}
          <div className="flex-1 overflow-hidden">
            <AIConversation className="h-full border-none">
              <AIConversationContent className="p-4">
                {messages.map((message, index) => (
                  <AIMessage 
                    from={message.role} 
                    key={index}
                    className={cn(
                      message.role === "assistant" ? "bg-slate-50 dark:bg-slate-900/50" : "",
                      "rounded-xl p-3"
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
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3"
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
          
          {/* Input Area */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border-t border-black/5">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  placeholder={`Ask anything about ${
                    selectedCandidates.length === 1 
                      ? selectedCandidates[0].name 
                      : "the selected candidates"
                  }...`}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    adjustHeight()
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-2xl px-4 py-3 pr-12 resize-none min-h-[48px] max-h-[120px] bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff3f17]/30 transition-shadow"
                  disabled={isLoading}
                  rows={1}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "absolute right-2 bottom-2 rounded-full transition-colors",
                    input.trim()
                      ? "bg-[#ff3f17] hover:bg-[#ff3f17]/90 text-white"
                      : "bg-black/5 dark:bg-white/10 text-black/40 dark:text-white/40"
                  )}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {isLoading && (
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                  <span className="text-xs text-[#ff3f17]/80 animate-pulse">
                    Generating answer...
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#ff3f17]/50" />
            <p>Select one or more candidates to ask questions about them</p>
          </div>
        </div>
      )}
    </div>
  )
}
