import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Calendar, Clock, MapPin, FileText, Sparkles } from 'lucide-react';

interface SuggestedEvent {
  title: string;
  date: string;
  time?: string;
  type: 'Exam' | 'Assignment' | 'Quiz' | 'Reminder';
  notes?: string;
  location?: string;
  source?: string; // Where the suggestion came from (e.g., "History Notes.pdf")
}

interface AISuggestEventModalProps {
  isOpen: boolean;
  suggestedEvent: SuggestedEvent | null;
  onAccept: (event: SuggestedEvent) => void;
  onReject: () => void;
}

export function AISuggestEventModal({ 
  isOpen, 
  suggestedEvent, 
  onAccept, 
  onReject 
}: AISuggestEventModalProps) {
  if (!suggestedEvent) return null;

  const getEventColorBadge = (type: SuggestedEvent['type']) => {
    switch (type) {
      case 'Exam':
        return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
      case 'Assignment':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
      case 'Quiz':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300';
      case 'Reminder':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300';
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onReject}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span>AI Suggested Event</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* AI Notice */}
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">
            Lunar detected this event from your study materials and thinks you might want to add it to your calendar.
          </p>
          {suggestedEvent.source && (
            <p className="text-xs text-accent mt-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Found in: {suggestedEvent.source}
            </p>
          )}
        </div>

        {/* Event Details Card */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 space-y-3">
          {/* Title and Type */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg flex-1">{suggestedEvent.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-lg ${getEventColorBadge(suggestedEvent.type)}`}>
              {suggestedEvent.type}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(suggestedEvent.date)}</span>
          </div>

          {/* Time */}
          {suggestedEvent.time && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{suggestedEvent.time}</span>
            </div>
          )}

          {/* Location */}
          {suggestedEvent.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{suggestedEvent.location}</span>
            </div>
          )}

          {/* Notes */}
          {suggestedEvent.notes && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">{suggestedEvent.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="primary" 
            onClick={() => onAccept(suggestedEvent)} 
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </Button>
          <Button 
            variant="secondary" 
            onClick={onReject} 
            className="flex-1"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
