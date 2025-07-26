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
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
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
    if (messagesEndRef.current) {
      // Using a slight delay to ensure elements are rendered before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
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
  
  // Helper function to extract skill ratings from AI text response
  const extractSkillRatings = (text: string): Record<string, number> | null => {
    try {
      // Common programming skills to look for (improves accuracy)
      const commonSkills = [
        "JavaScript", "TypeScript", "Python", "Java", "C#", "C\\+\\+", "Ruby", "PHP", "Swift", "Kotlin", 
        "Go", "Rust", "SQL", "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "Django",
        "Flask", "Spring", "ASP.NET", "Laravel", "Rails", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
        "Git", "CI/CD", "DevOps", "Machine Learning", "AI", "Data Science", "Blockchain", "Frontend", 
        "Backend", "Fullstack", "Mobile", "iOS", "Android", "Cloud", "Testing", "UI/UX", "Design", 
        "GraphQL", "MongoDB", "Redis", "WebSockets", "REST API", "Microservices", "TDD", "Agile", "Scrum"
      ];
      
      const skills: Record<string, number> = {};
      
      // First, try to detect markdown tables which are the most reliable source
      const tableRows = text.split('\n').filter(line => line.includes('|'));
      
      if (tableRows.length > 2) {  // Need at least header, separator, and one data row
        console.log("Found potential markdown table format in AI response");
        
        // Skip the header and separator rows
        const dataRows = tableRows.slice(2);
        
        for (const row of dataRows) {
          const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
          
          if (cells.length >= 2) {
            const skillName = cells[0].replace(/[`*]/g, '').trim();
            const ratingCell = cells[1];
            
            // Look for rating patterns like 8/10 or just 8
            const ratingMatch = ratingCell.match(/(\d+)(?:\s*\/\s*(\d+))?/);
            
            if (ratingMatch && skillName.length > 1) {
              const rating = parseInt(ratingMatch[1], 10);
              const maxRating = ratingMatch[2] ? parseInt(ratingMatch[2], 10) : 10;
              
              // Normalize to a scale of 10
              let normalizedRating = (rating / maxRating) * 10;
              normalizedRating = Math.round(normalizedRating * 10) / 10; // Round to 1 decimal
              
              if (normalizedRating >= 0 && normalizedRating <= 10 && !skills[skillName]) {
                skills[skillName] = normalizedRating;
              }
            } else if (skillName.length > 1) {
              // Check for word-based ratings
              const wordRatings = [
                { words: ['excellent', 'outstanding', 'exceptional', 'expert', 'mastery'], value: 9.5 },
                { words: ['very good', 'strong', 'proficient', 'advanced'], value: 8.5 },
                { words: ['good', 'solid', 'competent', 'capable'], value: 7.5 },
                { words: ['fair', 'moderate', 'intermediate', 'average'], value: 6.5 },
                { words: ['basic', 'beginner', 'elementary', 'limited'], value: 5.0 },
                { words: ['poor', 'weak', 'minimal', 'novice'], value: 3.5 }
              ];
              
              for (const { words, value } of wordRatings) {
                if (words.some(word => ratingCell.toLowerCase().includes(word))) {
                  skills[skillName] = value;
                  break;
                }
              }
            }
          }
        }
      }
      
      // If no skills were extracted from tables or not enough, try regex patterns
      if (Object.keys(skills).length < 3) {
        // Stronger pattern for skill rating extraction (prioritizes markdown formats like `JavaScript`: 8/10)
        const patternTypes = [
          // Markdown style with backticks: `JavaScript`: 9/10
          new RegExp(`\`(${commonSkills.join('|')}|[A-Za-z0-9+#.\\-_/]+(?:\\s*[A-Za-z0-9+#.\\-_/]+)*)\`\\s*(?::|-)\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'gi'),
          
          // Bold style with asterisks: **JavaScript**: 9/10
          new RegExp(`\\*\\*(${commonSkills.join('|')}|[A-Za-z0-9+#.\\-_/]+(?:\\s*[A-Za-z0-9+#.\\-_/]+)*)\\*\\*\\s*(?::|-)\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'gi'),
          
          // List item with rating: - JavaScript: 9/10 or * JavaScript: 9/10
          new RegExp(`(?:^|\\n)\\s*[\\-\\*•]\\s*(${commonSkills.join('|')}|[A-Za-z0-9+#.\\-_/]+(?:\\s*[A-Za-z0-9+#.\\-_/]+)*)\\s*(?::|-)\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'gim'),
          
          // Standard format: JavaScript: 9/10
          new RegExp(`(${commonSkills.join('|')}|[A-Za-z0-9+#.\\-_/]+(?:\\s*[A-Za-z0-9+#.\\-_/]+)*)\\s*(?::|-)\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'gi')
        ];
        
        // Try each pattern type in priority order
        for (const regex of patternTypes) {
          const matches = [...text.matchAll(regex)];
          
          matches.forEach(match => {
            const skillName = match[1].trim().replace(/[`*]/g, '');  // Remove any markdown symbols
            
            // Skip non-skill words
            const nonSkillWords = ['rating', 'score', 'overall', 'total', 'average', 'summary', 'conclusion'];
            if (nonSkillWords.some(word => skillName.toLowerCase().includes(word))) return;
            
            const rating = parseInt(match[2], 10);
            const maxRating = match[3] ? parseInt(match[3], 10) : 10;
            
            // Normalize to a scale of 10
            let normalizedRating = (rating / maxRating) * 10;
            normalizedRating = Math.round(normalizedRating * 10) / 10; // Round to 1 decimal
            
            // Only include if it looks like a valid skill and not already added
            if (skillName.length > 1 && normalizedRating >= 0 && normalizedRating <= 10 && !skills[skillName]) {
              skills[skillName] = normalizedRating;
            }
          });
        }
        
        // Look for skills with ratings in parentheses: JavaScript (8/10)
        const parenthesisPattern = new RegExp(`(${commonSkills.join('|')}|[A-Za-z0-9+#.\\-_/]+(?:\\s*[A-Za-z0-9+#.\\-_/]+)*)\\s*\\((\\d+)(?:\\s*\\/\\s*(\\d+))?\\)`, 'gi');
        const parenthesisMatches = [...text.matchAll(parenthesisPattern)];
        
        parenthesisMatches.forEach(match => {
          const skillName = match[1].trim();
          const rating = parseInt(match[2], 10);
          const maxRating = match[3] ? parseInt(match[3], 10) : 10;
          
          // Normalize to a scale of 10
          let normalizedRating = (rating / maxRating) * 10;
          normalizedRating = Math.round(normalizedRating * 10) / 10; // Round to 1 decimal
          
          if (skillName.length > 1 && normalizedRating >= 0 && normalizedRating <= 10 && !skills[skillName]) {
            skills[skillName] = normalizedRating;
          }
        });
        
        // Secondary check for skills mentioned in the text with rating nearby
        for (const skill of commonSkills) {
          if (!skills[skill]) {
            const skillRegexes = [
              new RegExp(`${skill}[^.]*?(\\d+)\\s*\\/\\s*10`, 'i'),
              new RegExp(`${skill}[^.]*?rated\\s*(?:at)?\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'i'),
              new RegExp(`${skill}[^.]*?score\\s*(?:of)?\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'i')
            ];
            
            for (const regex of skillRegexes) {
              const match = text.match(regex);
              if (match) {
                const rating = parseInt(match[1], 10);
                const maxRating = match[2] ? parseInt(match[2], 10) : 10;
                
                // Normalize to a scale of 10
                let normalizedRating = (rating / maxRating) * 10;
                normalizedRating = Math.round(normalizedRating * 10) / 10; // Round to 1 decimal
                
                skills[skill] = normalizedRating;
                break;
              }
            }
          }
        }
        
        // Look for word-based ratings like "Expert in JavaScript"
        const wordRatings = [
          { words: ['excellent', 'outstanding', 'exceptional', 'expert', 'mastery'], value: 9.5 },
          { words: ['very good', 'strong', 'proficient', 'advanced'], value: 8.5 },
          { words: ['good', 'solid', 'competent', 'capable'], value: 7.5 },
          { words: ['fair', 'moderate', 'intermediate', 'average'], value: 6.5 },
          { words: ['basic', 'beginner', 'elementary', 'limited'], value: 5.0 },
          { words: ['poor', 'weak', 'minimal', 'novice'], value: 3.5 }
        ];
        
        for (const skill of commonSkills) {
          if (!skills[skill]) {
            for (const { words, value } of wordRatings) {
              for (const word of words) {
                // Check patterns like "Expert in JavaScript" or "JavaScript: Expert"
                const patternBefore = new RegExp(`${word}\\s+(?:in|with|at)\\s+${skill}`, 'i');
                const patternAfter = new RegExp(`${skill}\\s*(?::|-)\\s*${word}`, 'i');
                
                if (patternBefore.test(text) || patternAfter.test(text)) {
                  skills[skill] = value;
                  break;
                }
              }
            }
          }
        }
      }
      
      // Console log found skills for debugging
      if (Object.keys(skills).length > 0) {
        console.log("Extracted skills:", skills);
      }
      
      return Object.keys(skills).length > 0 ? skills : null;
    } catch (error) {
      console.error("Error extracting skill ratings:", error);
      return null;
    }
  };
  
  // Define interfaces for comparison data
  interface CandidateScore {
    name: string;
    score: number;
  }
  
  interface SkillComparison {
    skill: string;
    candidates: CandidateScore[];
  }
  
  interface ComparisonData {
    overall: CandidateScore[];
    skills: SkillComparison[];
    experience: CandidateScore[];
  }

  // Helper function to extract comparison data from AI text response
  const extractComparisonData = (text: string, candidateNames: string[]): ComparisonData | null => {
    try {
      if (candidateNames.length < 2) return null;
      
      const comparisonData: ComparisonData = {
        overall: [],
        skills: [],
        experience: []
      };
      
      // First, try to extract data from tables which are the most reliable format
      // Look for markdown tables with candidate names
      const tablePattern = /\|([^|]+)\|([^|]+)\|(?:[^|]+\|)*/g;
      const tableCells = [...text.matchAll(tablePattern)];
      
      if (tableCells.length > 0) {
        console.log("Found table format in AI response");
        
        // Get all skill names from table headers
        const skillNames: string[] = [];
        
        // Try to extract table data for each candidate
        const candidateScores: Record<string, Record<string, number>> = {};
        
        // Initialize candidate scores
        candidateNames.forEach(name => {
          candidateScores[name] = {};
        });
        
        // Process table cells
        tableCells.forEach(match => {
          const col1 = match[1].trim();
          const col2 = match[2].trim();
          
          // Check if col1 is a candidate name and col2 has a rating
          const candidateInCol1 = candidateNames.find(name => 
            col1.toLowerCase().includes(name.toLowerCase())
          );
          
          if (candidateInCol1) {
            const ratingMatch = col2.match(/(\d+)(?:\s*\/\s*(\d+))?/);
            if (ratingMatch) {
              const rating = parseInt(ratingMatch[1], 10);
              const maxRating = ratingMatch[2] ? parseInt(ratingMatch[2], 10) : 10;
              const normalizedRating = (rating / maxRating) * 10;
              
              // This seems to be an overall rating
              comparisonData.overall.push({
                name: candidateInCol1,
                score: normalizedRating
              });
            }
          }
          
          // Check if col1 is a skill and col2 has a candidate name and rating
          const skillNameMatch = col1.match(/^([A-Za-z0-9\s+#.\-_/]+)$/);
          if (skillNameMatch) {
            const potentialSkill = skillNameMatch[1].trim();
            
            // Check if this matches any candidate rating pattern
            candidateNames.forEach(name => {
              const candidateRatingPattern = new RegExp(`${name}[^0-9]*?(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'i');
              const match = col2.match(candidateRatingPattern);
              
              if (match) {
                if (!skillNames.includes(potentialSkill)) {
                  skillNames.push(potentialSkill);
                }
                
                const rating = parseInt(match[1], 10);
                const maxRating = match[2] ? parseInt(match[2], 10) : 10;
                const normalizedRating = (rating / maxRating) * 10;
                
                candidateScores[name][potentialSkill] = normalizedRating;
              }
            });
          }
        });
        
        // Process skill comparisons from the table data
        skillNames.forEach(skill => {
          const candidates = candidateNames
            .filter(name => candidateScores[name][skill] !== undefined)
            .map(name => ({
              name,
              score: candidateScores[name][skill]
            }));
            
          if (candidates.length >= 2) {
            comparisonData.skills.push({
              skill,
              candidates
            });
          }
        });
      }
      
      // If tables didn't yield enough data, try individual rating extraction
      if (comparisonData.overall.length < 2) {
        console.log("Falling back to text-based rating extraction");
        
        // For each candidate, try to find overall ratings in the text
        candidateNames.forEach(name => {
          if (!comparisonData.overall.find(item => item.name === name)) {
            // Look for patterns like "John: 8/10" or "John - 7" or "John scored 8 out of 10"
            const ratingPatterns = [
              new RegExp(`${name}\\s*(?::|-)\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'i'),
              new RegExp(`${name}[^.]*?(?:rated|scored|rating|score)\\s*(?:of|is|was)?\\s*(\\d+)(?:\\s*(?:out\\s*of|\\/)\\s*(\\d+))?`, 'i'),
              new RegExp(`${name}[^.]*?(?:overall|rating|score):\\s*(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'i')
            ];
            
            let matched = false;
            for (const pattern of ratingPatterns) {
              if (matched) break;
              
              const match = text.match(pattern);
              if (match) {
                const rating = parseInt(match[1], 10);
                const maxRating = match[2] ? parseInt(match[2], 10) : 10;
                const normalizedRating = (rating / maxRating) * 10;
                
                comparisonData.overall.push({
                  name,
                  score: normalizedRating
                });
                matched = true;
              }
            }
            
            // If still not matched, look for sentiment indicators
            if (!matched) {
              // Look for positive or negative sentiments
              const positiveIndicators = [
                `${name} is better`, 
                `${name} has stronger`,
                `${name} excels`,
                `${name} outperforms`,
                `${name} stands out`,
                `strongest candidate`,
                `most qualified`
              ];
              
              const negativeIndicators = [
                `${name} is weaker`,
                `${name} lacks`,
                `${name} has less`,
                `${name} falls short`,
                `less qualified`
              ];
              
              const positiveSentiment = positiveIndicators.some(indicator => 
                text.toLowerCase().includes(indicator.toLowerCase())
              );
              
              const negativeSentiment = negativeIndicators.some(indicator => 
                text.toLowerCase().includes(indicator.toLowerCase())
              );
              
              if (positiveSentiment) {
                comparisonData.overall.push({
                  name,
                  score: 8.5 // Higher score for positive sentiment
                });
              } else if (negativeSentiment) {
                comparisonData.overall.push({
                  name,
                  score: 6.5 // Lower score for negative sentiment
                });
              }
            }
          }
        });
      }
      
      // Extract skill-specific comparisons if not already found from tables
      if (comparisonData.skills.length === 0) {
        // Common skills to look for
        const commonSkills = [
          "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Ruby", "PHP", 
          "React", "Angular", "Vue", "Node.js", "Frontend", "Backend", "DevOps",
          "Database", "SQL", "AWS", "Azure", "GCP", "Cloud", "Docker", "Kubernetes"
        ];
        
        // For each common skill, check if it's mentioned with candidates
        commonSkills.forEach(skill => {
          const skillMention = text.indexOf(skill);
          
          if (skillMention >= 0) {
            // Extract the surrounding text
            const surroundingText = text.substring(
              Math.max(0, skillMention - 100), 
              Math.min(text.length, skillMention + 100)
            );
            
            // Look for candidate mentions in this section
            const candidatesWithRatings = [];
            
            for (const name of candidateNames) {
              if (surroundingText.includes(name)) {
                // Try to find a rating for this candidate and skill
                const ratingPattern = new RegExp(`${name}[^.]*?${skill}[^.]*?(\\d+)(?:\\s*\\/\\s*(\\d+))?|${skill}[^.]*?${name}[^.]*?(\\d+)(?:\\s*\\/\\s*(\\d+))?`, 'i');
                const match = surroundingText.match(ratingPattern);
                
                if (match) {
                  const rating = parseInt(match[1] || match[3], 10);
                  const maxRating = match[2] || match[4] ? parseInt(match[2] || match[4], 10) : 10;
                  const normalizedRating = (rating / maxRating) * 10;
                  
                  candidatesWithRatings.push({
                    name,
                    score: normalizedRating
                  });
                }
              }
            }
            
            if (candidatesWithRatings.length >= 2) {
              comparisonData.skills.push({
                skill,
                candidates: candidatesWithRatings
              });
            }
          }
        });
      }
      
      // If we have enough data, return it
      const hasData = comparisonData.overall.length >= 2 || comparisonData.skills.length > 0;
      
      // Log the extracted comparison data
      if (hasData) {
        console.log("Extracted comparison data:", comparisonData);
      }
      
      return hasData ? comparisonData : null;
    } catch (error) {
      console.error("Error extracting comparison data:", error);
      return null;
    }
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

      // Process the response based on the type of query and actual content
      const answer = response.answer || "Based on the profiles of the selected candidates, I don't have enough information to provide a detailed answer.";
      const candidateNames = selectedCandidates.map(c => c.name || `Candidate ${c.id || ""}`);
      
      // Always try to intelligently extract data from the AI response first
      const extractedSkills = extractSkillRatings(answer);
      const extractedComparison = extractComparisonData(answer, candidateNames);
      
      // Check if we have structured data from the API
      const hasApiComparisonData = response.comparison && 
        (response.comparison.skills?.length > 0 || 
         response.comparison.experience?.length > 0 || 
         response.comparison.overall?.length > 0);
         
      const hasApiSkillsData = response.skills && Object.keys(response.skills).length > 0;
      
      if (isComparisonRequest(userQuery) && selectedCandidates.length > 1) {
        if (hasApiComparisonData) {
          // If API provided structured comparison data, use it directly
          const comparisonData = response.comparison;
          
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: response.summary || answer,
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
        }
        else if (extractedComparison) {
          // If we successfully extracted comparison data from the text response
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: answer,
              visualData: {
                type: "comparison",
                data: extractedComparison
              }
            }
          ]);
        }
        else {
          // No structured data, but it's still a comparison request
          // Try to find mentions of candidates in the response and create basic comparison
          const mentionedCandidates = candidateNames.filter(name => 
            answer.toLowerCase().includes(name.toLowerCase())
          );
          
          if (mentionedCandidates.length >= 2) {
            // Create a simple overall comparison
            const comparisonData = {
              overall: mentionedCandidates.map((name, index, array) => {
                // Position in the response could indicate importance
                const position = answer.toLowerCase().indexOf(name.toLowerCase());
                // Earlier mentions often indicate stronger candidates
                const score = 8 - (index * (3 / array.length));
                
                return {
                  name,
                  score: Math.max(5, Math.min(10, score)) // Keep between 5-10
                };
              })
            };
            
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: answer,
                visualData: {
                  type: "comparison",
                  data: comparisonData
                }
              }
            ]);
          } else {
            // Just show the text response
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: answer
              }
            ]);
          }
        }
      } 
      else if (isSkillAnalysisRequest(userQuery) || userQuery.toLowerCase().includes('rate') || userQuery.toLowerCase().includes('evaluation')) {
        if (hasApiSkillsData) {
          // Use API-provided skill data
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: answer,
              visualData: {
                type: "skills",
                data: response.skills
              }
            }
          ]);
        }
        else if (extractedSkills) {
          // Use skills data extracted from the AI response text
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: answer,
              visualData: {
                type: "skills",
                data: extractedSkills
              }
            }
          ]);
        }
        else if (selectedCandidates.length === 1) {
          // For a single candidate, try to get skills from their profile
          const candidate = selectedCandidates[0];
          const candidateSkills: Record<string, number> = {};
          
          // Check if candidate has skills in their profile
          if (candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0) {
            // Use actual skills from candidate profile
            candidate.skills.forEach((skill: string) => {
              // Look for this skill in the answer to find sentiment
              const skillMention = answer.toLowerCase().indexOf(skill.toLowerCase());
              
              if (skillMention >= 0) {
                // Look for nearby words that might indicate proficiency
                const nearbyText = answer.substring(
                  Math.max(0, skillMention - 20), 
                  Math.min(answer.length, skillMention + skill.length + 20)
                ).toLowerCase();
                
                let rating = 7; // Default middle rating
                
                // Adjust rating based on sentiment words
                if (nearbyText.includes('expert') || nearbyText.includes('excellent') || 
                    nearbyText.includes('advanced') || nearbyText.includes('proficient')) {
                  rating = 9;
                } else if (nearbyText.includes('good') || nearbyText.includes('strong')) {
                  rating = 8;
                } else if (nearbyText.includes('average') || nearbyText.includes('moderate')) {
                  rating = 6;
                } else if (nearbyText.includes('basic') || nearbyText.includes('beginner')) {
                  rating = 5;
                } else if (nearbyText.includes('weak') || nearbyText.includes('poor')) {
                  rating = 4;
                }
                
                candidateSkills[skill] = rating;
              } else {
                // Skill not mentioned in response, assign a neutral rating
                candidateSkills[skill] = 6;
              }
            });
            
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: answer,
                visualData: {
                  type: "skills",
                  data: candidateSkills
                }
              }
            ]);
          } else {
            // No skills data available, just show the text response
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: answer
              }
            ]);
          }
        } else {
          // No visualization data available
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: answer
            }
          ]);
        }
      }
      else {
        // For any other type of question, check if the answer contains data that could be visualized
        if (answer.includes('rating') || answer.includes('score') || answer.includes('/10')) {
          // Try extracting skills or ratings
          if (extractedSkills && Object.keys(extractedSkills).length >= 2) {
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: answer,
                visualData: {
                  type: "skills",
                  data: extractedSkills
                }
              }
            ]);
          } else {
            // Just show the text response
            setMessages(prev => [
              ...prev, 
              {
                role: "assistant",
                content: answer
              }
            ]);
          }
        } else {
          // Standard response without visualization for general queries
          setMessages(prev => [
            ...prev, 
            {
              role: "assistant",
              content: answer
            }
          ]);
        }
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
    <div className="minimal-chat-container bg-[#0D0D0D] dark:bg-[#0D0D0D] rounded-2xl p-1.5 pt-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2.5 mx-3">
        <div className="flex-1 flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-white/90" />
          <h3 className="text-white/90 text-xs tracking-tighter">
            Candidate Assistant
          </h3>
        </div>
      </div>
      
      <div className="ai-conversation flex-1 overflow-y-auto mb-2 px-1.5 scroll-container">
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
            
            {/* Message content with typewriter effect and markdown support for assistant */}
            <div className="text-sm markdown-content">
              {message.role === 'assistant' && message.isTyping ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-white/70 animate-spin" />
                  <span className="text-white/70">typing...</span>
                </div>
              ) : message.role === 'assistant' ? (
                // Check if content has markdown patterns
                message.content.includes('```') || 
                message.content.includes('$') ||
                message.content.includes('#') ||
                message.content.includes('|') ||
                (message.content.includes('*') && message.content.includes('*')) ? (
                  // Content has markdown, use ReactMarkdown directly
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({node, ...props}) => <p className="whitespace-pre-wrap" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  // No markdown, use typewriter effect
                  <TypewriterEffect text={message.content} delay={10} />
                )
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
