'use client';

import React from 'react';
import { Hammer, Github, Terminal, CheckCircle2 } from 'lucide-react';

export default function BuildChallengePanel() {
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="font-syne text-3xl mb-4 flex items-center gap-3">
          <Hammer className="text-accent-java" />
          Build Challenge
        </h2>
        <p className="text-lg text-muted-foreground">
          True mastery comes from doing. Apply the concepts you've learned to build a real-world project.
        </p>
      </div>

      <div className="flex-1 flex gap-8">
        <div className="flex-1 bg-card/30 border border-border rounded-xl p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Terminal size={20} className="text-emerald-400" />
            Project Requirements
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

        <div className="w-80 flex flex-col gap-4">
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <h3 className="font-medium mb-4">Submission</h3>
            <p className="text-sm text-muted-foreground mb-6">
              When you're done, push your code to a public GitHub repository and submit the link below for automated analysis.
            </p>
            <div className="space-y-4">
              <input 
                type="url" 
                placeholder="https://github.com/username/repo"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-java"
              />
              <button className="w-full bg-accent-java hover:bg-[#d8841a] text-white px-4 py-2 rounded-md font-medium flex justify-center items-center gap-2 transition-colors">
                <Github size={18} />
                Submit Repository
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
