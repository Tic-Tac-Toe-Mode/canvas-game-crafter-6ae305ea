import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickChatEmojisProps {
  onSelectEmoji: (emoji: string) => void;
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

const QuickChatEmojis: React.FC<QuickChatEmojisProps> = ({ onSelectEmoji }) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {QUICK_EMOJIS.map(({ emoji, label }) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          onClick={() => onSelectEmoji(emoji)}
          className="h-8 w-8 p-0 text-lg hover:bg-muted"
          title={label}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
};

export default QuickChatEmojis;
