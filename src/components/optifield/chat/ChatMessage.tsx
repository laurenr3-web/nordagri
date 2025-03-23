
import React from 'react';

export interface ChatMessageProps {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, sender, timestamp }) => {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] rounded-lg px-4 py-2 ${
          sender === 'user' 
            ? 'bg-primary text-white'
            : 'bg-secondary'
        }`}
      >
        <p>{content}</p>
        <p className="text-xs opacity-70 mt-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
