"use client"

import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { AiInput } from "@/components/ui/ai-input"
import { apiClient } from "@/lib/api"
import { useState, useEffect, useRef } from "react"
import CardFlip from "@/components/kokonutui/card-flip";
import { CardCarousel } from "@/components/ui/card-carousel";
import {
  AIReasoning,
  AIReasoningContent,
  AIReasoningTrigger,
} from '@/components/ui/ai/reasoning';
import MinimalCandidateChat from "./minimal-chat";
import "./improved-carousel.css"
import "./navigation-styles.css"
import "./minimal-chat.css"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ColumnDef } from '@/components/ui/kibo-ui/table';
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from '@/components/ui/kibo-ui/table';
import { ChevronRightIcon, Grid3X3, List, Table } from 'lucide-react';

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
  const [selectedCandidates, setSelectedCandidates] = useState<any[]>([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel' | 'table'>('grid');

  // Helper to generate dynamic reasoning steps based on prompt
  const getReasoningSteps = (prompt: string) => {
    // Check if the prompt was generated from filters
    const isFilterPrompt = prompt.includes("Looking for") && 
                           (prompt.includes("who knows") || prompt.includes("with") || prompt.includes("Show"));
    
    if (isFilterPrompt) {
      return [
        `Analyzing your filter criteria: "${prompt}"`,
        'Expanding skills and job roles from your filters…',
        'Matching candidates based on your selected filters…',
        'Scoring candidates based on filter criteria…',
        'Preparing the most relevant matches for you…',
      ];
    }
    
    return [
      `Let me analyze the requirements: "${prompt}"`,
      'Expanding required skills and keywords…',
      'Filtering candidates by skills and experience…',
      'Scoring and ranking candidates…',
      'Preparing the best matches for you…',
    ];
  };

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

  // Modified handleSearch to trigger reasoning and work with filter data
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
    
    // Save the current prompt for use in summaries
    setInputValue(prompt);
    
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

  // Sort all matches by score, no threshold filtering
  const sortedMatches = [...results].sort((a, b) => 
    (b.match || b.matchPercentage || b.match_percent || 0) - 
    (a.match || a.matchPercentage || a.match_percent || 0)
  );

  const hasAnyProfiles = sortedMatches.length > 0 || suggested.length > 0;

  // Helper to get profile image (placeholder for now)
  const getProfileImage = (candidate: any) => candidate.profilePic || "/placeholder-user.jpg";

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

  // Table columns definition for candidate data
  const candidateColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Candidate" />
      ),
      cell: ({ row }) => {
        const candidate = row.original;
        const key = `${candidate.name || 'candidate'}-${row.index}`;
        const isSelected = selectedCandidates.some(c => 
          c.name === candidate.name || (c.id && c.id === candidate.id)
        );
        
        return (
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  setSelectedCandidates(prev => prev.filter(c => 
                    c.name !== candidate.name && (!c.id || c.id !== candidate.id)
                  ));
                } else {
                  setSelectedCandidates(prev => [...prev, candidate]);
                }
              }}
              className="h-4 w-4 accent-[#ff3f17]"
            />
            <div className="relative">
              <Avatar className="size-8">
                <AvatarImage src={getProfileImage(candidate)} />
                <AvatarFallback>
                  {candidate.name?.slice(0, 2) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background bg-green-500"
              />
            </div>
            <div>
              <span className="font-medium">{candidate.name || 'Unnamed Candidate'}</span>
              <div className="text-muted-foreground text-xs">
                {candidate.email || 'No email provided'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'skills',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Skills" />
      ),
      cell: ({ row }) => {
        const skills = row.original.skills;
        if (Array.isArray(skills)) {
          return (
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill: string, idx: number) => (
                <span key={idx} className="inline-block px-2 py-1 text-xs bg-secondary rounded-md">
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-xs text-muted-foreground">+{skills.length - 3} more</span>
              )}
            </div>
          );
        }
        return <span className="text-muted-foreground text-sm">No skills listed</span>;
      },
    },
    {
      accessorKey: 'experience',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Experience" />
      ),
      cell: ({ row }) => {
        const candidate = row.original;
        const experience = candidate.experience || candidate.workExperience;
        
        if (Array.isArray(experience) && experience.length > 0) {
          const latestExp = experience[0];
          return (
            <div>
              <div className="font-medium text-sm">{latestExp.role || latestExp.position}</div>
              <div className="text-muted-foreground text-xs">
                {latestExp.company} • {latestExp.duration || latestExp.startDate}
              </div>
            </div>
          );
        }
        
        return <span className="text-muted-foreground text-sm">No experience listed</span>;
      },
    },
    {
      accessorKey: 'match',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Match %" />
      ),
      cell: ({ row }) => {
        const match = row.original.match || row.original.matchPercentage || row.original.match_percent || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${match}%` }}
              />
            </div>
            <span className="text-sm font-medium">{match}%</span>
          </div>
        );
      },
    },
    {
      id: 'education',
      accessorFn: (row) => row.education,
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Education" />
      ),
      cell: ({ row }) => {
        const education = row.original.education;
        if (Array.isArray(education) && education.length > 0) {
          const latest = education[0];
          return (
            <div>
              <div className="font-medium text-sm">{latest.degree}</div>
              <div className="text-muted-foreground text-xs">{latest.institution}</div>
            </div>
          );
        }
        return <span className="text-muted-foreground text-sm">No education listed</span>;
      },
    },
  ];

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

  // Fetch summaries for top matches at the top level (not inside map)
  useEffect(() => {
    // Fetch summaries for the top candidates (up to first 10)
    sortedMatches.slice(0, 10).forEach((candidate, idx) => {
      const key = `${candidate.name || 'candidate'}-${idx}`;
      if (!summaries[key]) {
        fetchSummary(candidate, inputValue, key);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMatches, inputValue]);

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
            {sortedMatches.length > 0 && (
              <div className="mt-8 w-full">
                {/* Toggle button for view mode */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 text-sm font-medium border rounded-l-lg flex items-center gap-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Grid View
                    </button>
                    <button
                      onClick={() => setViewMode('carousel')}
                      className={`px-4 py-2 text-sm font-medium border-t border-b flex items-center gap-2 ${viewMode === 'carousel' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    >
                      <List className="w-4 h-4" />
                      Carousel View
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-4 py-2 text-sm font-medium border rounded-r-lg flex items-center gap-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    >
                      <Table className="w-4 h-4" />
                      Table View
                    </button>
                  </div>
                </div>
                
                {/* Candidate display based on view mode */}
                {viewMode === 'carousel' ? (
                  <div className="mb-8">
                    <CardCarousel
                      candidates={sortedMatches}
                      onSelect={(selected) => setSelectedCandidates(selected)}
                      showNavigation={true}
                      showPagination={true}
                    />
                  </div>
                ) : viewMode === 'table' ? (
                  <div className="w-full max-w-7xl mx-auto mb-8">
                    <div className="rounded-lg border bg-card shadow-sm">
                      <TableProvider columns={candidateColumns} data={sortedMatches}>
                        <TableHeader>
                          {({ headerGroup }) => (
                            <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
                              {({ header }) => <TableHead header={header} key={header.id} />}
                            </TableHeaderGroup>
                          )}
                        </TableHeader>
                        <TableBody>
                          {({ row }) => (
                            <TableRow key={row.id} row={row}>
                              {({ cell }) => <TableCell cell={cell} key={cell.id} />}
                            </TableRow>
                          )}
                        </TableBody>
                      </TableProvider>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {sortedMatches.map((candidate, idx) => {
                        const key = `${candidate.name || 'candidate'}-${idx}`;
                        const isSelected = selectedCandidates.some(c => 
                          c.name === candidate.name || (c.id && c.id === candidate.id)
                        );
                        
                        return (
                          (candidate.name || (candidate.skills && candidate.skills.length > 0)) && (
                            <div key={key} className="relative">
                              {/* Selection checkbox */}
                              <div className="absolute top-2 right-2 z-10">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedCandidates(prev => prev.filter(c => 
                                        c.name !== candidate.name && (!c.id || c.id !== candidate.id)
                                      ));
                                    } else {
                                      setSelectedCandidates(prev => [...prev, candidate]);
                                    }
                                  }}
                                  className="h-5 w-5 accent-[#ff3f17]"
                                />
                              </div>
                              
                              <CardFlip
                                key={key}
                                title={candidate.name || "Unnamed Candidate"}
                                subtitle={candidate.match ? `${candidate.match}% match` : ""}
                                features={summaries[key] || getFeatures(candidate)}
                                contactButtonText="Contact"
                              />
                            </div>
                          )
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* AI Question-Answer Interface */}
                {selectedCandidates.length > 0 && (
                  <div className="mt-8 w-full max-w-4xl mx-auto">
                    <div className="h-[500px] shadow-lg">
                      <MinimalCandidateChat selectedCandidates={selectedCandidates} />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {results.length === 0 && suggested.length > 0 && (
              <div className="mt-8 w-full max-w-5xl mx-auto">
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