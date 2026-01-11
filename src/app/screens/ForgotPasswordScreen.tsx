import React, { useState } from 'react';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { BackButton } from '../components/BackButton';
import { Moon, Mail, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 'email' | 'verify' | 'reset' | 'success';

export function ForgotPasswordScreen({ onBack, onSuccess }: ForgotPasswordScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = () => {
    // Mock: Simulate sending verification code
    if (email) {
      setCurrentStep('verify');
    }
  };

  const handleVerifyCode = () => {
    // Mock: Simulate code verification
    if (verificationCode) {
      setCurrentStep('reset');
    }
  };

  const handleResetPassword = () => {
    // Mock: Simulate password reset
    if (newPassword && confirmPassword) {
      setCurrentStep('success');
      // Auto redirect after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep === 'email') {
      onBack();
    } else if (currentStep === 'verify') {
      setCurrentStep('email');
    } else if (currentStep === 'reset') {
      setCurrentStep('verify');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 flex flex-col px-6 pb-8">
      {/* Back Button */}
      {currentStep !== 'success' && (
        <div className="pt-12 pb-6">
          <BackButton onBack={handleBack} />
        </div>
      )}

      {/* Logo */}
      <div className="flex flex-col items-center mt-8">
        <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg mb-6 animate-in fade-in zoom-in duration-500">
          <Moon className="w-10 h-10 text-white" />
        </div>

        {/* Step 1: Email Input */}
        {currentStep === 'email' && (
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-muted-foreground">
                Enter your email to receive a verification code
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-input-background border border-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendCode}
                variant="primary"
                fullWidth
                className="mt-6"
              >
                Send Code
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Code Verification */}
        {currentStep === 'verify' && (
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Verify Code</h1>
              <p className="text-muted-foreground">
                Enter the 6-digit code sent to
              </p>
              <p className="text-primary font-medium mt-1">{email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 ml-1">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 text-center text-2xl tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Didn't receive a code?{' '}
                  <button className="text-primary font-semibold hover:underline">
                    Resend
                  </button>
                </p>
              </div>

              <Button
                onClick={handleVerifyCode}
                variant="primary"
                className="w-full mt-6"
              >
                Verify Code
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {currentStep === 'reset' && (
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">New Password</h1>
              <p className="text-muted-foreground">
                Create a strong password for your account
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-input-background border border-border rounded-2xl pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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

              <div>
                <label className="block text-sm font-medium mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full bg-input-background border border-border rounded-2xl pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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

              {/* Password strength hint */}
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">
                  Password should be at least 8 characters long
                </p>
              </div>

              <Button
                onClick={handleResetPassword}
                variant="primary"
                fullWidth
                className="mt-6"
              >
                Reset Password
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {currentStep === 'success' && (
          <div className="w-full max-w-sm text-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Success!</h1>
            <p className="text-muted-foreground mb-2">
              Your password has been reset successfully
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>

            <div className="mt-8">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}