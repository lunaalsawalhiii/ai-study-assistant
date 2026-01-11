import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';

interface SplashScreenProps {
  onLogin: () => void;
}

export function SplashScreen({ onLogin }: SplashScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Lunar AI Study Partner
          </h1>
          <p className="text-muted-foreground">
            Your trusted AI study companion
          </p>
        </div>

        {/* Features */}
        <div className="w-full space-y-3 mt-4">
          <FeatureItem 
            icon="📚" 
            text="AI answers from your materials only"
          />
          <FeatureItem 
            icon="🔍" 
            text="Analyze announcements automatically"
          />
          <FeatureItem 
            icon="⏱️" 
            text="Focus timer for study sessions"
          />
        </div>

        {/* Login Button */}
        <div className="w-full mt-8 space-y-3">
          <Button 
            variant="primary" 
            onClick={onLogin}
            className="w-full text-lg"
          >
            Get Started
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Study smarter, not harder
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-2xl p-3 border border-border">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  );
}