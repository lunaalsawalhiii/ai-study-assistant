import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { BackButton } from '../components/BackButton';
import { Calendar, Clock, Plus, MapPin, X, ChevronLeft, ChevronRight, Edit, Trash2, FileText } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date format (YYYY-MM-DD)
  time?: string; // Optional time
  type: 'Exam' | 'Assignment' | 'Quiz' | 'Reminder';
  notes?: string;
  location?: string;
  userId: string;
}

export function CalendarScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { user, isDemoMode } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: '',
    time: '',
    type: 'Reminder',
    notes: '',
    location: ''
  });

  // Fetch events from database
  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // In demo mode, load sample events
    if (isDemoMode) {
      setEvents([
        {
          id: '1',
          title: 'Math Midterm Exam',
          date: '2026-01-08',
          time: '9:00 AM',
          type: 'Exam',
          location: 'Room 301',
          notes: 'Chapters 1-5',
          userId: user.id
        },
        {
          id: '2',
          title: 'Physics Midterm',
          date: '2026-01-08',
          time: '2:00 PM',
          type: 'Exam',
          location: 'Lab 4',
          userId: user.id
        },
        {
          id: '3',
          title: 'History Essay Due',
          date: '2026-01-10',
          time: '11:59 PM',
          type: 'Assignment',
          notes: '2000 words on Renaissance',
          userId: user.id
        },
        {
          id: '4',
          title: 'AI Project Submission',
          date: '2026-01-10',
          time: '5:00 PM',
          type: 'Assignment',
          userId: user.id
        },
        {
          id: '5',
          title: 'Chemistry Quiz',
          date: '2026-01-12',
          time: '10:00 AM',
          type: 'Quiz',
          location: 'Lab 2',
          userId: user.id
        },
        {
          id: '6',
          title: 'Study Group Meeting',
          date: '2026-01-15',
          time: '3:00 PM',
          type: 'Reminder',
          location: 'Library',
          userId: user.id
        },
        {
          id: '7',
          title: 'Biology Quiz',
          date: '2026-01-15',
          time: '11:00 AM',
          type: 'Quiz',
          location: 'Room 205',
          userId: user.id
        },
        {
          id: '8',
          title: 'English Essay Draft',
          date: '2026-01-18',
          time: '11:59 PM',
          type: 'Assignment',
          userId: user.id
        },
        {
          id: '9',
          title: 'Stats Pop Quiz',
          date: '2026-01-20',
          time: '9:30 AM',
          type: 'Quiz',
          location: 'Room 102',
          userId: user.id
        },
        {
          id: '10',
          title: 'Final Project Review',
          date: '2026-01-22',
          time: '2:00 PM',
          type: 'Reminder',
          location: 'Office Hours',
          userId: user.id
        },
      ]);
      setIsLoading(false);
      return;
    }

    // Real database fetch
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/calendar/events`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        console.error('Failed to load events:', await response.text());
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save event to database
  const saveEvent = async (event: Partial<CalendarEvent>) => {
    if (!user) return;

    // In demo mode, just update local state
    if (isDemoMode) {
      const newEventObj: CalendarEvent = {
        id: Date.now().toString(),
        title: event.title || '',
        date: event.date || '',
        time: event.time,
        type: event.type || 'Reminder',
        notes: event.notes,
        location: event.location,
        userId: user.id
      };
      setEvents([...events, newEventObj]);
      return { success: true };
    }

    // Real database save
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/calendar/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      if (response.ok) {
        await loadEvents();
        return { success: true };
      } else {
        return { success: false, error: await response.text() };
      }
    } catch (error) {
      console.error('Error saving event:', error);
      return { success: false, error: String(error) };
    }
  };

  // Update event in database
  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;

    // In demo mode, update local state
    if (isDemoMode) {
      setEvents(events.map(e => e.id === eventId ? { ...e, ...updates } : e));
      return { success: true };
    }

    // Real database update
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/calendar/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );

      if (response.ok) {
        await loadEvents();
        return { success: true };
      } else {
        return { success: false, error: await response.text() };
      }
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, error: String(error) };
    }
  };

  // Delete event from database
  const deleteEvent = async (eventId: string) => {
    if (!user) return;

    // In demo mode, remove from local state
    if (isDemoMode) {
      setEvents(events.filter(e => e.id !== eventId));
      return { success: true };
    }

    // Real database delete
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/calendar/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        await loadEvents();
        return { success: true };
      } else {
        return { success: false, error: await response.text() };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: String(error) };
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  // Get color styles for event types
  const getEventColorStyles = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'Exam':
        return {
          dot: 'bg-red-400/80 dark:bg-red-400/70',
          bg: 'bg-red-50 dark:bg-red-950/30',
          text: 'text-red-700 dark:text-red-300',
          badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800/50'
        };
      case 'Assignment':
        return {
          dot: 'bg-blue-400/80 dark:bg-blue-400/70',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          text: 'text-blue-700 dark:text-blue-300',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800/50'
        };
      case 'Quiz':
        return {
          dot: 'bg-yellow-400/80 dark:bg-yellow-400/70',
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
          text: 'text-yellow-700 dark:text-yellow-300',
          badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-800/50'
        };
      case 'Reminder':
        return {
          dot: 'bg-purple-400/80 dark:bg-purple-400/70',
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          text: 'text-purple-700 dark:text-purple-300',
          badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-800/50'
        };
    }
  };

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      alert('Please fill in title and date');
      return;
    }

    await saveEvent(newEvent);
    
    setNewEvent({
      title: '',
      date: '',
      time: '',
      type: 'Reminder',
      notes: '',
      location: ''
    });
    setShowAddModal(false);
  };

  // Handle editing an event
  const handleEditEvent = async () => {
    if (!editingEvent) return;

    await updateEvent(editingEvent.id, editingEvent);
    
    setEditingEvent(null);
    setShowEditModal(false);
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
      setSelectedDate(null);
    }
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      setSelectedDate(date);
    } else {
      // Open add modal with pre-filled date
      const dateStr = date.toISOString().split('T')[0];
      setNewEvent({ ...newEvent, date: dateStr });
      setShowAddModal(true);
    }
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Check if date is today
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date: Date | null): boolean => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get upcoming events (sorted by date)
  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const calendarDays = generateCalendarDays();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = getUpcomingEvents();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

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
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground mt-1">{events.length} total events</p>
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="px-6 mt-6">
        <div className="flex items-center gap-4 text-xs flex-wrap">
          {(['Exam', 'Assignment', 'Quiz', 'Reminder'] as CalendarEvent['type'][]).map((type) => {
            const styles = getEventColorStyles(type);
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${styles.dot}`}></div>
                <span className="text-muted-foreground">{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-6 mt-4">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <button 
                onClick={previousMonth}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-xs text-muted-foreground font-medium text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dayEvents = getEventsForDate(date);
              const today = isToday(date);
              const selected = isSelected(date);
              
              // Get unique event types for this day
              const eventTypes = Array.from(new Set(dayEvents.map(e => e.type)));
              
              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(date)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition-all ${
                    today
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                      : selected
                      ? 'bg-accent/30 ring-2 ring-accent font-medium'
                      : dayEvents.length > 0
                      ? 'bg-muted/50 hover:bg-muted font-medium cursor-pointer'
                      : 'hover:bg-muted/30 cursor-pointer'
                  }`}
                >
                  <span>{date.getDate()}</span>
                  
                  {/* Event Indicators (colored dots) */}
                  {dayEvents.length > 0 && !today && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {eventTypes.slice(0, 3).map((type, idx) => {
                        const styles = getEventColorStyles(type);
                        return (
                          <div
                            key={idx}
                            className={`w-1 h-1 rounded-full ${styles.dot}`}
                          ></div>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Selected Day Events Modal */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card rounded-t-3xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-bold">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDateEvents.length} event{selectedDateEvents.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              {selectedDateEvents.map((event) => {
                const styles = getEventColorStyles(event.type);
                return (
                  <div
                    key={event.id}
                    className={`border-l-4 ${styles.border} ${styles.bg} rounded-r-2xl p-4`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold flex-1">{event.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-lg ${styles.badge}`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {event.time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.notes && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{event.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowEditModal(true);
                          setSelectedDate(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="px-6 mt-6 mb-6">
        <h2 className="font-semibold mb-3">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card className="bg-muted/30">
            <p className="text-muted-foreground text-center py-8">
              No upcoming events. Add one using the + button!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const styles = getEventColorStyles(event.type);
              return (
                <div
                  key={event.id}
                  onClick={() => {
                    setEditingEvent(event);
                    setShowEditModal(true);
                  }}
                  className={`border-l-4 ${styles.border} ${styles.bg} rounded-r-2xl p-4 cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-lg ${styles.badge}`}>
                      {event.type}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <FloatingActionButton
        icon={<Plus className="w-6 h-6" />}
        onClick={() => setShowAddModal(true)}
      />

      {/* Add Event Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Event"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Event Title *</label>
            <InputField
              value={newEvent.title || ''}
              onChange={(value) => setNewEvent({ ...newEvent, title: value })}
              placeholder="e.g., Math Midterm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Date *</label>
              <input
                type="date"
                value={newEvent.date || ''}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Time</label>
              <input
                type="time"
                value={newEvent.time || ''}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Type *</label>
            <select
              value={newEvent.type || 'Reminder'}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
              className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Reminder">Reminder</option>
              <option value="Exam">Exam</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Location</label>
            <InputField
              value={newEvent.location || ''}
              onChange={(value) => setNewEvent({ ...newEvent, location: value })}
              placeholder="e.g., Room 301"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Notes</label>
            <textarea
              value={newEvent.notes || ''}
              onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
              placeholder="Additional details..."
              rows={3}
              className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleAddEvent} className="flex-1">
              Add Event
            </Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Event"
      >
        {editingEvent && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Event Title *</label>
              <InputField
                value={editingEvent.title}
                onChange={(value) => setEditingEvent({ ...editingEvent, title: value })}
                placeholder="e.g., Math Midterm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Date *</label>
                <input
                  type="date"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Time</label>
                <input
                  type="time"
                  value={editingEvent.time || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Type *</label>
              <select
                value={editingEvent.type}
                onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as CalendarEvent['type'] })}
                className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Reminder">Reminder</option>
                <option value="Exam">Exam</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Location</label>
              <InputField
                value={editingEvent.location || ''}
                onChange={(value) => setEditingEvent({ ...editingEvent, location: value })}
                placeholder="e.g., Room 301"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Notes</label>
              <textarea
                value={editingEvent.notes || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                placeholder="Additional details..."
                rows={3}
                className="w-full bg-input-background border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="primary" onClick={handleEditEvent} className="flex-1">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
