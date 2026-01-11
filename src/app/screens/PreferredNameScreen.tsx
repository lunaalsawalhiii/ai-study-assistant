import React, { useState } from 'react';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface PreferredNameScreenProps {
  onComplete: () => void;
}

export function PreferredNameScreen({ onComplete }: PreferredNameScreenProps) {
  const { user, setUser } = useUser();
  const [preferredName, setPreferredName] = useState(user?.name || '');

  const handleContinue = () => {
    if (preferredName.trim()) {
      setUser({
        ...user!,
        name: preferredName.trim(),
        hasSetPreferredName: true
      });
    } else {
      // If user skips, mark as set but keep extracted name
      setUser({
        ...user!,
        hasSetPreferredName: true
      });
    }
    onComplete();
  };

  const handleSkip = () => {
    // Mark as set without changing name
    setUser({
      ...user!,
      hasSetPreferredName: true
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex flex-col items-center justify-center px-6">
      {/* Animated Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg mb-8 animate-in fade-in zoom-in duration-500 relative">
        <GraduationCap className="w-12 h-12 text-white" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold mb-3">Welcome to Lunar AI! 🎉</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Let's make this personal
        </p>
        <p className="text-muted-foreground">
          Do you have a preferred name you would<br />like to be called?
        </p>
      </div>

      {/* Name Input Form */}
      <div className="w-full max-w-sm space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div>
          <label className="block text-sm font-medium mb-2 ml-1">
            Preferred Name
          </label>
          <InputField
            value={preferredName}
            onChange={setPreferredName}
            placeholder="e.g., Alex, Sam, Jordan"
          />
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            This name will be used throughout the app to greet you and personalize your experience
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          variant="primary"
          className="w-full mt-6"
        >
          {preferredName.trim() ? 'Continue' : 'Use Default Name'}
        </Button>

        {/* Skip Link */}
        {preferredName.trim() !== user?.name && (
          <div className="text-center pt-2">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-12 text-center text-xs text-muted-foreground max-w-xs">
        <p>You can always update this later in Settings</p>
      </div>
    </div>
  );
}