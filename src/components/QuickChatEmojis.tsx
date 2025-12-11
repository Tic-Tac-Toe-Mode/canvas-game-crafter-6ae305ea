import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickChatProps {
  onSelect: (message: string) => void;
}

const QUICK_EMOJIS = [
  { emoji: '👋', label: 'Wave' },
  { emoji: '😊', label: 'Smile' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '🔥', label: 'Fire' },
];

const QUICK_MESSAGES = [
  'Good game!',
  'Nice move!',
  'Rematch?',
  'Good luck!',
  'Well played!',
  'GG',
];

export const QuickChatEmojis: React.FC<QuickChatProps> = ({ onSelect }) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {QUICK_EMOJIS.map(({ emoji, label }) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(emoji)}
          className="h-8 w-8 p-0 text-lg hover:bg-muted"
          title={label}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
};

export const QuickChatMessages: React.FC<QuickChatProps> = ({ onSelect }) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {QUICK_MESSAGES.map((message) => (
        <Button
          key={message}
          variant="outline"
          size="sm"
          onClick={() => onSelect(message)}
          className="h-7 text-xs"
        >
          {message}
        </Button>
      ))}
    </div>
  );
};

export default QuickChatEmojis;
