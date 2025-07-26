"use client";

import MinimalCandidateChat from "./minimal-chat";

export default function ChatTest() {
  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Candidate Chat Test</h1>
        <MinimalCandidateChat />
      </div>
    </div>
  );
}
