"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Check, SparklesIcon } from "lucide-react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CardCarouselProps {
  candidates: any[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  onSelect?: (selectedCandidates: any[]) => void
  className?: string
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
  candidates,
  autoplayDelay = 0, // Disable autoplay by default
  showPagination = true,
  showNavigation = true,
  onSelect,
  className,
}) => {
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, boolean>>({})
  
  // Toggle candidate selection
  const toggleSelect = (candidate: any, index: number) => {
    const key = `${candidate.name || 'candidate'}-${index}`
    setSelectedCandidates(prev => {
      const newSelected = { ...prev, [key]: !prev[key] }
      
      // Call onSelect with array of selected candidates
      if (onSelect) {
        const selectedCandidatesList = candidates.filter((candidate, idx) => {
          const candidateKey = `${candidate.name || 'candidate'}-${idx}`
          return newSelected[candidateKey]
        })
        onSelect(selectedCandidatesList)
      }
      
      return newSelected
    })
  }
  
  // Get selection status
  const isSelected = (candidate: any, index: number) => {
    const key = `${candidate.name || 'candidate'}-${index}`
    return !!selectedCandidates[key]
  }

  // Count selected candidates
  const selectedCount = Object.values(selectedCandidates).filter(Boolean).length
  
  // CSS for the carousel
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background-image: none;
  }
  `
  
  return (
    <div className={cn("w-full", className)}>
      <style>{css}</style>
      <div className="mx-auto w-full max-w-5xl rounded-xl border border-black/5 p-2 shadow-sm">
        <div className="relative mx-auto flex w-full flex-col rounded-xl border border-black/5 bg-neutral-800/5 p-2 shadow-sm">
          {selectedCount > 0 && (
            <Badge
              variant="outline"
              className="absolute right-4 top-6 rounded-[14px] border border-black/10 text-base"
            >
              <Check className="mr-1 h-4 w-4" />
              {selectedCount} candidate{selectedCount !== 1 ? 's' : ''} selected
            </Badge>
          )}
          
          <div className="flex w-full items-center justify-center">
            <div className="w-full">
              <Swiper
                spaceBetween={30}
                autoplay={autoplayDelay > 0 ? {
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                } : false}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={"auto"}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                }}
                pagination={showPagination ? { clickable: true } : false}
                navigation={showNavigation}
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
                className="candidate-swiper"
              >
                {candidates.map((candidate, index) => (
                  <SwiperSlide key={index} className="py-10">
                    <div className={cn(
                      "relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg transition-all transform",
                      isSelected(candidate, index) && "ring-2 ring-[#ff3f17] scale-[1.02]"
                    )}>
                      {/* Profile image */}
                      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
                        <Image
                          src="/placeholder-user.jpg"
                          alt={candidate.name || "Candidate"}
                          width={120}
                          height={120}
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white dark:border-gray-800"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="mt-16 p-4 text-center">
                        <h3 className="text-xl font-bold">{candidate.name || "Unnamed Candidate"}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.match ? `${candidate.match}% match` : ""}</p>
                        
                        {/* Skills */}
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {candidate.skills?.slice(0, 3).map((skill: string, i: number) => (
                              <Badge key={i} variant="secondary" className="rounded-full text-xs px-2">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills?.length > 3 && (
                              <Badge variant="outline" className="rounded-full text-xs px-2">
                                +{candidate.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Selection button */}
                        <Button 
                          onClick={() => toggleSelect(candidate, index)}
                          variant={isSelected(candidate, index) ? "default" : "outline"}
                          className={cn(
                            "mt-4 rounded-full",
                            isSelected(candidate, index) && "bg-[#ff3f17] hover:bg-[#ff3f17]/90"
                          )}
                          size="sm"
                        >
                          {isSelected(candidate, index) ? "Selected" : "Select Candidate"}
                        </Button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
