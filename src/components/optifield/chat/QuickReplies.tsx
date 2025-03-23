
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickRepliesProps {
  replies: string[];
  onSelectReply: (reply: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onSelectReply }) => {
  return (
    <div className="px-4 py-2 flex gap-2 flex-wrap">
      {replies.map((reply) => (
        <Button 
          key={reply}
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onSelectReply(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplies;
