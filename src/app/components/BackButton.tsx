import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
}

export function BackButton({ onBack }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all shadow-sm"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
