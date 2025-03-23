
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { INITIAL_MESSAGES } from './constants';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

export const useChatLogic = (
  trackingActive: boolean,
  setTrackingActive: (active: boolean) => void
) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
