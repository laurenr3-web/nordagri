
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Mic, 
  MicOff,
  ChevronUp, 
  ChevronDown,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

interface OptiFieldChatInterfaceProps {
  trackingActive: boolean;
  setTrackingActive: (active: boolean) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    content: 'Bonjour! Je suis votre assistant OptiField. Comment puis-je vous aider aujourd\'hui?',
    sender: 'system',
    timestamp: new Date(Date.now() - 60000)
  }
];

// Quick replies that will appear as suggestions
const QUICK_REPLIES = [
  "Démarrer le labour avec le John Deere",
  "Combien d'heures a fait le tracteur aujourd'hui?",
  "Pause déjeuner",
  "Quelle est la météo pour cet après-midi?"
];

const OptiFieldChatInterface: React.FC<OptiFieldChatInterfaceProps> = ({ 
  trackingActive,
  setTrackingActive
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Process message for commands
    setTimeout(() => {
      processMessage(inputValue);
    }, 500);
  };
  
  const processMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    let response = '';
    
    // Handle different command types
    if (lowerMessage.includes('démarrer') || lowerMessage.includes('commencer') || lowerMessage.includes('start')) {
      if (!trackingActive) {
        setTrackingActive(true);
        
        // Extract equipment info if present
        let equipment = 'équipement';
        if (lowerMessage.includes('john deere')) equipment = 'tracteur John Deere';
        if (lowerMessage.includes('new holland')) equipment = 'tracteur New Holland';
        if (lowerMessage.includes('fendt')) equipment = 'tracteur Fendt';
        
        response = `Suivi activé pour ${equipment} sur parcelle Les Grandes Terres (détectée par votre position). Bon travail!`;
        
        toast.success('Suivi des activités activé');
      } else {
        response = "Le suivi est déjà activé. Bon travail!";
      }
    } 
    else if (lowerMessage.includes('arrêter') || lowerMessage.includes('stopper') || lowerMessage.includes('stop')) {
      if (trackingActive) {
        setTrackingActive(false);
        response = "Suivi désactivé. Vous avez travaillé 3h15 aujourd'hui.";
        toast.info('Suivi des activités désactivé');
      } else {
        response = "Le suivi n'est pas actif actuellement.";
      }
    }
    else if (lowerMessage.includes('pause') || lowerMessage.includes('déjeuner')) {
      response = "Suivi en pause. Vous avez travaillé 3h15 ce matin. La météo prévoit de la pluie dans 4 heures.";
      toast.info('Suivi mis en pause');
    }
    else if (lowerMessage.includes('combien') && lowerMessage.includes('heure')) {
      if (lowerMessage.includes('john deere')) {
        response = "Le tracteur John Deere a travaillé 3.5 heures aujourd'hui et 27.5 heures cette semaine.";
      } else if (lowerMessage.includes('fendt')) {
        response = "Le tracteur Fendt a travaillé 0 heures aujourd'hui et 15.2 heures cette semaine.";
      } else {
        response = "Les équipements ont accumulé un total de 42.7 heures cette semaine.";
      }
    }
    else if (lowerMessage.includes('météo')) {
      response = "La météo prévoit un temps ensoleillé avec des passages nuageux cet après-midi. Température maximale de 24°C. Risque de pluie faible (10%) à partir de 16h.";
    }
    else {
      response = "Je ne suis pas sûr de comprendre cette commande. Essayez de me demander le statut des équipements, de démarrer/arrêter le suivi, ou des informations sur la météo.";
    }
    
    // Add system response
    const systemMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: response,
      sender: 'system',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };
  
  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    // Optional: immediately send the quick reply
    // setTimeout(() => handleSendMessage(), 100);
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
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 md:left-64 z-10 transition-all duration-300 ${
      isExpanded ? 'h-[70vh]' : 'h-12'
    }`}>
      <div 
        className="bg-primary text-white p-2 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium">Assistant OptiField</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>
      
      {isExpanded && (
        <Card className="rounded-t-none border-t-0 h-[calc(70vh-48px)]">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white'
                        : 'bg-secondary'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick replies */}
            <div className="px-4 py-2 flex gap-2 flex-wrap">
              {QUICK_REPLIES.map((reply) => (
                <Button 
                  key={reply}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={isRecording ? 'bg-red-100 text-red-500 animate-pulse' : ''}
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="flex-1 px-4 py-2 border rounded-md"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OptiFieldChatInterface;
