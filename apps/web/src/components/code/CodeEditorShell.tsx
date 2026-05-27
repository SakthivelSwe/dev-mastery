"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorShellProps {
  initialCode?: string;
  language?: string;
}

export default function CodeEditorShell({
  initialCode = "// Write your code here",
  language = "java"
}: CodeEditorShellProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...\n");
    
    try {
      const response = await fetch("http://localhost:8085/v1/execution/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sourceCode: code,
          languageId: 62, // 62 is Java in Judge0
          stdin: "",
          expectedOutput: ""
        })
      });

      const data = await response.json();
      
      if (data.status === "Accepted") {
        setOutput(`Success!\nTime: ${data.time}s\nMemory: ${data.memory}KB\n\nOutput:\n${data.stdout || ''}`);
      } else {
        setOutput(`Result: ${data.status}\n\nOutput:\n${data.stdout || ''}\n${data.compileOutput || ''}\n${data.stderr || ''}`);
      }
    } catch (e) {
      setOutput(`Error connecting to execution service: ${e}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
          Interactive Code Lab
        </div>
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-white font-medium rounded-md shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Run Code
            </>
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-[400px]">
        <Editor
          height="100%"
          defaultLanguage={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth"
          }}
        />
      </div>

      {/* Output Console */}
      <div className="h-48 bg-black border-t border-slate-700 flex flex-col">
        <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs font-mono text-slate-400">
          TERMINAL OUTPUT
        </div>
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-slate-300 whitespace-pre-wrap">
          {output || <span className="text-slate-600 italic">Ready. Click 'Run Code' to execute.</span>}
        </div>
      </div>
    </div>
  );
}
