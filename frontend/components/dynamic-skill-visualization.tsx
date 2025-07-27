"use client";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import SkillBar from './skill-bar';

interface DynamicSkillVisualizationProps {
  // Data can be either skills object or comparison data
  data: Record<string, number> | {
    overall?: Array<{ name: string, score: number }>,
    skills?: Array<{ skill: string, candidates: Array<{ name: string, score: number }> }>
  };
  type: 'skills' | 'comparison';
  className?: string;
}

// Color palette for different skill ratings
const getSkillColor = (value: number) => {
  if (value >= 9) return "bg-gradient-to-r from-green-500 to-emerald-600";
  if (value >= 7.5) return "bg-gradient-to-r from-teal-500 to-teal-600";
  if (value >= 6) return "bg-gradient-to-r from-blue-500 to-blue-600";
  if (value >= 4) return "bg-gradient-to-r from-amber-500 to-amber-600";
  return "bg-gradient-to-r from-red-500 to-red-600";
};

// Color palette for different candidates
const candidateColors = [
  "bg-gradient-to-r from-blue-500 to-blue-600",
  "bg-gradient-to-r from-purple-500 to-purple-600",
  "bg-gradient-to-r from-teal-500 to-teal-600",
  "bg-gradient-to-r from-amber-500 to-amber-600",
  "bg-gradient-to-r from-green-500 to-green-600",
];

export default function DynamicSkillVisualization({ 
  data, 
  type,
  className 
}: DynamicSkillVisualizationProps) {
  const [animateIn, setAnimateIn] = useState(false);
  
  // Track candidate colors to keep them consistent
  const [candidateColorMap, setCandidateColorMap] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Initialize the animation after mounting
    const timer = setTimeout(() => setAnimateIn(true), 100);
    
    // Create a color map for candidates if comparing multiple
    if (type === 'comparison') {
      const comparisonData = data as {
        overall?: Array<{ name: string, score: number }>,
        skills?: Array<{ skill: string, candidates: Array<{ name: string, score: number }> }>
      };
      
      if (comparisonData.overall) {
        const newColorMap: Record<string, string> = {};
        comparisonData.overall.forEach((candidate, index) => {
          newColorMap[candidate.name] = candidateColors[index % candidateColors.length];
        });
        setCandidateColorMap(newColorMap);
      }
    }
    
    return () => clearTimeout(timer);
  }, [data, type]);
  
  // For single candidate skill visualization
  if (type === 'skills') {
    const skillsData = data as Record<string, number>;
    const sortedSkills = Object.entries(skillsData)
      .sort((a, b) => b[1] - a[1]); // Sort by skill value descending
    
    return (
      <div className={cn("space-y-4 pt-2 animate-fade-in", className)}>
        <h3 className="text-sm font-medium text-white/90 mb-2">Skill Analysis</h3>
        
        <div className="space-y-3">
          {sortedSkills.map(([skillName, value], index) => (
            <div 
              key={skillName}
              className={cn(
                "transition-all duration-500 transform",
                animateIn 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-4",
                {
                  "transition-delay-100": index < 3,
                  "transition-delay-200": index >= 3 && index < 6,
                  "transition-delay-300": index >= 6 && index < 9,
                  "transition-delay-400": index >= 9
                }
              )}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <SkillBar 
                skillName={skillName}
                value={value}
                maxValue={10}
                color={getSkillColor(value)}
              />
            </div>
          ))}
        </div>
        
        {sortedSkills.length > 0 && (
          <div className="flex justify-between text-xs text-white/60 px-1 pt-2">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
              <span>Basic</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
              <span>Intermediate</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
              <span>Good</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
              <span>Expert</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For comparison between candidates
  const comparisonData = data as {
    overall?: Array<{ name: string, score: number }>,
    skills?: Array<{ skill: string, candidates: Array<{ name: string, score: number }> }>
  };
  
  return (
    <div className={cn("space-y-4 pt-2", className)}>
      {/* Overall comparison section */}
      {comparisonData.overall && comparisonData.overall.length > 0 && (
        <div className={cn(
          "bg-[#1A1A1A] rounded-lg p-3 mb-4",
          animateIn ? "animate-slide-up" : "opacity-0"
        )}>
          <h3 className="text-sm font-medium text-white/90 mb-2">Overall Comparison</h3>
          
          <div className="space-y-3">
            {comparisonData.overall.map((candidate, index) => (
              <div 
                key={index} 
                className={cn(
                  "transition-all duration-300 transform",
                  animateIn 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-2"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between text-xs">
                  <span className="text-white/80">{candidate.name}</span>
                  <span className="text-white/60">{candidate.score.toFixed(1)}/10</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className={candidateColorMap[candidate.name] || candidateColors[index % candidateColors.length]}
                    style={{ 
                      width: `${(candidate.score / 10) * 100}%`,
                      height: '100%',
                      transition: 'width 1s ease-out'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skills comparison by category */}
      {comparisonData.skills && comparisonData.skills.length > 0 && (
        <div className={cn(
          "bg-[#1A1A1A] rounded-lg p-3",
          animateIn ? "animate-slide-up-delayed" : "opacity-0"
        )}>
          <h3 className="text-sm font-medium text-white/90 mb-2">Skills Comparison</h3>
          
          <div className="space-y-5">
            {comparisonData.skills.map((skillItem, skillIndex) => (
              <div key={skillIndex} className="pb-3 border-b border-white/5 last:border-0">
                <h4 className="text-xs font-medium text-white/70 mb-2">{skillItem.skill}</h4>
                
                <div className="space-y-2">
                  {skillItem.candidates.map((candidate, candidateIndex) => (
                    <div 
                      key={candidateIndex}
                      className={cn(
                        "transition-all duration-300 transform",
                        animateIn 
                          ? "opacity-100 translate-y-0" 
                          : "opacity-0 translate-y-2"
                      )}
                      style={{ transitionDelay: `${(skillIndex * 100) + (candidateIndex * 50)}ms` }}
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">{candidate.name}</span>
                        <span className="text-white/60">{candidate.score.toFixed(1)}/10</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className={candidateColorMap[candidate.name] || candidateColors[candidateIndex % candidateColors.length]}
                          style={{ 
                            width: `${(candidate.score / 10) * 100}%`,
                            height: '100%',
                            transition: 'width 1s ease-out'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legend for candidate colors */}
      {comparisonData.overall && comparisonData.overall.length > 1 && (
        <div className="flex flex-wrap gap-3 text-xs text-white/60 px-1 pt-2">
          {comparisonData.overall.map((candidate, index) => (
            <div key={index} className="flex items-center">
              <div 
                className={`h-2 w-2 rounded-full mr-1 ${candidateColorMap[candidate.name] || candidateColors[index % candidateColors.length]}`}
              ></div>
              <span>{candidate.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
