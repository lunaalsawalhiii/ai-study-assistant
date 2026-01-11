import React from 'react';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  onSubmit?: () => void;
}

export function InputField({ 
  value, 
  onChange, 
  placeholder, 
  multiline = false,
  rows = 1,
  className = '',
  onSubmit
}: InputFieldProps) {
  const baseStyles = "w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${baseStyles} resize-none ${className}`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`${baseStyles} ${className}`}
    />
  );
}
