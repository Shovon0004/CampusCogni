"use client"

import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { AiInput } from "@/components/ui/ai-input"
import { apiClient } from "@/lib/api"
import { useState } from "react"

export default function CandidateSearchPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")

  async function handleSearch(prompt: string, mode: "normal" | "reasoning") {
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const res = await apiClient.searchCandidates(prompt, mode)
      console.log('AI search raw response:', res)
      setResults(res.matches || [])
      console.log('AI search results:', res.matches || [])
      // setInputValue("") // Do not clear input after search
    } catch (err: any) {
      setError(err.message || "Search failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role as "USER" | "RECRUITER" | "BOTH"} userName={user?.email || "Recruiter"} />
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Candidate Search</h1>
        <AiInput onSearch={handleSearch} value={inputValue} onValueChange={setInputValue} />
        {loading && <div className="mt-8 text-lg text-muted-foreground">Searching candidates...</div>}
        {error && <div className="mt-8 text-red-500">{error}</div>}
        {results.length > 0 && (
          <div className="mt-8 w-full max-w-2xl space-y-4">
            {results.map((candidate, idx) => (
              <div key={candidate.name + idx} className="p-4 rounded-lg border bg-background/80 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{candidate.name}</div>
                  {candidate.skills && <div className="text-sm text-muted-foreground">Skills: {Array.isArray(candidate.skills) ? candidate.skills.join(", ") : candidate.skills}</div>}
                  {candidate.bio && <div className="text-sm text-muted-foreground">{candidate.bio}</div>}
                </div>
                <div className="mt-2 md:mt-0 md:ml-4 flex items-center gap-2">
                  <span className="text-xl font-bold">{candidate.match || candidate.matchPercentage || candidate.match_percent || 0}%</span>
                  <span className="text-xs text-muted-foreground">match</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 