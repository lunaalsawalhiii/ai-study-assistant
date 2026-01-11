import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'disabled';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  disabled = false 
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-2xl transition-all duration-200 shadow-sm";
  
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90 active:scale-95",
    disabled: "bg-muted text-muted-foreground cursor-not-allowed"
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[disabled ? 'disabled' : variant]} ${className}`}
    >
      {children}
    </button>
  );
}
