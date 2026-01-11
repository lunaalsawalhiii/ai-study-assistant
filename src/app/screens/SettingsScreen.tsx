import React, { useState } from 'react';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { Moon, Sun, Bell, User, HelpCircle, Info, LogOut, ChevronRight, Edit3, Check, X } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface SettingsScreenProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export function SettingsScreen({ isDarkMode, onToggleDarkMode, onNavigate, onLogout }: SettingsScreenProps) {
  const { user, updatePreferredName, isDemoMode } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.preferredName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    // In demo mode, just update locally without backend call
    if (isDemoMode) {
      setEditedName(editedName.trim());
      setIsEditingName(false);
      return;
    }
    
    setError('');
    setIsSaving(true);
    const result = await updatePreferredName(editedName.trim());
    setIsSaving(false);
    
    if (result.success) {
      setIsEditingName(false);
    } else {
      setError(result.error || 'Failed to update name');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.preferredName || '');
    setIsEditingName(false);
    setError('');
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: isDarkMode ? Moon : Sun,
          label: 'Dark Mode',
          value: isDarkMode ? 'On' : 'Off',
          action: onToggleDarkMode,
          isToggle: true
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          value: user?.preferredName || 'Student',
          action: () => setIsEditingName(true)
        },
        {
          icon: Bell,
          label: 'Notifications',
          value: 'Enabled',
          action: () => {}
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          action: () => {}
        },
        {
          icon: Info,
          label: 'About',
          value: 'v1.0.0',
          action: () => {}
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 px-6 pt-12 pb-6 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate('home')} />
          </div>
        )}
        <div className={onNavigate ? "pt-12" : ""}>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your experience</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-6 mt-6">
        {isDemoMode && (
          <div className="mb-4 bg-accent/20 border border-accent/40 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-accent-foreground">Demo Mode Active</p>
              <p className="text-xs text-muted-foreground">You're exploring with sample data</p>
            </div>
          </div>
        )}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {getInitials(user?.preferredName || 'ST')}
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-input-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="flex-1 bg-primary text-primary-foreground rounded-xl px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex-1 bg-muted text-foreground rounded-xl px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                  {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{user?.preferredName || 'Student'}</h3>
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setEditedName(user?.preferredName || '');
                      }}
                      className="p-1 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email || 'student@email.com'}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-lg">
                      7 day streak 🔥
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Sections */}
      <div className="px-6 mt-6 space-y-6 mb-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">
              {section.title}
            </h2>
            <Card className="divide-y divide-border">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{item.label}</p>
                      {item.value && !item.isToggle && (
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      )}
                    </div>
                    {item.isToggle ? (
                      <div
                        className={`w-12 h-7 rounded-full transition-colors ${
                          isDarkMode ? 'bg-primary' : 'bg-muted'
                        } relative`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${
                            isDarkMode ? 'left-6' : 'left-1'
                          }`}
                        />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Card>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 transition-colors rounded-2xl"
          >
            <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-destructive">Log Out</p>
            </div>
            <ChevronRight className="w-5 h-5 text-destructive" />
          </button>
        </Card>
      </div>
    </div>
  );
}