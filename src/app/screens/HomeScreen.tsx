import React from 'react';
import { Card } from '../components/Card';
import { Upload, MessageSquare, Bell, Calendar, TrendingUp, BookOpen, Clock, Award, Timer } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { user } = useUser();
  
  const quickActions = [
    { id: 'upload', icon: Upload, label: 'Upload', color: 'bg-primary', screen: 'upload' },
    { id: 'chat', icon: MessageSquare, label: 'AI Chat', color: 'bg-secondary', screen: 'chat' },
    { id: 'announcements', icon: Bell, label: 'Updates', color: 'bg-accent', screen: 'announcements' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'bg-chart-4', screen: 'calendar' },
  ];

  const studyStats = [
    { label: 'Study Streak', value: '7 days', icon: TrendingUp, color: 'text-primary' },
    { label: 'Materials', value: '24', icon: BookOpen, color: 'text-secondary' },
    { label: 'Study Time', value: '12h', icon: Clock, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hi, {user?.preferredName || 'Student'} 👋</h1>
            <p className="text-muted-foreground mt-1">Let's achieve your study goals</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.screen)}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Study Timer Feature Card */}
      <div className="px-6 mt-6">
        <Card 
          onClick={() => onNavigate('timer')}
          className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
              <Timer className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Study Timer</h3>
              <p className="text-sm text-muted-foreground mt-1">Focus mode for deep study sessions</p>
            </div>
            <div className="text-primary font-bold text-2xl">→</div>
          </div>
        </Card>
      </div>

      {/* Study Stats */}
      <div className="px-6 mt-6">
        <h2 className="font-semibold mb-3">Your Progress</h2>
        <div className="grid grid-cols-3 gap-3">
          {studyStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Materials */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Materials</h2>
          <button 
            onClick={() => onNavigate('upload')}
            className="text-sm text-primary"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          <MaterialCard
            title="Chapter 5: Calculus Basics"
            subject="Mathematics"
            date="Today"
            onClick={() => onNavigate('chat')}
          />
          <MaterialCard
            title="The French Revolution"
            subject="History"
            date="Yesterday"
            onClick={() => onNavigate('chat')}
          />
          <MaterialCard
            title="Photosynthesis Notes"
            subject="Biology"
            date="2 days ago"
            onClick={() => onNavigate('chat')}
          />
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="px-6 mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Upcoming</h2>
          <button 
            onClick={() => onNavigate('calendar')}
            className="text-sm text-primary"
          >
            See All
          </button>
        </div>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-xl px-3 py-2 text-center">
              <p className="text-xs">JAN</p>
              <p className="text-xl font-bold">8</p>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Math Midterm Exam</h3>
              <p className="text-sm text-muted-foreground mt-1">3 days away • 9:00 AM</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-lg">
                  Mathematics
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MaterialCard({ 
  title, 
  subject, 
  date, 
  onClick 
}: { 
  title: string; 
  subject: string; 
  date: string;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{title}</h3>
        <p className="text-sm text-muted-foreground">{subject} • {date}</p>
      </div>
    </Card>
  );
}