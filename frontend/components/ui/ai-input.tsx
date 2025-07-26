"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { CandidateSearchFilter } from "@/components/ui/candidate-search-filter"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

const AnimatedPlaceholder = ({ showSearch }: { showSearch: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "reasoning"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
      className="pointer-events-none text-sm absolute text-black/70 dark:text-white/70 whitespace-nowrap"
    >
      {showSearch ? "Search for candidates..." : "Search with deep knowledge..."}
    </motion.p>
  </AnimatePresence>
)

export function AiInput({
  onSearch,
  value: controlledValue,
  onValueChange,
}: {
  onSearch?: (prompt: string, mode: "normal" | "reasoning") => void,
  value?: string,
  onValueChange?: (v: string) => void,
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const setValue = onValueChange || setUncontrolledValue;
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  const [showSearch, setShowSearch] = useState(true)
  const [filterQuery, setFilterQuery] = useState("")

  const handleSubmit = () => {
    if ((value.trim() || filterQuery) && onSearch) {
      // If there's a filter query, combine it with the input value
      // If only filter query exists, use that as the prompt
      const prompt = filterQuery 
        ? value.trim() 
          ? `${value.trim()}. ${filterQuery}`
          : filterQuery
        : value.trim();
      
      onSearch(prompt, showSearch ? "normal" : "reasoning")
    }
    // Do not clear value here; parent will control clearing if needed
    adjustHeight(true)
  }
  
  const handleFilterChange = (query: string) => {
    setFilterQuery(query)
  }
  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl border rounded-[22px] border-black/5 p-1 w-full mx-auto">
        {filterQuery && (
          <div className="absolute -top-8 left-0 right-0 flex justify-center">
            <span className="text-sm text-[#ff3f17] bg-[#ff3f17]/10 px-3 py-1 rounded-full max-w-md truncate">
              <span className="font-medium">Filter query:</span> {filterQuery}
            </span>
          </div>
        )}
        <div className="relative rounded-2xl border border-black/5 bg-neutral-800/5 flex flex-col">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <Textarea
                id="ai-input-04"
                value={value}
                placeholder=""
                className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white resize-none focus-visible:ring-0 leading-[1.2]"
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                onChange={(e) => {
                  setValue(e.target.value)
                  adjustHeight()
                }}
              />
              {!value && (
                <div className="absolute left-4 top-3">
                  <AnimatedPlaceholder showSearch={showSearch} />
                </div>
              )}
            </div>
          </div>

          <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center">
              {/* Filter component */}
              <CandidateSearchFilter
                onFilterChange={handleFilterChange}
              />
              
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch)
                }}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 ml-0.5",
                  showSearch
                    ? "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                    : "bg-[#ff3f17]/15 border-[#ff3f17] text-[#ff3f17]"
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 0 : 180,
                      scale: showSearch ? 1 : 1.1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 15 : 180,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "w-4 h-4",
                        showSearch ? "text-inherit" : "text-[#ff3f17]"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {!showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm overflow-hidden whitespace-nowrap text-[#ff3f17] flex-shrink-0"
                    >
                      Reasoning
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!value.trim() && !filterQuery}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  value.trim() || filterQuery
                    ? "bg-[#ff3f17]/15 text-[#ff3f17]"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 