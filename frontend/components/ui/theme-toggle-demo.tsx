"use client"

import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"

export function ThemeToggleDemo() {
  return (
    <div className="h-full w-full flex items-center justify-center gap-4 flex-wrap p-8">
      <div className="text-center mb-8 w-full">
        <h2 className="text-2xl font-bold mb-2">Theme Toggle Animations Demo</h2>
        <p className="text-muted-foreground">Click any button to see different animation effects</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ThemeToggleButton showLabel variant="circle-blur" start="top-left" />
        <ThemeToggleButton showLabel variant="circle-blur" start="top-right" />
        <ThemeToggleButton showLabel variant="circle-blur" start="bottom-left" />
        <ThemeToggleButton showLabel variant="circle-blur" start="bottom-right" />

        <ThemeToggleButton showLabel variant="circle" start="top-left" />
        <ThemeToggleButton showLabel variant="circle" start="top-right" />
        <ThemeToggleButton showLabel variant="circle" start="bottom-left" />
        <ThemeToggleButton showLabel variant="circle" start="bottom-right" />

        <ThemeToggleButton showLabel variant="circle" start="center" />
        <ThemeToggleButton showLabel variant="polygon" start="top-left" />
        <ThemeToggleButton showLabel variant="polygon" start="top-right" />
        <ThemeToggleButton showLabel variant="polygon" start="bottom-left" />
      </div>
    </div>
  )
}
