import React from 'react';

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ icon, onClick, className = '' }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-24 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center z-40 ${className}`}
    >
      {icon}
    </button>
  );
}
