"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface SkillBarProps {
  skillName: string;
  value: number;
  maxValue?: number;
  color?: string;
}

export default function SkillBar({ 
  skillName, 
  value, 
  maxValue = 100,
  color = "bg-gradient-to-r from-gray-500 to-gray-600"
}: SkillBarProps) {
  const percentage = Math.min(Math.max(0, (value / maxValue) * 100), 100);
  
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-white/90">{skillName}</span>
        <span className="text-xs text-white/70">{value}/{maxValue}</span>
      </div>
      <div className="h-2 bg-black/20 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
