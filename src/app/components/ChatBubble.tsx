import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  type: 'user' | 'ai';
  timestamp?: string;
}

export function ChatBubble({ message, type, timestamp }: ChatBubbleProps) {
  const isUser = type === 'user';
  
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-secondary' : 'bg-primary'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-secondary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary-foreground" />
        )}
      </div>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-secondary text-secondary-foreground rounded-tr-sm' 
            : 'bg-card text-card-foreground border border-border rounded-tl-sm'
        }`}>
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-2">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
