import React from 'react';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { Bell, Star, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AnnouncementsScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const announcements = [
    {
      id: 1,
      type: 'star',
      title: 'New Feature: Smart Summaries',
      message: 'Your AI assistant can now generate concise summaries of your study materials!',
      time: '2 hours ago',
      color: 'bg-accent'
    },
    {
      id: 2,
      type: 'info',
      title: 'Study Tip of the Day',
      message: 'Break your study sessions into 25-minute focused blocks with 5-minute breaks (Pomodoro Technique)',
      time: '5 hours ago',
      color: 'bg-primary'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Upcoming Deadline',
      message: 'Math Midterm Exam is in 3 days. Start reviewing your materials!',
      time: 'Yesterday',
      color: 'bg-secondary'
    },
    {
      id: 4,
      type: 'check',
      title: 'Milestone Achieved! 🎉',
      message: 'You\'ve maintained a 7-day study streak. Keep up the great work!',
      time: '2 days ago',
      color: 'bg-chart-4'
    },
    {
      id: 5,
      type: 'info',
      title: 'System Update',
      message: 'We\'ve improved the chat response time and added better explanations for complex topics.',
      time: '3 days ago',
      color: 'bg-primary'
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'star':
        return <Star className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      case 'check':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 px-6 pt-12 pb-6 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate('home')} />
          </div>
        )}
        <div className={`flex items-center gap-3 ${onNavigate ? 'pt-12' : ''}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-muted-foreground mt-1">{announcements.length} updates</p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="px-6 mt-6 space-y-3">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="relative overflow-hidden">
            {/* Color Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${announcement.color}`}></div>
            
            <div className="flex gap-3 pl-3">
              {/* Icon */}
              <div className={`w-10 h-10 ${announcement.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-1`}>
                {getIcon(announcement.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {announcement.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{announcement.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State (hidden when there are announcements) */}
      {announcements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bell className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No announcements yet</h3>
          <p className="text-muted-foreground text-center mt-2">
            We'll notify you here about updates and important information
          </p>
        </div>
      )}
    </div>
  );
}