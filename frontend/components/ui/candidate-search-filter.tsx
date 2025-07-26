"use client"

import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface FilterOption {
  id: string
  label: string
  options: string[]
  multiSelect?: boolean
  selected: string[]
}

interface FilterProps {
  onFilterChange: (filterQuery: string) => void
  className?: string
}

export function CandidateSearchFilter({ onFilterChange, className }: FilterProps) {
  const [topSkills, setTopSkills] = useState<string[]>([
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "SQL", 
    "NoSQL", "AWS", "Azure", "Docker", "Kubernetes"
  ])
  
  const [filters, setFilters] = useState<FilterOption[]>([
    {
      id: "jobRole",
      label: "Job Role",
      options: ["Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "QA Engineer"],
      multiSelect: true,
      selected: [],
    },
    {
      id: "experience",
      label: "Experience",
      options: ["Fresher", "0-1 Years", "1-3 Years", "3-5 Years", "5+ Years"],
      selected: [],
    },
    {
      id: "skills",
      label: "Skills",
      options: topSkills,
      multiSelect: true,
      selected: [],
    },
    {
      id: "count",
      label: "Number of Candidates",
      options: ["Top 5", "Top 10", "Top 20", "All"],
      selected: [],
    }
  ])
  
  // Load skills from skills.json
  useEffect(() => {
    fetch('/skills.json')
      .then(res => res.json())
      .then(skills => {
        // Get first 15 skills for UI simplicity
        const topSkills = skills.slice(0, 15)
        setTopSkills(topSkills)
        
        // Update the skills filter with the fetched skills
        setFilters(prevFilters => {
          return prevFilters.map(filter => {
            if (filter.id === "skills") {
              return { ...filter, options: topSkills }
            }
            return filter
          })
        })
      })
      .catch(err => console.error("Error loading skills:", err))
  }, [])

  // Effect to update the query whenever filters change
  useEffect(() => {
    const selectedFilters = filters.reduce((acc: Record<string, string[]>, filter) => {
      if (filter.selected.length > 0) {
        acc[filter.id] = filter.selected
      }
      return acc
    }, {})
    
    // Create a natural language query from the filters
    let query = ""
    
    // Add job roles
    if (selectedFilters.jobRole?.length) {
      query += `Looking for ${selectedFilters.jobRole.join(" or ")} `
    }
    
    // Add experience levels
    if (selectedFilters.experience?.length) {
      if (query) query += "with "
      else query += "Looking for candidates with "
      
      query += `${selectedFilters.experience.join(" or ")} experience `
    }
    
    // Add skills
    if (selectedFilters.skills?.length) {
      if (query) query += "who knows "
      else query += "Looking for candidates who know "
      
      query += `${selectedFilters.skills.join(", ")} `
    }
    
    // Add count - make it more specific for the AI
    if (selectedFilters.count?.length && selectedFilters.count[0]) {
      const countText = selectedFilters.count[0].toLowerCase();
      let countSpecificText;
      
      if (countText === "all") {
        countSpecificText = "all available candidates";
      } else if (countText.startsWith("top")) {
        // Extract the number from "Top X" format
        const numMatch = countText.match(/\d+/);
        if (numMatch) {
          countSpecificText = `the top ${numMatch[0]} candidates if available, without duplicating any profiles`;
        } else {
          countSpecificText = countText;
        }
      } else {
        countSpecificText = countText;
      }
      
      if (query) query += `. Return ${countSpecificText}.`
      else query += `Return ${countSpecificText}.`
    }
    
    // If there are any filters selected, notify parent component
    if (Object.keys(selectedFilters).length > 0) {
      onFilterChange(query.trim())
    } else {
      onFilterChange("")
    }
  }, [filters, onFilterChange])

  // Toggle filter selection
  const toggleFilter = (filterId: string, value: string) => {
    setFilters(prevFilters => {
      return prevFilters.map(filter => {
        if (filter.id === filterId) {
          // For non-multi-select, replace the selected array
          if (!filter.multiSelect) {
            // If already selected, deselect it
            if (filter.selected.includes(value)) {
              return { ...filter, selected: [] }
            }
            // Otherwise select the new value
            return { ...filter, selected: [value] }
          }
          
          // For multi-select, toggle the presence of the value
          const isSelected = filter.selected.includes(value)
          if (isSelected) {
            return { ...filter, selected: filter.selected.filter(v => v !== value) }
          } else {
            return { ...filter, selected: [...filter.selected, value] }
          }
        }
        return filter
      })
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters(prevFilters => {
      return prevFilters.map(filter => ({
        ...filter,
        selected: []
      }))
    })
  }

  // Count active filters
  const activeFiltersCount = filters.reduce((count, filter) => {
    return count + filter.selected.length
  }, 0)

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost" 
            className={cn(
              "rounded-full h-8 w-8 p-0 relative",
              activeFiltersCount > 0 && "text-[#ff3f17] border-[#ff3f17] border bg-[#ff3f17]/15"
            )}
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff3f17] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 bg-black/60 backdrop-blur-sm border-gray-700/70 text-white p-1.5">
          <div className="flex items-center justify-between py-1 px-1.5">
            <DropdownMenuLabel className="text-xs font-medium text-white py-0 m-0">Filter</DropdownMenuLabel>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-5 px-1.5 text-xs text-[#ff3f17] hover:text-[#ff3f17] hover:bg-[#ff3f17]/10"
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
          
          <div className="px-1">
            {filters.map((filter, index) => (
              <div key={filter.id} className="mb-1">
                <h4 className="text-xs font-medium text-gray-300 mb-0.5 px-0.5 flex items-center h-5">
                  {filter.label}
                </h4>
                <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                  {filter.options.slice(0, filter.id === "skills" ? 6 : filter.id === "jobRole" ? 5 : undefined).map(option => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(filter.id, option)}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full border transition-all leading-none",
                        filter.selected.includes(option)
                          ? "bg-[#ff3f17]/25 border-[#ff3f17] text-white"
                          : "bg-black/30 border-gray-600/70 text-gray-200 hover:bg-black/50"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {index < filters.length - 1 && <DropdownMenuSeparator className="my-1 bg-gray-700/50" />}
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
