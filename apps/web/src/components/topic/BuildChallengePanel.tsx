'use client';

import React from 'react';
import { Hammer, Terminal, CheckCircle2 } from 'lucide-react';
import { CodeEditorShell } from '../code/CodeEditorShell';

interface BuildChallengePanelProps {
  buildContent: string;
}

export default function BuildChallengePanel({ buildContent }: BuildChallengePanelProps) {
  const initialCode = `public class Solution {
    public static void main(String[] args) {
        // Build Challenge: Write your solution here
        System.out.println("DevMastery Build Challenge");
    }
}`;

  // Parse build content for instructions (or show default)
  const hasContent = buildContent && buildContent.trim().length > 0;

  return (
    <div className="h-full flex flex-col w-full pb-20">
      <div className="mb-6">
        <h2 className="text-3xl font-bold font-display mb-3 flex items-center gap-3">
          <Hammer className="text-[--accent-java]" size={28} />
          Build Challenge
        </h2>
        <p className="text-[--text-secondary] leading-7">
          True mastery comes from doing. Apply the concepts to build a real-world mini-project.
        </p>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-8">
        {/* Requirements Panel */}
        <div className="w-full xl:w-1/3 bg-[--bg-surface] border border-[--border-default] rounded-xl p-6 shrink-0">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-[--text-primary]">
            <Terminal size={18} className="text-emerald-400" />
            Requirements
          </h3>

          {hasContent ? (
            <div className="text-sm text-[--text-secondary] leading-relaxed whitespace-pre-wrap">
              {buildContent}
            </div>
          ) : (
            <div className="space-y-5 text-sm text-[--text-secondary]">
              <div>
                <h4 className="font-semibold text-[--text-primary] mb-2">Objective</h4>
                <p>Implement the solution for this topic using the concepts covered in the theory and code layers.</p>
              </div>
              <div>
                <h4 className="font-semibold text-[--text-primary] mb-2">Acceptance Criteria</h4>
                <ul className="space-y-2">
                  { [
                    'Code compiles and runs without errors',
                    'Logic correctly implements the concept',
                    'Edge cases are handled properly',
                  ].map((crit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="flex-1 min-w-0">
          <CodeEditorShell initialCode={initialCode} languageString="java" />
        </div>
      </div>
    </div>
  );
}
