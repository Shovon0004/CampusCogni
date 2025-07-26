"use client"

// Import necessary dependencies
import React, { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Check } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

// Import required modules
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

// Import UI components
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import ExtendedCardFlip from "@/components/kokonutui/extended-card-flip"
import { apiClient } from "@/lib/api"

// Define component props
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
  const [summaries, setSummaries] = useState<{ [key: string]: string[] }>({})
  
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
  
  // Helper to fetch and cache AI summary for a candidate
  const fetchSummary = async (candidate: any, key: string) => {
    if (summaries[key]) return;
    
    try {
      const res = await apiClient.getProfileSummary(candidate, "");
      setSummaries(prev => ({ ...prev, [key]: res.summary || [] }));
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummaries(prev => ({ ...prev, [key]: ["No summary available."] }));
    }
  };
  
  // Fetch summaries for visible candidates
  useEffect(() => {
    if (!candidates || candidates.length === 0) return;
    
    // Fetch summaries for the visible candidates (up to 10)
    candidates.slice(0, 10).forEach((candidate, idx) => {
      const key = `${candidate.name || 'candidate'}-${idx}`;
      if (!summaries[key]) {
        fetchSummary(candidate, key);
      }
    });
  }, [candidates]);
  
  // CSS for the carousel
  const css = `
    .swiper {
      width: 100%;
      padding-bottom: 50px;
    }
    
    .swiper-slide {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 300px;
      height: 400px;
    }
    
    .swiper-3d .swiper-slide-shadow-left,
    .swiper-3d .swiper-slide-shadow-right {
      background-image: none;
    }
    
    /* Custom navigation arrows */
    .swiper-button-next,
    .swiper-button-prev {
      width: 36px;
      height: 36px;
      background-color: rgba(255, 63, 23, 0.9);
      border-radius: 50%;
      color: white;
      transition: all 0.3s ease;
    }
    
    .swiper-button-next:hover,
    .swiper-button-prev:hover {
      background-color: rgba(255, 63, 23, 1);
      transform: scale(1.1);
    }
    
    .swiper-button-next:after,
    .swiper-button-prev:after {
      font-size: 14px;
      font-weight: bold;
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
                  slideShadows: false,
                }}
                pagination={showPagination ? { clickable: true } : false}
                navigation={showNavigation}
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
                className="candidate-swiper"
              >
                {candidates.map((candidate, index) => {
                  // Get the key for accessing summaries
                  const key = `${candidate.name || 'candidate'}-${index}`;
                  
                  // Get features based on summaries or fallback to getFeatures logic
                  const getFeatures = (candidate: any) => {
                    if (candidate.reason) {
                      // Split reason into 2-3 key points if possible
                      return candidate.reason.split(/\.|\n/).map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
                    }
                    // Fallback: use skills
                    if (candidate.skills && Array.isArray(candidate.skills)) {
                      return ["Skills: " + candidate.skills.join(", ")];
                    }
                    return [];
                  };
                  
                  const candidateFeatures = summaries[key] || 
                                          getFeatures(candidate) || 
                                          candidate.skills?.slice(0, 4) || [];
                                          
                  const matchText = candidate.match ? `${candidate.match}% match` : "";
                  
                  return (
                    <SwiperSlide key={index}>
                      <div className="flex justify-center items-center">
                        <div 
                          className={cn(
                            "relative w-[280px] h-[340px] cursor-pointer transition-all transform",
                            isSelected(candidate, index) && "ring-2 ring-[#ff3f17] rounded-2xl"
                          )}
                          onClick={() => toggleSelect(candidate, index)}
                        >
                          <ExtendedCardFlip
                            title={candidate.name || "Unnamed Candidate"}
                            subtitle={matchText}
                            description={candidate.summary || ""}
                            features={candidateFeatures}
                            education={typeof candidate.education === 'object' ? 
                              (candidate.education?.college ? 
                                `${candidate.education.college}${candidate.education.course ? ` - ${candidate.education.course}` : ''}` : 
                                "No education details") : 
                              (candidate.education || "")}
                            experience={candidate.experience || ""}
                            location={candidate.location || ""}
                            extraInfo={candidate.interests ? [`Interests: ${candidate.interests}`] : []}
                            contactButtonText={isSelected(candidate, index) ? "Selected" : "Select Candidate"}
                          />
                          
                          {isSelected(candidate, index) && (
                            <div className="absolute top-3 right-3 z-50 bg-[#ff3f17] text-white rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
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
