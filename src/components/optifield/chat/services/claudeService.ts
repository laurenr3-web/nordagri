
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatMessage, AISettings } from '../types';
import { getAISettings } from '../utils/aiSettings';

// Process the AI response for special action commands
export const processActionCommands = (
  response: string,
  trackingActive: boolean,
  startTracking: () => void,
  stopTracking: () => void,
  setTrackingActive: (active: boolean) => void
): string => {
  let cleanedResponse = response;

  if (response.includes('[ACTION:START_TRACKING]')) {
    if (!trackingActive) {
      startTracking();
      setTrackingActive(true);
      toast.success('Suivi des activités activé');
    }
    cleanedResponse = cleanedResponse.replace(/\[ACTION:START_TRACKING\]/g, '');
  } 
  
  if (response.includes('[ACTION:STOP_TRACKING]')) {
    if (trackingActive) {
      stopTracking();
      setTrackingActive(false);
      toast.info('Suivi des activités désactivé');
    }
    cleanedResponse = cleanedResponse.replace(/\[ACTION:STOP_TRACKING\]/g, '');
  } 
  
  if (response.includes('[ACTION:WEATHER_INFO]')) {
    toast.info('Affichage des informations météo');
    cleanedResponse = cleanedResponse.replace(/\[ACTION:WEATHER_INFO\]/g, '');
  } 
  
  if (response.includes('[ACTION:FIELD_INFO:')) {
    // Extract field name and display information
    const fieldNameMatch = response.match(/\[ACTION:FIELD_INFO:(.*?)\]/);
    if (fieldNameMatch && fieldNameMatch[1]) {
      const fieldName = fieldNameMatch[1];
      toast.info(`Affichage des informations sur le champ: ${fieldName}`);
    }
    cleanedResponse = cleanedResponse.replace(/\[ACTION:FIELD_INFO:.*?\]/g, '');
  }

  return cleanedResponse.trim();
};

// Send message to Claude API
export const sendMessageToClaude = async (
  messages: ChatMessage[],
  userMessage: ChatMessage,
  contextData: any,
  trackingActive: boolean,
  startTracking: () => void,
  stopTracking: () => void,
  setTrackingActive: (active: boolean) => void
): Promise<string> => {
  try {
    // Get AI settings
    const { model, temperature, enableContext } = getAISettings();
    
    // Format messages for Anthropic
    const formattedMessages = messages
      .filter(msg => msg.id !== '1') // Filter out welcome message
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    // Prepare context data to send to Claude
    const contextDataToSend = enableContext ? {
      trackingActive,
      position: contextData.currentPosition,
      fields: contextData.fields?.slice(0, 5), // Limit to 5 fields
      equipment: contextData.equipment?.slice(0, 5), // Limit to 5 equipment
      activeSession: contextData.activeSession,
      model,
      temperature,
      maxTokens: 1000,
      // Mock weather data
      weather: {
        current: "Ensoleillé, 22°C",
        forecast: "Journée ensoleillée avec quelques nuages l'après-midi. Température entre 18°C et 25°C."
      }
    } : null;

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('anthropic-chat', {
      body: {
        messages: formattedMessages,
        systemPrompt: `Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. 
        Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. 
        Répondez toujours en français de manière concise et pratique.
        
        Vous pouvez aider avec:
        - La gestion des champs et parcelles
        - Le suivi des activités agricoles
        - L'optimisation des itinéraires techniques
        - Des conseils sur les équipements agricoles
        - Des recommandations basées sur les conditions météorologiques
        - La planification des interventions agricoles`,
        contextData: contextDataToSend
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Process Claude's response
    const assistantResponse = data.content[0].text;
    
    // Process action commands in response
    const cleanedResponse = processActionCommands(
      assistantResponse,
      trackingActive,
      startTracking,
      stopTracking,
      setTrackingActive
    );

    return cleanedResponse;
  } catch (error) {
    console.error('Erreur lors de la communication avec Claude:', error);
    throw error;
  }
};
