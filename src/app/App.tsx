import React, { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { HomeScreen } from './screens/HomeScreen';
import { UploadScreen } from './screens/UploadScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AnnouncementsScreen } from './screens/AnnouncementsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StudyTimerScreen } from './screens/StudyTimerScreen';
import { BottomNav } from './components/BottomNav';
import { LogoutModal } from './components/LogoutModal';
import { UserProvider, useUser } from './context/UserContext';
import { MaterialsProvider } from './context/MaterialsContext';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout, enterDemoMode } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('login');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Auto-login if user is authenticated
  useEffect(() => {
    if (isAuthenticated && showSplash) {
      setShowSplash(false);
      setActiveScreen('home');
    }
  }, [isAuthenticated]);

  // Handle dark mode toggle
  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle login
  const handleLogin = () => {
    setActiveScreen('home');
  };

  // Handle demo mode
  const handleDemoMode = () => {
    enterDemoMode();
    setActiveScreen('home');
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setActiveScreen('login');
  };

  // Handle navigation
  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
  };

  // Show loading state
  if (isLoading) {
    return <SplashScreen onLogin={() => {}} />;
  }

  // Show splash screen if not logged in
  if (!isAuthenticated) {
    if (showSplash) {
      return (
        <SplashScreen onLogin={() => {
          setShowSplash(false);
          setActiveScreen('login');
        }} />
      );
    }
    if (activeScreen === 'login') {
      return (
        <LoginScreen 
          onLogin={handleLogin} 
          onNavigateToSignUp={() => setActiveScreen('signup')}
          onNavigateToForgotPassword={() => setActiveScreen('forgot-password')}
          onDemoMode={handleDemoMode}
        />
      );
    }
    if (activeScreen === 'signup') {
      return (
        <SignUpScreen onSignUp={handleLogin} onNavigateToLogin={() => setActiveScreen('login')} />
      );
    }
    if (activeScreen === 'forgot-password') {
      return (
        <ForgotPasswordScreen 
          onBack={() => setActiveScreen('login')}
          onSuccess={() => setActiveScreen('login')}
        />
      );
    }
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onNavigateToSignUp={() => setActiveScreen('signup')}
        onNavigateToForgotPassword={() => setActiveScreen('forgot-password')}
        onDemoMode={handleDemoMode}
      />
    );
  }

  // Render active screen
  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'upload':
        return <UploadScreen onNavigate={handleNavigate} />;
      case 'chat':
        return <ChatScreen onNavigate={handleNavigate} />;
      case 'announcements':
        return <AnnouncementsScreen onNavigate={handleNavigate} />;
      case 'calendar':
        return <CalendarScreen onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsScreen isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} onNavigate={handleNavigate} onLogout={() => setShowLogoutModal(true)} />;
      case 'timer':
        return <StudyTimerScreen onNavigate={handleNavigate} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="size-full bg-background">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto h-full relative bg-background shadow-2xl">
        {/* Screen Content */}
        {renderScreen()}
        
        {/* Bottom Navigation */}
        <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />

        {/* Logout Modal */}
        <LogoutModal 
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            handleLogout();
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MaterialsProvider>
        <AppContent />
      </MaterialsProvider>
    </UserProvider>
  );
}