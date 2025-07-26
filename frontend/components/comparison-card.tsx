"use client";

import React from 'react';

interface ComparisonCardProps {
  title: string;
  candidates: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  icon?: React.ReactNode;
}

export default function ComparisonCard({ title, candidates, icon }: ComparisonCardProps) {
  // Find the highest value to calculate percentages
  const maxValue = Math.max(...candidates.map(c => c.value));
  
  return (
    <div className="bg-[#1A1A1A] rounded-lg p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-white/70">{icon}</div>}
        <h3 className="text-sm font-medium text-white/90">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {candidates.map((candidate, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/80">{candidate.name}</span>
              <span className="text-white/60">{candidate.value}</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div 
                className={candidate.color || "bg-white/30"}
                style={{ 
                  width: `${(candidate.value / maxValue) * 100}%`,
                  height: '100%'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
