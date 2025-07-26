"use client"

import { useState, useRef, useEffect } from "react"
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@/components/ui/kibo-ui/ai/conversation"
import { AIMessage, AIMessageContent } from "@/components/ui/kibo-ui/ai/message"
import { AIResponse } from "@/components/ui/kibo-ui/ai/response"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"

interface CandidateCompareProps {
  selectedCandidates: any[]
  onClose?: () => void
}

export function CandidateComparisonChat({ selectedCandidates, onClose }: CandidateCompareProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([
    { 
      role: "assistant", 
      content: `I can help you compare these ${selectedCandidates.length} selected candidates. What would you like to know about them?` 
    }
  ])
  const [inputValue, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStreamingContent, setCurrentStreamingContent] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    
    const userMessage = inputValue.trim()
    setValue("")
    
    // Add user message to the conversation
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)
    
    try {
      setIsStreaming(true)
      setCurrentStreamingContent("")
      
      // Simulate streaming response (in a real app, you'd use a streaming API endpoint)
      const response = await apiClient.compareCandidates(selectedCandidates, userMessage)
      
      // Simulate token-by-token streaming
      const tokens = response.content.split(" ")
      for (let i = 0; i < tokens.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)) // 20ms delay between "tokens"
        setCurrentStreamingContent(prev => prev + tokens[i] + " ")
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: response.content }])
    } catch (error) {
      console.error("Error getting comparison:", error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error while comparing the candidates. Please try again." 
      }])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setCurrentStreamingContent("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <AIConversation className="relative flex-grow rounded-lg border bg-black/10 backdrop-blur-sm">
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
          
          {isStreaming && currentStreamingContent && (
            <AIMessage from="assistant">
              <AIMessageContent>
                <AIResponse>{currentStreamingContent}</AIResponse>
              </AIMessageContent>
            </AIMessage>
          )}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      
      <div className="flex items-end space-x-2 mt-4">
        <Textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a question about the selected candidates..."
          className="min-h-[60px] flex-1 resize-none border rounded-lg bg-black/60 text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#ff3f17]"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="mb-0.5 h-10 w-10 rounded-full bg-[#ff3f17] p-2 text-white hover:bg-[#ff3f17]/80"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
