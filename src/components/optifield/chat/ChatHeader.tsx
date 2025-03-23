
import React from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ChatHeaderProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isExpanded, toggleExpanded }) => {
  return (
    <div 
      className="bg-primary text-white p-2 flex items-center justify-between cursor-pointer"
      onClick={toggleExpanded}
    >
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <span className="font-medium">Assistant OptiField (Claude AI)</span>
      </div>
      <Button variant="ghost" size="icon" className="text-white">
        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default ChatHeader;
