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
  buttonText = "Apply"
}: CustomInputPanelProps) {
  
  return (
    <div className="flex gap-2 items-center">
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          inputType === 'array' ? 'e.g., 50,30,70' :
          inputType === 'string' ? 'e.g., apple' :
          inputType === 'graph' ? 'Adjacency list format' :
          'Enter a value'
        }
        className="bg-background border rounded px-3 py-1 text-sm w-64"
      />
      <button 
        onClick={onApply} 
        className="bg-primary text-primary-foreground px-4 py-1 rounded text-sm hover:opacity-90"
      >
        {buttonText}
      </button>
    </div>
  );
}
