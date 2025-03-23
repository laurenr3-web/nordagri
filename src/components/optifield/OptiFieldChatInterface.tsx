
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Mic, 
  MicOff,
  ChevronUp, 
  ChevronDown,
  Bot,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
    content: 'Bonjour! Je suis Claude, votre assistant OptiField propulsé par Anthropic. Comment puis-je vous aider aujourd\'hui?',
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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = async () => {
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
    setIsLoading(true);

    try {
      // Préparer les messages au format Anthropic
      const formattedMessages = messages
        .filter(msg => msg.id !== '1') // Filtrer le message d'accueil
        .concat(userMessage)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Ajouter des informations contextuelles sur le statut du suivi
      const systemPrompt = `Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. 
      Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. 
      Répondez toujours en français de manière concise et pratique.
      
      Informations contextuelles:
      - Suivi d'activité: ${trackingActive ? 'ACTIF' : 'INACTIF'}
      - Si l'utilisateur demande de démarrer une activité et que le suivi n'est pas actif, activez-le.
      - Si l'utilisateur demande d'arrêter une activité et que le suivi est actif, désactivez-le.
      - Date actuelle: ${new Date().toLocaleDateString('fr-FR')}
      - Heure actuelle: ${new Date().toLocaleTimeString('fr-FR')}`;

      // Appeler la fonction edge Supabase
      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          messages: formattedMessages,
          systemPrompt: systemPrompt
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Traiter la réponse de Claude
      const assistantResponse = data.content[0].text;
      
      // Vérifier si la réponse contient des commandes pour activer/désactiver le suivi
      if (assistantResponse.toLowerCase().includes('suivi activé') || 
          assistantResponse.toLowerCase().includes('démarrer le suivi')) {
        if (!trackingActive) {
          setTrackingActive(true);
          toast.success('Suivi des activités activé');
        }
      } else if (assistantResponse.toLowerCase().includes('suivi désactivé') || 
                assistantResponse.toLowerCase().includes('arrêter le suivi')) {
        if (trackingActive) {
          setTrackingActive(false);
          toast.info('Suivi des activités désactivé');
        }
      } else if (assistantResponse.toLowerCase().includes('pause') && trackingActive) {
        toast.info('Suivi mis en pause');
      }

      // Ajouter la réponse du système
      const systemMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error('Erreur lors de la communication avec Claude:', error);
      
      // Message d'erreur en cas d'échec
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, je rencontre des difficultés de communication. Veuillez réessayer dans un instant.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Erreur de communication avec l'assistant");
    } finally {
      setIsLoading(false);
    }
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
          <span className="font-medium">Assistant OptiField (Claude AI)</span>
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
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
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
