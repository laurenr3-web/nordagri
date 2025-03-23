
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { INITIAL_MESSAGES } from './constants';
import useOptiField from '@/hooks/useOptiField';

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

  // Get AI settings from localStorage
  const getAISettings = () => {
    try {
      const model = localStorage.getItem('ai-model') || 'claude-3-haiku';
      const temperature = parseInt(localStorage.getItem('ai-temperature') || '70') / 100;
      const enableContext = localStorage.getItem('ai-enable-context') !== 'false'; // Default to true
      
      return { model, temperature, enableContext };
    } catch (e) {
      console.error('Error getting AI settings:', e);
      return { 
        model: 'claude-3-haiku', 
        temperature: 0.7, 
        enableContext: true 
      };
    }
  };
  
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
      // Get AI settings
      const { model, temperature, enableContext } = getAISettings();
      
      // Préparer les messages au format Anthropic
      const formattedMessages = messages
        .filter(msg => msg.id !== '1') // Filtrer le message d'accueil
        .concat(userMessage)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Préparer les données contextuelles à envoyer à Claude
      const contextData = enableContext ? {
        trackingActive,
        position: currentPosition,
        fields: fields?.slice(0, 5), // Limiter à 5 champs pour éviter d'envoyer trop de données
        equipment: equipment?.slice(0, 5), // Limiter à 5 équipements
        activeSession,
        model,
        temperature,
        maxTokens: 1000,
        // Mock weather data (à remplacer par des données réelles dans une mise en œuvre complète)
        weather: {
          current: "Ensoleillé, 22°C",
          forecast: "Journée ensoleillée avec quelques nuages l'après-midi. Température entre 18°C et 25°C."
        }
      } : null;

      // Préparer le prompt système
      const systemPrompt = `Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. 
      Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. 
      Répondez toujours en français de manière concise et pratique.
      
      Vous pouvez aider avec:
      - La gestion des champs et parcelles
      - Le suivi des activités agricoles
      - L'optimisation des itinéraires techniques
      - Des conseils sur les équipements agricoles
      - Des recommandations basées sur les conditions météorologiques
      - La planification des interventions agricoles`;

      // Appeler la fonction edge Supabase
      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          messages: formattedMessages,
          systemPrompt: systemPrompt,
          contextData: contextData
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Traiter la réponse de Claude
      const assistantResponse = data.content[0].text;
      
      // Détecter les actions spéciales dans la réponse
      if (assistantResponse.includes('[ACTION:START_TRACKING]')) {
        if (!trackingActive) {
          startTracking();
          setTrackingActive(true);
          toast.success('Suivi des activités activé');
        }
      } else if (assistantResponse.includes('[ACTION:STOP_TRACKING]')) {
        if (trackingActive) {
          stopTracking();
          setTrackingActive(false);
          toast.info('Suivi des activités désactivé');
        }
      } else if (assistantResponse.includes('[ACTION:WEATHER_INFO]')) {
        // À implémenter: afficher des informations météo détaillées
        toast.info('Affichage des informations météo');
      } else if (assistantResponse.includes('[ACTION:FIELD_INFO:')) {
        // Extraction du nom du champ et affichage des informations
        const fieldNameMatch = assistantResponse.match(/\[ACTION:FIELD_INFO:(.*?)\]/);
        if (fieldNameMatch && fieldNameMatch[1]) {
          const fieldName = fieldNameMatch[1];
          toast.info(`Affichage des informations sur le champ: ${fieldName}`);
        }
      }
      
      // Nettoyer la réponse (retirer les balises d'action)
      const cleanedResponse = assistantResponse
        .replace(/\[ACTION:START_TRACKING\]/g, '')
        .replace(/\[ACTION:STOP_TRACKING\]/g, '')
        .replace(/\[ACTION:WEATHER_INFO\]/g, '')
        .replace(/\[ACTION:FIELD_INFO:.*?\]/g, '')
        .trim();

      // Ajouter la réponse du système
      const systemMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: cleanedResponse,
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
  
  // Étendre l'interface de chat automatiquement lors de la première visite
  useEffect(() => {
    const hasSeenChat = localStorage.getItem('has-seen-chat');
    if (!hasSeenChat) {
      setTimeout(() => {
        setIsExpanded(true);
        localStorage.setItem('has-seen-chat', 'true');
      }, 1500);
    }
  }, []);
  
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
