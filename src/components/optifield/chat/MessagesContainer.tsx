
import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';

interface MessagesContainerProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id}
          id={message.id}
          content={message.content}
          sender={message.sender}
          timestamp={message.timestamp}
        />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-secondary rounded-lg px-4 py-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Claude réfléchit...</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesContainer;
