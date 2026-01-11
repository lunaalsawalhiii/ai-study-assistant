import React, { useState } from 'react';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { BackButton } from '../components/BackButton';
import { GraduationCap, Eye, EyeOff, User } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

export function SignUpScreen({ onSignUp, onNavigateToLogin }: SignUpScreenProps) {
  const { signup } = useUser();
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    
    // Validation
    if (!preferredName.trim()) {
      setError('Please enter your preferred name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await signup(email, password, preferredName);
    setIsLoading(false);

    if (result.success) {
      onSignUp();
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-accent/10 to-primary/10 flex flex-col px-6 pb-8">
      {/* Back Button */}
      <div className="pt-12 pb-6">
        <BackButton onBack={onNavigateToLogin} />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shadow-lg mb-6 animate-in fade-in zoom-in duration-500">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Start your learning journey today</p>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="w-full max-w-sm mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Preferred Name Input */}
        <div>
          <label className="block text-sm font-medium mb-2 ml-1">Preferred Name</label>
          <InputField
            value={preferredName}
            onChange={setPreferredName}
            placeholder="Your name"
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium mb-2 ml-1">Email</label>
          <InputField
            value={email}
            onChange={setEmail}
            placeholder="name@email.com"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium mb-2 ml-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium mb-2 ml-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Create Account Button */}
        <Button
          onClick={handleSignUp}
          variant="primary"
          className="w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-primary font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-8 text-center text-xs text-muted-foreground max-w-sm mx-auto">
        <p>
          By creating an account, you agree to our{' '}
          <button className="text-primary hover:underline">Terms of Service</button>
          {' '}and{' '}
          <button className="text-primary hover:underline">Privacy Policy</button>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-center text-sm text-red-500 max-w-sm mx-auto">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}