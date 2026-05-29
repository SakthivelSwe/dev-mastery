'use client';

import React from 'react';
import { Mic, MicOff, Volume2, Square, Send } from 'lucide-react';
import { useInterview } from './useInterview';

interface MockInterviewShellProps {
  topicSlug: string;
}

export default function MockInterviewShell({ topicSlug }: MockInterviewShellProps) {
  const {
    messages,
    isRecording,
    isSpeaking,
    isInitializing,
    startRecording,
    stopRecording,
    endInterview
  } = useInterview(topicSlug);

  if (isInitializing) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0d1117] text-[#c9d1d9] rounded-lg border border-[#30363d]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58a6ff] mb-4"></div>
        <p className="text-lg">Connecting to Interviewer...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] flex flex-col bg-[#0d1117] text-[#c9d1d9] rounded-lg border border-[#30363d] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <h2 className="text-lg font-semibold text-white">Live AI Interview: {topicSlug}</h2>
        </div>
        <button 
          onClick={endInterview}
          className="px-4 py-1.5 text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-md transition-colors"
        >
          End Interview
        </button>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-lg">The interviewer is ready.</p>
            <p className="text-sm mt-2">Hold the microphone button to start speaking.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1 ml-1">
                {msg.role === 'user' ? 'You' : 'Interviewer'}
              </span>
              <div 
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-[#1f6feb] text-white rounded-br-none' 
                    : 'bg-[#21262d] border border-[#30363d] rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controls Area */}
      <div className="p-6 bg-[#161b22] border-t border-[#30363d] flex flex-col items-center justify-center gap-4">
        
        {/* Audio Visualizer / Status Indicator */}
        <div className="h-8 flex items-center justify-center">
          {isRecording && (
            <div className="flex items-center gap-1">
              <span className="text-red-400 text-sm animate-pulse mr-2">Recording...</span>
              <div className="w-1 h-4 bg-red-500 animate-[bounce_1s_infinite]"></div>
              <div className="w-1 h-6 bg-red-500 animate-[bounce_1s_infinite_0.1s]"></div>
              <div className="w-1 h-3 bg-red-500 animate-[bounce_1s_infinite_0.2s]"></div>
              <div className="w-1 h-5 bg-red-500 animate-[bounce_1s_infinite_0.3s]"></div>
            </div>
          )}
          {isSpeaking && !isRecording && (
            <div className="flex items-center gap-2 text-[#58a6ff]">
              <Volume2 size={20} className="animate-pulse" />
              <span className="text-sm">Interviewer speaking...</span>
            </div>
          )}
        </div>

        {/* Push to Talk Button */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
              : 'bg-[#238636] hover:bg-[#2ea043]'
          }`}
        >
          {isRecording ? <Square fill="white" size={28} /> : <Mic color="white" size={32} />}
        </button>
        <p className="text-xs text-gray-400">Hold to speak</p>
      </div>
    </div>
  );
}
