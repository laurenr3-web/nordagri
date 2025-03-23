
import { useState } from 'react';
import { toast } from 'sonner';
import useOptiField from '@/hooks/useOptiField';
import { useMessages } from './hooks/useMessages';
import { sendMessageToClaude } from './services/claudeService';
import { ChatMessage } from './types';

export { ChatMessage };

export const useChatLogic = (
  trackingActive: boolean,
  setTrackingActive: (active: boolean) => void
) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { messages, addUserMessage, addSystemMessage } = useMessages();
  
  // Get OptiField context data to send to Claude
  const {
    fields,
    equipment,
    currentPosition,
    activeSession,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking
  } = useOptiField();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = addUserMessage(inputValue);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare context data
      const contextData = {
        currentPosition,
        fields,
        equipment,
        activeSession
      };

      // Send message to Claude
      const response = await sendMessageToClaude(
        messages, 
        userMessage, 
        contextData,
        trackingActive,
        startTracking,
        stopTracking, 
        setTrackingActive
      );
      
      // Add Claude's response
      addSystemMessage(response);
    } catch (error) {
      console.error('Error in chat communication:', error);
      
      // Add error message
      addSystemMessage("Désolé, je rencontre des difficultés de communication. Veuillez réessayer dans un instant.");
      toast.error("Erreur de communication avec l'assistant");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.info('Enregistrement vocal arrêté');
      // In a real app, we would process the recording here
    } else {
      setIsRecording(true);
      toast.success('Enregistrement vocal démarré');
      // In a real app, we would start recording here
    }
  };
  
  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    // Optional: immediately send the quick reply
    // setTimeout(() => handleSendMessage(), 100);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Expand interface automatically on first visit is handled in useMessages hook
  
  return {
    messages,
    inputValue,
    setInputValue,
    isExpanded,
    toggleExpanded,
    isRecording,
    isLoading,
    toggleRecording,
    handleSendMessage,
    handleQuickReply
  };
};
