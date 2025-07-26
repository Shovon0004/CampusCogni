"use client";

import { ArrowRight, Bot, Loader2, Award, Briefcase, Code, ThumbsUp, LineChart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "../../../hooks/use-auto-resize-textarea";
import TypewriterEffect from "@/components/typewriter-effect";
import SkillBar from "@/components/skill-bar";
import ComparisonCard from "@/components/comparison-card";
import { apiClient } from "@/lib/api";
import "../../../app/recruiter/candidate-search/minimal-chat.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
  visualData?: {
    type: "comparison" | "skills" | "text";
    data: any;
  };
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

  // Helper function to detect comparison requests
  const isComparisonRequest = (text: string): boolean => {
    const comparisonKeywords = [
      'compare', 'comparison', 'versus', 'vs', 'difference', 'better', 
      'stronger', 'weaker', 'match', 'against', 'which one', 'who has'
    ];
    
    return comparisonKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Helper to detect skill analysis requests
  const isSkillAnalysisRequest = (text: string): boolean => {
    const skillKeywords = [
      'skill', 'expertise', 'proficiency', 'competency', 'ability', 
      'experience with', 'knowledge of', 'technical', 'stack'
    ];
    
    return skillKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleSendMessage = async () => {
    if (!value.trim() || isLoading || selectedCandidates.length === 0) return;
    
    // Check if the user is logged in by checking for token
    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [
        ...prev,
        { role: "user" as const, content: value },
        { role: "assistant", content: "You need to be logged in to use this feature. Please log in and try again." }
      ]);
      setValue("");
      adjustHeight(true);
      return;
    }
    
    // Add user message
    const userMessage = { role: "user" as const, content: value };
    setMessages(prev => [...prev, userMessage]);
    
    const userQuery = value;
    setValue("");
    adjustHeight(true);
    setIsLoading(true);
    
    try {
      // First add a placeholder that will show typing animation
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "",
        isTyping: true 
      }]);

      // Determine which API endpoint to use based on the query
      let response;
      
      // Always use the Q&A API since the comparison API endpoint doesn't exist
      // This will handle both general questions and comparison questions
      response = await apiClient.askAboutCandidates(selectedCandidates, userQuery);

      // Remove the typing message
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      // Process the response based on the type of query
      if (isComparisonRequest(userQuery) && selectedCandidates.length > 1) {
        // For comparison requests with visualization, we need to parse the response
        // Try to extract comparison data from the answer, if possible
        try {
          // First, handle the case where we might get comparison data directly in the response
          if (response.comparison) {
            const comparisonData = response.comparison || {};
            
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: response.summary || "Here's a comparison of the selected candidates:",
                visualData: {
                  type: "comparison",
                  data: {
                    skills: comparisonData.skills || [],
                    experience: comparisonData.experience || [],
                    education: comparisonData.education || [],
                    overall: comparisonData.overall || []
                  }
                }
              }
            ]);
          } else {
            // If no structured comparison data, just display the text answer
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: response.answer || "Based on my analysis of the selected candidates:"
              }
            ]);
          }
        } catch (parseError) {
          // If we can't extract comparison data, just show the text answer
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: response.answer || "Based on my analysis of the selected candidates:"
            }
          ]);
        }
      } 
      else if (isSkillAnalysisRequest(userQuery)) {
        // For skill analysis requests, add skill visualization if available
        if (response.skills) {
          const skillsData = response.skills || {};
          
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: response.answer || "Here's an analysis of the candidate's skills:",
              visualData: {
                type: "skills",
                data: skillsData
              }
            }
          ]);
        } else {
          // Just show the text response if no structured skills data
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: response.answer || "Based on my analysis of the candidate's skills:"
            }
          ]);
        }
      }
      else {
        // For general queries, just show the answer
        setMessages(prev => [
          ...prev, 
          {
            role: "assistant",
            content: response.answer || "Based on the profiles of the selected candidates, I can provide the following information."
          }
        ]);
      }
    } catch (error) {
      // Remove typing indicator if there was an error
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      // Create a more informative error message
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : "Unknown error occurred";
      
      console.error("AI Chat Error:", error);
      
      // Handle authentication errors specifically
      if (errorMessage.includes("Invalid or expired token")) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: "Your session has expired. Please log in again to continue using this feature."
          }
        ]);
        
        // Optional: Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      } else {
        // For other errors
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: "Sorry, I encountered an error processing your request. Please try again. " + 
              (process.env.NODE_ENV === 'development' ? `(${errorMessage})` : "")
          }
        ]);
      }
    } finally {
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
            
            {/* Message content with typewriter effect for assistant */}
            <div className="text-sm">
              {message.role === 'assistant' && message.isTyping ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-white/70 animate-spin" />
                  <span className="text-white/70">typing...</span>
                </div>
              ) : message.role === 'assistant' ? (
                <TypewriterEffect text={message.content} delay={10} />
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
            
            {/* Render visual data if available */}
            {message.visualData && (
              <div className="mt-3 pt-3 border-t border-white/10">
                {message.visualData.type === 'comparison' && (
                  <div className="space-y-4">
                    {message.visualData.data.overall && message.visualData.data.overall.length > 0 && (
                      <ComparisonCard 
                        title="Overall Comparison" 
                        icon={<Award className="h-4 w-4" />}
                        candidates={message.visualData.data.overall.map((item: any) => ({
                          name: item.name,
                          value: item.score,
                          color: `bg-gradient-to-r from-gray-500 to-gray-600`
                        }))}
                      />
                    )}
                    
                    {message.visualData.data.skills && message.visualData.data.skills.length > 0 && (
                      <ComparisonCard 
                        title="Technical Skills" 
                        icon={<Code className="h-4 w-4" />}
                        candidates={message.visualData.data.skills.map((item: any) => ({
                          name: item.name,
                          value: item.score,
                          color: `bg-gradient-to-r from-gray-400 to-gray-500`
                        }))}
                      />
                    )}
                    
                    {message.visualData.data.experience && message.visualData.data.experience.length > 0 && (
                      <ComparisonCard 
                        title="Experience" 
                        icon={<Briefcase className="h-4 w-4" />}
                        candidates={message.visualData.data.experience.map((item: any) => ({
                          name: item.name,
                          value: item.score,
                          color: `bg-gradient-to-r from-gray-500 to-gray-600`
                        }))}
                      />
                    )}
                  </div>
                )}
                
                {message.visualData.type === 'skills' && (
                  <div className="space-y-3 mt-1">
                    <h4 className="text-xs font-medium text-white/70">Skill Assessment:</h4>
                    {Object.entries(message.visualData.data).map(([skill, score]: [string, any], idx) => (
                      <SkillBar 
                        key={idx}
                        skillName={skill}
                        value={typeof score === 'number' ? score : 0}
                        maxValue={10}
                        color={`bg-gradient-to-r from-gray-500 to-gray-600`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && !messages.some(m => m.isTyping) && (
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
            onClick={() => setValue(`Compare ${selectedCandidates.length} candidates based on their technical skills, experience, and overall fit`)}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            <span className="flex items-center gap-1">
              <LineChart className="w-3 h-3" />
              Compare candidates
            </span>
          </button>
          <button
            onClick={() => setValue("Who has better technical skills and what's the difference between their expertise?")}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              Technical skills
            </span>
          </button>
          <button
            onClick={() => setValue("Who would be the best fit for a senior developer position and why?")}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Seniority match
            </span>
          </button>
        </div>
      )}

      {selectedCandidates.length === 1 && (
        <div className="px-3 mb-2 flex flex-wrap gap-2">
          <button
            onClick={() => setValue(`Analyze ${selectedCandidates[0]?.name || "candidate"}'s technical skills with ratings`)}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              Skill analysis
            </span>
          </button>
          <button
            onClick={() => setValue(`What are ${selectedCandidates[0]?.name || "this candidate"}'s strengths and weaknesses?`)}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              Strengths & weaknesses
            </span>
          </button>
          <button
            onClick={() => setValue(`What role would ${selectedCandidates[0]?.name || "this candidate"} be best suited for based on their experience?`)}
            className="text-xs py-1 px-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white/80 rounded-full transition-colors"
          >
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Best role match
            </span>
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
