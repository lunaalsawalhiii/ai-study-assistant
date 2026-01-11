import React, { useState, useEffect } from 'react';
import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { Play, Pause, StopCircle } from 'lucide-react';

interface StudyTimerScreenProps {
  onNavigate?: (screen: string) => void;
}

type TimerMode = 'focus' | 'break';
type TimerState = 'idle' | 'running' | 'paused' | 'completed';

const TIME_PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '50 min', minutes: 50 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
];

const MOTIVATIONAL_QUOTES = [
  "Now is the time to move toward my goals",
  "Every minute of focus brings me closer to success",
  "Deep work creates extraordinary results",
  "Focus is the bridge between goals and accomplishments",
  "This moment matters. Make it count.",
  "Consistency is the key to mastery",
];

export function StudyTimerScreen({ onNavigate }: StudyTimerScreenProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [state, setState] = useState<TimerState>('idle');
  const [totalMinutes, setTotalMinutes] = useState(30);
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [motivationalQuote] = useState(
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === 'running' && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, remainingSeconds]);

  // Calculate progress percentage
  const progress = ((totalMinutes * 60 - remainingSeconds) / (totalMinutes * 60)) * 100;

  // Format time display
  const formatTime = () => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    if (state === 'idle') {
      return `${totalMinutes}m`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle preset selection
  const handlePresetSelect = (index: number, minutes: number) => {
    if (state === 'idle' || state === 'completed') {
      setSelectedPreset(index);
      setTotalMinutes(minutes);
      setRemainingSeconds(minutes * 60);
      setState('idle');
    }
  };

  // Handle start/pause/resume
  const handlePrimaryAction = () => {
    if (state === 'idle' || state === 'completed') {
      setState('running');
    } else if (state === 'running') {
      setState('paused');
    } else if (state === 'paused') {
      setState('running');
    }
  };

  // Handle end session
  const handleEndSession = () => {
    setState('idle');
    setRemainingSeconds(totalMinutes * 60);
  };

  // Get primary button label
  const getPrimaryButtonLabel = () => {
    if (state === 'idle' || state === 'completed') return 'Start';
    if (state === 'running') return 'Pause';
    if (state === 'paused') return 'Resume';
    return 'Start';
  };

  // SVG Circle progress
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 blur-3xl opacity-60" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="px-6 pt-12 pb-6 flex items-center justify-between">
          {onNavigate && <BackButton onBack={() => onNavigate('home')} />}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">Focus Mode</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Mode Selector */}
        <div className="px-6 mb-8">
          <div className="bg-card rounded-2xl p-1 flex gap-1 border border-border shadow-sm">
            <button
              onClick={() => setMode('focus')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                mode === 'focus'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => setMode('break')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                mode === 'break'
                  ? 'bg-gradient-to-r from-accent to-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Break
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex-1 flex items-center justify-center px-6 mb-8">
          <div className="relative">
            {/* Circular Progress */}
            <svg className="transform -rotate-90" width="320" height="320">
              {/* Background circle */}
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="text-primary" stopColor="currentColor" />
                  <stop offset="100%" className="text-secondary" stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold tracking-tight">
                {formatTime()}
              </div>
              {state !== 'idle' && state !== 'completed' && (
                <div className="text-sm text-muted-foreground mt-2 capitalize">
                  {state === 'running' ? 'In Progress' : 'Paused'}
                </div>
              )}
              {state === 'completed' && (
                <div className="text-sm font-medium text-primary mt-2">
                  Session Complete! 🎉
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Presets */}
        {(state === 'idle' || state === 'completed') && (
          <div className="px-6 mb-6">
            <p className="text-sm text-muted-foreground mb-3 text-center">Quick Presets</p>
            <div className="grid grid-cols-5 gap-2">
              {TIME_PRESETS.map((preset, index) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(index, preset.minutes)}
                  className={`py-3 px-2 rounded-xl text-xs font-medium transition-all border ${
                    selectedPreset === index
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 pb-8 space-y-3">
          <button
            onClick={handlePrimaryAction}
            className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {state === 'running' ? (
              <>
                <Pause className="w-5 h-5" />
                {getPrimaryButtonLabel()}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {getPrimaryButtonLabel()}
              </>
            )}
          </button>

          {(state === 'running' || state === 'paused') && (
            <button
              onClick={handleEndSession}
              className="w-full py-4 rounded-2xl font-medium bg-card border border-border text-foreground hover:bg-muted active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <StopCircle className="w-5 h-5" />
              End Session
            </button>
          )}
        </div>

        {/* Motivational Quote */}
        <div className="px-6 pb-24 text-center">
          <p className="text-sm text-muted-foreground italic">
            "{motivationalQuote}"
          </p>
        </div>
      </div>
    </div>
  );
}
