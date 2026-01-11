import React, { useState } from 'react';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onDemoMode?: () => void;
}

export function LoginScreen({ onLogin, onNavigateToSignUp, onNavigateToForgotPassword, onDemoMode }: LoginScreenProps) {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      onLogin();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleDemoMode = () => {
    if (onDemoMode) {
      onDemoMode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg mb-6 animate-in fade-in zoom-in duration-500">
        <GraduationCap className="w-10 h-10 text-white" />
      </div>

      {/* Title */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-sm space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
              placeholder="Enter your password"
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

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        {/* Demo Mode Button */}
        {onDemoMode && (
          <Button
            onClick={handleDemoMode}
            variant="secondary"
            className="w-full mt-3 bg-accent/20 hover:bg-accent/30 border-accent/40"
          >
            🚀 Try Demo Mode (No Sign Up Required)
          </Button>
        )}

        {/* Forgot Password */}
        <button
          onClick={onNavigateToForgotPassword}
          className="text-sm text-primary hover:underline mt-3 block text-center w-full"
        >
          Forgot Password?
        </button>

        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="text-primary font-semibold hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>Lunar AI Study Partner</p>
        <p className="mt-1">Trustworthy • Supportive • Student-Focused</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-center text-sm text-red-500 max-w-sm">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}