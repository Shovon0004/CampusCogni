"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"

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

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface CandidateCardProps {
  candidates: any[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  onSelect?: (candidateId: string, isSelected: boolean) => void
  selectedCandidates?: Set<string>
}

export const CandidateCardCarousel: React.FC<CandidateCardProps> = ({
  candidates,
  autoplayDelay = 3000,
  showPagination = true,
  showNavigation = true,
  onSelect,
  selectedCandidates = new Set()
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
    height: auto;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  
  .candidate-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .candidate-card-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .candidate-card-footer {
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .candidate-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .candidate-select {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
  }
  `
  
  return (
    <div className="w-full">
      <style>{css}</style>
      <Swiper
        spaceBetween={30}
        autoplay={autoplayDelay ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
        } : false}
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={candidates.length > 3}
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
          <SwiperSlide key={`${candidate.name}-${index}`}>
            <div className="candidate-card">
              {onSelect && (
                <div className="candidate-select">
                  <Checkbox 
                    checked={selectedCandidates.has(candidate.name)}
                    onCheckedChange={(checked) => {
                      onSelect(candidate.name, !!checked);
                    }}
                    className="h-5 w-5 border-2 border-[#ff3f17] bg-black/40"
                  />
                </div>
              )}
              <div className="candidate-card-content">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#ff3f17]/50">
                    <Image
                      src={"/placeholder-user.jpg"}
                      alt={candidate.name || "Candidate"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{candidate.name || "Unnamed Candidate"}</h3>
                    <Badge variant="outline" className="bg-[#ff3f17]/20 text-white border-[#ff3f17]/50">
                      {candidate.match ? `${candidate.match}% match` : "No match data"}
                    </Badge>
                  </div>
                </div>
                
                {candidate.reason && (
                  <div className="mt-2 text-sm text-gray-300">
                    {candidate.reason}
                  </div>
                )}
                
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="candidate-skills">
                    {candidate.skills.slice(0, 5).map((skill: string, idx: number) => (
                      <Badge key={idx} className="bg-black/40 text-gray-200 border-gray-600/70">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 5 && (
                      <Badge className="bg-black/40 text-gray-200 border-gray-600/70">
                        +{candidate.skills.length - 5}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="candidate-card-footer">
                <div className="text-xs text-gray-400">
                  {candidate.experience || "Experience data not available"}
                </div>
                {onSelect && (
                  <Badge 
                    variant="outline" 
                    className={`cursor-pointer ${selectedCandidates.has(candidate.name) ? 
                      "bg-[#ff3f17]/30 border-[#ff3f17] text-white" : 
                      "bg-black/40 border-gray-600/70 text-gray-300"}`}
                    onClick={() => onSelect(candidate.name, !selectedCandidates.has(candidate.name))}
                  >
                    {selectedCandidates.has(candidate.name) ? "Selected" : "Select"}
                  </Badge>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
