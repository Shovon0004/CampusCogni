import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SkillsAutocompleteProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
  disabled?: boolean;
}

export const SkillsAutocomplete: React.FC<SkillsAutocompleteProps> = ({ skills, setSkills, disabled }) => {
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetch("/skills.json")
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to fetch skills.json", res.status);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("skills.json is not an array", data);
          setAllSkills([]);
        } else {
          setAllSkills(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching skills.json:", err);
        setAllSkills([]);
      });
  }, []);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    if (!Array.isArray(allSkills) || allSkills.length === 0) {
      console.warn("allSkills is empty or not an array", allSkills);
      setSuggestions([]);
      return;
    }
    const fuse = new Fuse(allSkills, {
      threshold: 0.4,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
    const results = fuse.search(query);
    setSuggestions(results.map((r) => r.item).filter((s) => !skills.includes(s)));
  }, [query, allSkills, skills]);

  const handleAddSkill = (skill: string) => {
    if (skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())) {
      setQuery("");
      setSuggestions([]);
      return;
    }
    setSkills([...skills, skill]);
    setQuery("");
    setSuggestions([]);
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-sm">
            {skill}
            {!disabled && (
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="ml-2 text-red-500 hover:text-red-700"
                type="button"
              >
                ×
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!disabled && (
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a skill..."
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // If the query matches a suggestion exactly, add only once
                const match = suggestions.find(s => s.toLowerCase() === query.trim().toLowerCase());
                if (match) {
                  handleAddSkill(match);
                } else if (suggestions.length > 0) {
                  handleAddSkill(suggestions[0]);
                }
              }
            }}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 border rounded shadow mt-1 w-full max-h-40 overflow-y-auto bg-white text-black dark:bg-gray-900 dark:text-white">
              {suggestions.map((s) => (
                <div
                  key={s}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => handleAddSkill(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
