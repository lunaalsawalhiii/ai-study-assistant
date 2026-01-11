// Utility to extract potential calendar events from text
export interface DetectedEvent {
  title: string;
  date: string; // ISO format
  time?: string;
  type: 'Exam' | 'Assignment' | 'Quiz' | 'Reminder';
  notes?: string;
  location?: string;
  confidence: number; // 0-1
}

// Keywords to identify event types
const EVENT_TYPE_KEYWORDS = {
  exam: ['exam', 'midterm', 'final', 'test'],
  assignment: ['assignment', 'essay', 'paper', 'project', 'homework', 'due'],
  quiz: ['quiz', 'pop quiz', 'short test'],
  reminder: ['meeting', 'review', 'session', 'office hours', 'study group']
};

// Date patterns (common formats)
const DATE_PATTERNS = [
  // January 15, 2026 or Jan 15, 2026
  /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}/gi,
  // 01/15/2026 or 1/15/26
  /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
  // 2026-01-15 (ISO format)
  /\d{4}-\d{2}-\d{2}/g,
];

// Time patterns
const TIME_PATTERNS = [
  // 9:00 AM, 9:00am, 9am
  /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/g,
  /\d{1,2}\s*(?:AM|PM|am|pm)/g,
];

// Location patterns
const LOCATION_PATTERNS = [
  /(?:room|hall|building|lab|library|office)\s+[\w\d]+/gi,
  /(?:at|in)\s+([\w\s]+(?:Hall|Room|Lab|Library|Building|Center))/gi,
];

export function detectEventsFromText(text: string, fileName?: string): DetectedEvent[] {
  const detectedEvents: DetectedEvent[] = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip very long lines (likely not event descriptions)
    if (line.length > 200) continue;

    // Look for dates in the line
    let foundDate: string | null = null;
    let dateMatch: RegExpMatchArray | null = null;

    for (const pattern of DATE_PATTERNS) {
      const matches = line.match(pattern);
      if (matches && matches.length > 0) {
        foundDate = matches[0];
        dateMatch = matches;
        break;
      }
    }

    if (!foundDate) continue;

    // Determine event type based on keywords
    let eventType: DetectedEvent['type'] = 'Reminder';
    let confidence = 0.5;
    const lowerLine = line.toLowerCase();

    for (const [type, keywords] of Object.entries(EVENT_TYPE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerLine.includes(keyword)) {
          if (type === 'exam') eventType = 'Exam';
          else if (type === 'assignment') eventType = 'Assignment';
          else if (type === 'quiz') eventType = 'Quiz';
          else eventType = 'Reminder';
          confidence = 0.8;
          break;
        }
      }
    }

    // Extract title (use the line without the date)
    let title = line;
    if (foundDate) {
      title = line.replace(foundDate, '').trim();
    }

    // Clean up title
    title = title.replace(/^[-:•]\s*/, '').trim();
    if (!title || title.length < 3) {
      title = `Event from ${fileName || 'document'}`;
    }

    // Truncate long titles
    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }

    // Extract time if present
    let time: string | undefined;
    for (const pattern of TIME_PATTERNS) {
      const timeMatches = line.match(pattern);
      if (timeMatches && timeMatches.length > 0) {
        time = timeMatches[0];
        break;
      }
    }

    // Extract location if present
    let location: string | undefined;
    for (const pattern of LOCATION_PATTERNS) {
      const locationMatches = line.match(pattern);
      if (locationMatches && locationMatches.length > 0) {
        location = locationMatches[0].replace(/^(?:at|in)\s+/i, '').trim();
        break;
      }
    }

    // Convert date to ISO format
    const isoDate = convertToISODate(foundDate);
    if (!isoDate) continue;

    // Check if this is a future date
    const eventDate = new Date(isoDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      confidence *= 0.5; // Lower confidence for past dates
    }

    // Create detected event
    detectedEvents.push({
      title,
      date: isoDate,
      time,
      type: eventType,
      notes: line.length < 150 ? line : undefined,
      location,
      confidence
    });
  }

  // Sort by confidence and return top 5
  return detectedEvents
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

// Convert various date formats to ISO (YYYY-MM-DD)
function convertToISODate(dateStr: string): string | null {
  try {
    // Try to parse the date
    const date = new Date(dateStr);
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      return null;
    }

    // Convert to ISO format (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    return null;
  }
}

// Example usage function (for testing)
export function testEventDetection() {
  const sampleText = `
    Math 101 Syllabus
    
    - Midterm Exam: February 15, 2026 at 9:00 AM in Room 301
    - Final Project Due: March 20, 2026
    - Quiz 1: January 25, 2026 at 2:00 PM
    - Office Hours: Every Wednesday 3-5 PM in Building A
    - Assignment 1 submission deadline: 02/01/2026 11:59 PM
  `;

  const events = detectEventsFromText(sampleText, 'Math 101 Syllabus.pdf');
  console.log('Detected events:', events);
  return events;
}
