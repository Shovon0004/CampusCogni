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
    <div className={className}>
      {selectedCandidates.length > 0 ? (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden mb-4">
            <AIConversation className="relative h-full rounded-lg border shadow-sm">
              <AIConversationContent>
                {messages.map((message, index) => (
                  <AIMessage from={message.role} key={index}>
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
                  <AIMessage from="assistant">
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
          
          <form onSubmit={handleSubmit} className="relative">
            <Textarea 
              placeholder={`Ask anything about ${
                selectedCandidates.length === 1 
                  ? selectedCandidates[0].name 
                  : "the selected candidates"
              }...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-12 resize-none h-20"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 bottom-2"
              disabled={!input.trim() || isLoading}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full rounded-lg border p-8 text-center text-muted-foreground">
          Select one or more candidates to ask questions about them
        </div>
      )}
    </div>
  )
}
