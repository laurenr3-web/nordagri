
import { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { INITIAL_MESSAGES } from '../constants';

export const useMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  
  // Étendre l'interface de chat automatiquement lors de la première visite
  useEffect(() => {
    const hasSeenChat = localStorage.getItem('has-seen-chat');
    if (!hasSeenChat) {
      setTimeout(() => {
        localStorage.setItem('has-seen-chat', 'true');
      }, 1500);
    }
  }, []);

  const addUserMessage = (content: string): ChatMessage => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content,
      sender: 'system',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  return {
    messages,
    addUserMessage,
    addSystemMessage
  };
};
