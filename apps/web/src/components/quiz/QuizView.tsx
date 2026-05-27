"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QuizOption {
  key: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
}

// Mock Data for Phase 2 Implementation
const mockQuestion: QuizQuestion = {
  id: "q1",
  text: "What is the time complexity of searching for an element in a perfectly balanced Binary Search Tree?",
  options: [
    { key: "A", text: "O(1)" },
    { key: "B", text: "O(n)" },
    { key: "C", text: "O(log n)" },
    { key: "D", text: "O(n log n)" }
  ],
  correctAnswer: "C",
  explanation: "In a balanced BST, each comparison cuts the search space in half, leading to a logarithmic time complexity O(log n)."
};

export default function QuizView() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsCorrect(selectedOption === mockQuestion.correctAnswer);
    setIsSubmitted(true);
    // In Phase 3, this will trigger the progress-service to award XP.
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 border border-slate-700 rounded-xl shadow-xl mt-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
          Knowledge Check
        </span>
      </div>
      
      <h3 className="text-xl font-medium text-slate-100 mb-6">
        {mockQuestion.text}
      </h3>

      <div className="space-y-3 mb-8">
        {mockQuestion.options.map((opt) => (
          <div 
            key={opt.key}
            onClick={() => !isSubmitted && setSelectedOption(opt.key)}
            className={`
              flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${isSubmitted ? 'cursor-default' : 'hover:border-indigo-400 hover:bg-indigo-500/5'}
              ${selectedOption === opt.key && !isSubmitted ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800'}
              ${isSubmitted && opt.key === mockQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-500/10' : ''}
              ${isSubmitted && selectedOption === opt.key && !isCorrect ? 'border-rose-500 bg-rose-500/10' : ''}
            `}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4
              ${selectedOption === opt.key && !isSubmitted ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}
              ${isSubmitted && opt.key === mockQuestion.correctAnswer ? 'bg-emerald-500 text-white' : ''}
              ${isSubmitted && selectedOption === opt.key && !isCorrect ? 'bg-rose-500 text-white' : ''}
            `}>
              {opt.key}
            </div>
            <span className="text-slate-200">{opt.text}</span>
            
            {/* Status Icons */}
            {isSubmitted && opt.key === mockQuestion.correctAnswer && (
              <CheckCircle className="ml-auto text-emerald-500" size={20} />
            )}
            {isSubmitted && selectedOption === opt.key && !isCorrect && (
              <XCircle className="ml-auto text-rose-500" size={20} />
            )}
          </div>
        ))}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`mt-0.5 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} size={20} />
            <div>
              <h4 className={`font-semibold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCorrect ? 'Correct! +10 XP' : 'Not quite right.'}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {mockQuestion.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
