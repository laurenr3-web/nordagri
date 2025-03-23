
import React from 'react';
import { Card } from '@/components/ui/card';
import { useChatLogic, ChatMessage as ChatMessageType } from './chat/useChatLogic';
import { QUICK_REPLIES } from './chat/constants';
import ChatHeader from './chat/ChatHeader';
import MessagesContainer from './chat/MessagesContainer';
import QuickReplies from './chat/QuickReplies';
import InputControls from './chat/InputControls';

interface OptiFieldChatInterfaceProps {
  trackingActive: boolean;
  setTrackingActive: (active: boolean) => void;
}

const OptiFieldChatInterface: React.FC<OptiFieldChatInterfaceProps> = ({ 
  trackingActive,
  setTrackingActive
}) => {
  const {
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
  } = useChatLogic(trackingActive, setTrackingActive);
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 md:left-64 z-10 transition-all duration-300 ${
      isExpanded ? 'h-[70vh]' : 'h-12'
    }`}>
      <ChatHeader 
        isExpanded={isExpanded} 
        toggleExpanded={toggleExpanded} 
      />
      
      {isExpanded && (
        <Card className="rounded-t-none border-t-0 h-[calc(70vh-48px)]">
          <div className="flex flex-col h-full">
            <MessagesContainer 
              messages={messages as ChatMessageType[]} 
              isLoading={isLoading} 
            />
            
            <QuickReplies 
              replies={QUICK_REPLIES} 
              onSelectReply={handleQuickReply} 
            />
            
            <InputControls 
              inputValue={inputValue}
              setInputValue={setInputValue}
              isLoading={isLoading}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default OptiFieldChatInterface;
