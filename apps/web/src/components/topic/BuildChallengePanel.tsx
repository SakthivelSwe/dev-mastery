'use client';

import React from 'react';
import { Hammer, Terminal, CheckCircle2 } from 'lucide-react';
import { CodeEditorShell } from '../code/CodeEditorShell';

interface BuildChallengePanelProps {
  buildContent: string;
}

export default function BuildChallengePanel({ buildContent }: BuildChallengePanelProps) {
  // Use default boilerplate for Java for now
  const initialCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from DevMastery!");
        
        // Write your solution here...
    }
}`;

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
        <div className="w-full xl:w-1/3 bg-card/30 border border-border rounded-xl p-8 shrink-0">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Terminal size={20} className="text-emerald-400" />
            Requirements
          </h3>
          
          <div className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Objective</h4>
              <p>Build a simple command-line application that demonstrates the JVM's memory management by tracking object instantiation and memory usage over time.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Acceptance Criteria</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Create a class with primitive and reference type properties.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Write a loop that instantiates 100,000 objects to trigger the Garbage Collector.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Use <code>Runtime.getRuntime()</code> to print total memory and free memory before and after the loop.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="flex-1 min-w-0">
          <CodeEditorShell initialCode={initialCode} languageString="java" />
        </div>
      </div>
    </div>
  );
}
