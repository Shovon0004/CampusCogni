"use client"

import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { AiInput } from "@/components/ui/ai-input"
import { apiClient } from "@/lib/api"
import { useState, useEffect } from "react"
import CardFlip from "@/components/kokonutui/card-flip";

export default function CandidateSearchPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [suggested, setSuggested] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [summaries, setSummaries] = useState<{ [key: string]: string[] }>({});

  async function handleSearch(prompt: string, mode: "normal" | "reasoning") {
    setLoading(true)
    setError(null)
    setResults([])
    setSuggested([])
    setHasSearched(true)
    try {
      const res = await apiClient.searchCandidates(prompt, mode)
      console.log('AI search raw response:', res)
      let matches = res.matches;
      let suggestedProfiles = res.suggested;
      // If matches or suggested are objects (not arrays), convert to array of values
      if (matches && !Array.isArray(matches) && typeof matches === 'object') {
        matches = Object.values(matches);
      }
      if (suggestedProfiles && !Array.isArray(suggestedProfiles) && typeof suggestedProfiles === 'object') {
        suggestedProfiles = Object.values(suggestedProfiles);
      }
      matches = Array.isArray(matches) ? matches : [];
      suggestedProfiles = Array.isArray(suggestedProfiles) ? suggestedProfiles : [];
      setResults(matches);
      setSuggested(suggestedProfiles);
      console.log('AI search results:', res.matches || [])
      // setInputValue("") // Do not clear input after search
    } catch (err: any) {
      setError(err.message || "Search failed")
    } finally {
      setLoading(false)
    }
  }

  // Compute filtered and sorted matches
  const strongMatches = results.filter(candidate => (candidate.match || candidate.matchPercentage || candidate.match_percent || 0) >= 70)
    .sort((a, b) => (b.match || b.matchPercentage || b.match_percent || 0) - (a.match || a.matchPercentage || a.match_percent || 0));
  const weakMatches = results.filter(candidate => (candidate.match || candidate.matchPercentage || candidate.match_percent || 0) < 70)
    .sort((a, b) => (b.match || b.matchPercentage || b.match_percent || 0) - (a.match || a.matchPercentage || a.match_percent || 0));

  const hasAnyProfiles = strongMatches.length > 0 || weakMatches.length > 0 || suggested.length > 0;

  // Helper to get profile image (placeholder for now)
  const getProfileImage = (candidate: any) => "/placeholder-user.jpg";

  // Helper to get features (AI key points)
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

  // Helper to fetch and cache AI summary for a candidate
  const fetchSummary = async (candidate: any, prompt: string, key: string) => {
    if (summaries[key]) return;
    try {
      const res = await apiClient.getProfileSummary(candidate, prompt);
      setSummaries(prev => ({ ...prev, [key]: res.summary || [] }));
    } catch {
      setSummaries(prev => ({ ...prev, [key]: ["No summary available."] }));
    }
  };

  // Fetch summaries for strongMatches at the top level (not inside map)
  useEffect(() => {
    strongMatches.forEach((candidate, idx) => {
      const key = `${candidate.name || 'candidate'}-${idx}`;
      if (!summaries[key]) {
        fetchSummary(candidate, inputValue, key);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strongMatches, inputValue]);

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role as "USER" | "RECRUITER" | "BOTH"} userName={user?.email || "Recruiter"} />
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Candidate Search</h1>
        <AiInput onSearch={handleSearch} value={inputValue} onValueChange={setInputValue} />
        {loading && <div className="mt-8 text-lg text-muted-foreground">Searching candidates...</div>}
        {error && <div className="mt-8 text-red-500">{error}</div>}
        {strongMatches.length > 0 && (
          <div className="mt-8 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {strongMatches.map((candidate, idx) => {
              const key = `${candidate.name || 'candidate'}-${idx}`;
              return (
                (candidate.name || (candidate.skills && candidate.skills.length > 0)) && (
                  <CardFlip
                    key={key}
                    title={candidate.name || "Unnamed Candidate"}
                    subtitle={candidate.match ? `${candidate.match}% match` : ""}
                    features={summaries[key] || ["Loading..."]}
                    contactButtonText="Contact"
                  />
                )
              );
            })}
          </div>
        )}
        {strongMatches.length === 0 && weakMatches.length > 0 && (
          <div className="mt-8 w-full max-w-5xl">
            <div className="font-semibold text-lg mb-2 text-white">No top matches found. Here are some relevant profiles:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {weakMatches.map((candidate, idx) => (
                (candidate.name || (candidate.skills && candidate.skills.length > 0)) && (
                  <CardFlip
                    key={`${candidate.name || 'candidate'}-${idx}`}
                    title={candidate.name || "Unnamed Candidate"}
                    subtitle={candidate.match ? `${candidate.match}% match` : ""}
                    features={getFeatures(candidate)}
                  />
                )
              ))}
            </div>
          </div>
        )}
        {results.length === 0 && suggested.length > 0 && (
          <div className="mt-8 w-full max-w-5xl">
            <div className="font-semibold text-lg mb-2 text-white">No strong matches found. Here are some suggested profiles:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {suggested.map((candidate, idx) => (
                (candidate.name || (candidate.skills && candidate.skills.length > 0)) && (
                  <CardFlip
                    key={`${candidate.name || 'candidate'}-${idx}`}
                    title={candidate.name || "Unnamed Candidate"}
                    subtitle={candidate.match ? `${candidate.match}% match` : ""}
                    features={getFeatures(candidate)}
                  />
                )
              ))}
            </div>
          </div>
        )}
        {!hasAnyProfiles && hasSearched && !loading && !error && (
          <div className="mt-8 text-muted-foreground">No candidates found for your search. Try a different query or broaden your criteria.</div>
        )}
      </div>
    </div>
  )
} 