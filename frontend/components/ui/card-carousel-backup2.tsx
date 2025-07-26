"use client"

import React, { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Check } from "lucide-react"

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
import CardFlip from "@/components/kokonutui/card-flip"

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
    display: flex;
    justify-content: center;
    align-items: center;
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

  /* Fix for CardFlip sizing in carousel */
  .swiper-slide .card-flip-container {
    height: 340px;  /* Match default CardFlip height */
    width: 280px;   /* Match default CardFlip width */
    margin: 0 auto;
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
              className="absolute right-4 top-6 z-10 rounded-[14px] border border-black/10 text-base"
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
                {candidates.map((candidate, index) => {
                  // Prepare CardFlip props
                  const candidateSkills = candidate.skills?.slice(0, 4) || [];
                  const matchText = candidate.match ? `${candidate.match}% match` : "";
                  
                  return (
                    <SwiperSlide key={index} className="py-10">
                      <div 
                        className={cn(
                          "card-wrapper relative transition-all transform cursor-pointer p-2",
                          isSelected(candidate, index) && "ring-2 ring-[#ff3f17] scale-[1.02]"
                        )}
                      >
                        {/* Wrapper to maintain proper dimensions */}
                        <div className="card-flip-container" onClick={() => toggleSelect(candidate, index)}>
                          <CardFlip
                            title={candidate.name || "Unnamed Candidate"}
                            subtitle={matchText}
                            description={candidate.summary || ""}
                            features={candidateSkills}
                            contactButtonText={isSelected(candidate, index) ? "Selected" : "Select Candidate"}
                          />
                        </div>
                        {isSelected(candidate, index) && (
                          <div className="absolute top-3 right-3 z-20 bg-[#ff3f17] text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
