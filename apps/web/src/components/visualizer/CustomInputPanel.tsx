import React from 'react';

type InputType = 'array' | 'string' | 'number' | 'graph';

interface CustomInputPanelProps {
  inputType: InputType;
  value: string;
  onChange: (val: string) => void;
  onApply: () => void;
  buttonText?: string;
}

export default function CustomInputPanel({
  inputType,
  value,
  onChange,
  onApply,
  buttonText = 'Apply',
}: CustomInputPanelProps) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onApply()}
        placeholder={
          inputType === 'array' ? 'e.g., 50,30,70,20,40' :
          inputType === 'string' ? 'e.g., apple'           :
          inputType === 'graph' ? 'Adjacency list JSON'   :
          'Enter a value'
        }
        className="bg-[--bg-primary] border border-[--border-default] rounded-lg px-3 py-1.5 text-sm w-64 text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:ring-1 focus:ring-[--accent-ai] focus:border-[--accent-ai]"
      />
      <button
        onClick={onApply}
        className="bg-[--accent-ai] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:brightness-110 transition-all active:scale-95"
      >
        {buttonText}
      </button>
    </div>
  );
}
