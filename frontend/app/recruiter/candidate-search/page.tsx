"use client"

import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { AiInput } from "@/components/ui/ai-input"
import { apiClient } from "@/lib/api"
import { useState, useEffect, useRef } from "react"
import CardFlip from "@/components/kokonutui/card-flip";
import {
  AIReasoning,
  AIReasoningContent,
  AIReasoningTrigger,
} from '@/components/ui/kibo-ui/ai/reasoning';

export default function CandidateSearchPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [suggested, setSuggested] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [summaries, setSummaries] = useState<{ [key: string]: string[] }>({});
  const [isReasoning, setIsReasoning] = useState(false);
  const [reasoningKey, setReasoningKey] = useState(0);
  const [displayedSteps, setDisplayedSteps] = useState<string[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const reasoningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTyped, setCurrentTyped] = useState('');
  const [typing, setTyping] = useState(false);

  // Helper to generate dynamic reasoning steps based on prompt
  const getReasoningSteps = (prompt: string) => [
    `Let me analyze the requirements: "${prompt}"`,
    'Expanding required skills and keywords…',
    'Filtering candidates by skills and experience…',
    'Scoring and ranking candidates…',
    'Preparing the best matches for you…',
  ];

  // Typewriter effect for reasoning steps
  const startReasoning = (prompt: string, stepsArr?: string[]) => {
    setIsReasoning(true);
    setIsStreaming(true);
    setDisplayedSteps([]);
    setCurrentStepIndex(0);
    setCurrentTyped('');
    setTyping(false);
    const steps = Array.isArray(stepsArr) && stepsArr.length > 0 ? stepsArr : getReasoningSteps(prompt);
    setReasoningSteps(steps);
    if (reasoningTimerRef.current) clearTimeout(reasoningTimerRef.current);
    typeStep(steps, 0);
  };

  // Helper: type out a single step, then move to next
  const typeStep = (steps: string[], idx: number) => {
    if (idx >= steps.length) {
      setIsStreaming(false);
      setTyping(false);
      return;
    }
    setTyping(true);
    setCurrentTyped('');
    let charIdx = 0;
    const typeChar = () => {
      setCurrentTyped(prev => prev + steps[idx][charIdx]);
      charIdx++;
      if (charIdx < steps[idx].length) {
        reasoningTimerRef.current = setTimeout(typeChar, 18); // 18ms per char
      } else {
        setDisplayedSteps(prev => [...prev, steps[idx]]);
        setTyping(false);
        setTimeout(() => typeStep(steps, idx + 1), 400); // 0.4s pause between steps
      }
    };
    typeChar();
  };

  // Modified handleSearch to trigger reasoning
  async function handleSearch(prompt: string, mode: "normal" | "reasoning") {
    // Clear all previous state for a fresh start
    setResults([]);
    setSuggested([]);
    setSummaries({});
    setDisplayedSteps([]);
    setReasoningSteps([]);
    setCurrentTyped('');
    setCurrentStepIndex(0);
    setTyping(false);
    setIsReasoning(false);
    setIsStreaming(false);
    setReasoningKey(prev => prev + 1); // force remount of AIReasoning
    setLoading(true);
    setError(null);
    setHasSearched(true);
    let reasoningSteps: string[] | undefined = undefined;
    if (mode === "reasoning") {
      // Start with a loading animation, will update with real steps if available
      startReasoning(prompt);
    }
    try {
      const res = await apiClient.searchCandidates(prompt, mode)
      let matches = res.matches;
      let suggestedProfiles = res.suggested;
      reasoningSteps = res.reasoningSteps;
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
      // If real reasoning steps are present, animate them now
      if (mode === "reasoning" && Array.isArray(reasoningSteps) && reasoningSteps.length > 0) {
        startReasoning(prompt, reasoningSteps);
      }
    } catch (err: any) {
      setError(err.message || "Search failed")
    } finally {
      setLoading(false)
      // Do not auto-close the reasoning panel; let the user close it or keep it visible with results
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
        {isReasoning && (
          <div className="w-full max-w-xl mx-auto mb-6 rounded-xl bg-black/60 backdrop-blur-sm p-4 shadow-lg">
            <AIReasoning key={reasoningKey} isStreaming={isStreaming || typing}>
              <AIReasoningTrigger />
              <AIReasoningContent>
                {[...displayedSteps, typing ? currentTyped : null].filter(Boolean).join('\n')}
              </AIReasoningContent>
            </AIReasoning>
          </div>
        )}
        {loading && <div className="mt-8 text-lg text-muted-foreground">Searching candidates...</div>}
        {error && <div className="mt-8 text-red-500">{error}</div>}
        {!isStreaming && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
} 