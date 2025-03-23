
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatMessage, AISettings, ContextData, ActionCommand } from '../types';
import { getAISettings } from '../utils/aiSettings';

// Constants for action commands
const ACTION_COMMANDS = {
  START_TRACKING: '[ACTION:START_TRACKING]',
  STOP_TRACKING: '[ACTION:STOP_TRACKING]',
  WEATHER_INFO: '[ACTION:WEATHER_INFO]',
  FIELD_INFO_PATTERN: /\[ACTION:FIELD_INFO:(.*?)\]/,
  FIELD_INFO_REPLACE: /\[ACTION:FIELD_INFO:.*?\]/g
};

// Messages for user feedback
const MESSAGES = {
  TRACKING_STARTED: 'Suivi des activités activé',
  TRACKING_STOPPED: 'Suivi des activités désactivé',
  WEATHER_INFO: 'Affichage des informations météo',
  FIELD_INFO: (fieldName: string) => `Affichage des informations sur le champ: ${fieldName}`,
  API_ERROR: (error: string) => `Erreur API Claude: ${error}`,
  INVALID_RESPONSE: 'Format de réponse non valide de Claude',
  FALLBACK_RESPONSE: 'Je suis désolé, je n\'ai pas pu générer une réponse. Veuillez réessayer.',
  CONNECTION_ERROR: 'Erreur de connexion, veuillez vérifier votre réseau et réessayer.'
};

// System prompts - could be moved to a separate file for better organization
const SYSTEM_PROMPTS = {
  AGRICULTURAL_ASSISTANT: `
    Vous êtes un assistant agricole expert qui aide les utilisateurs d'OptiField, une application de gestion d'exploitation agricole. 
    Vous êtes spécialisé dans les pratiques agricoles françaises, les équipements agricoles, la météo et la planification des cultures. 
    Répondez toujours en français de manière concise et pratique.
    
    Vous pouvez aider avec:
    - La gestion des champs et parcelles
    - Le suivi des activités agricoles
    - L'optimisation des itinéraires techniques
    - Des conseils sur les équipements agricoles
    - Des recommandations basées sur les conditions météorologiques
    - La planification des interventions agricoles
  `
};

/**
 * Process specific action commands from AI response and trigger corresponding actions
 * @param {string} response - Raw response from the AI
 * @param {boolean} trackingActive - Current tracking state
 * @param {function} handlers - Object containing handler functions
 * @returns {string} - Cleaned response with action commands removed
 */
export const processActionCommands = (
  response: string,
  trackingActive: boolean,
  handlers: {
    startTracking: () => void,
    stopTracking: () => void,
    setTrackingActive: (active: boolean) => void
  }
): string => {
  let cleanedResponse = response;
  const { startTracking, stopTracking, setTrackingActive } = handlers;

  // Process START_TRACKING command
  if (cleanedResponse.includes(ACTION_COMMANDS.START_TRACKING)) {
    if (!trackingActive) {
      startTracking();
      setTrackingActive(true);
      toast.success(MESSAGES.TRACKING_STARTED);
    }
    cleanedResponse = cleanedResponse.replace(new RegExp(ACTION_COMMANDS.START_TRACKING, 'g'), '');
  } 
  
  // Process STOP_TRACKING command
  if (cleanedResponse.includes(ACTION_COMMANDS.STOP_TRACKING)) {
    if (trackingActive) {
      stopTracking();
      setTrackingActive(false);
      toast.info(MESSAGES.TRACKING_STOPPED);
    }
    cleanedResponse = cleanedResponse.replace(new RegExp(ACTION_COMMANDS.STOP_TRACKING, 'g'), '');
  } 
  
  // Process WEATHER_INFO command
  if (cleanedResponse.includes(ACTION_COMMANDS.WEATHER_INFO)) {
    toast.info(MESSAGES.WEATHER_INFO);
    cleanedResponse = cleanedResponse.replace(new RegExp(ACTION_COMMANDS.WEATHER_INFO, 'g'), '');
  } 
  
  // Process FIELD_INFO command
  const fieldNameMatch = cleanedResponse.match(ACTION_COMMANDS.FIELD_INFO_PATTERN);
  if (fieldNameMatch && fieldNameMatch[1]) {
    const fieldName = fieldNameMatch[1].trim();
    toast.info(MESSAGES.FIELD_INFO(fieldName));
    cleanedResponse = cleanedResponse.replace(ACTION_COMMANDS.FIELD_INFO_REPLACE, '');
  }

  return cleanedResponse.trim();
};

/**
 * Formats messages for the Claude API
 * @param {ChatMessage[]} messages - Array of chat messages 
 * @param {ChatMessage} userMessage - Latest user message
 * @returns {Array} - Formatted messages for Claude API
 */
const formatMessagesForClaude = (messages: ChatMessage[], userMessage: ChatMessage) => {
  return messages
    .filter(msg => msg.id !== '1') // Filter out welcome message
    .concat(userMessage)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
};

/**
 * Prepares context data to be sent to Claude
 * @param {boolean} enableContext - Whether to include context
 * @param {any} contextData - Raw context data 
 * @param {AISettings} aiSettings - AI configuration settings
 * @returns {object|null} - Formatted context or null if context disabled
 */
const prepareContextData = (enableContext: boolean, contextData: ContextData, trackingActive: boolean) => {
  if (!enableContext) return null;
  
  const { model, temperature } = getAISettings();
  
  return {
    trackingActive,
    position: contextData.currentPosition,
    fields: contextData.fields?.slice(0, 5), // Limit to 5 fields
    equipment: contextData.equipment?.slice(0, 5), // Limit to 5 equipment
    activeSession: contextData.activeSession,
    model,
    temperature,
    maxTokens: 1000,
    // Weather data
    weather: {
      current: contextData.weather?.current || "Ensoleillé, 22°C",
      forecast: contextData.weather?.forecast || "Journée ensoleillée avec quelques nuages l'après-midi. Température entre 18°C et 25°C."
    }
  };
};

/**
 * Extract the response content from Claude API response
 * @param {any} data - API response data
 * @returns {string} - Extracted response text
 */
const extractResponseContent = (data: any): string => {
  // Check if data has expected structure
  if (!data || !data.content) {
    // Handle API error responses
    if (data && data.error) {
      console.error('Erreur API Claude:', data.error);
      throw new Error(MESSAGES.API_ERROR(data.error.message || data.error.type || 'Erreur inconnue'));
    }
    
    // If no specific error but unexpected response format
    console.error('Réponse Claude non valide:', data);
    throw new Error(MESSAGES.INVALID_RESPONSE);
  }

  // Safely extract the response content
  return data.content && Array.isArray(data.content) && data.content.length > 0 
    ? data.content[0].text 
    : MESSAGES.FALLBACK_RESPONSE;
};

/**
 * Send a message to Claude API and process its response
 * @param {ChatMessage[]} messages - Previous chat messages
 * @param {ChatMessage} userMessage - Latest user message
 * @param {any} contextData - Context data for the conversation
 * @param {boolean} trackingActive - Current tracking state
 * @param {function} handlers - Object containing handler functions
 * @returns {Promise<string>} - Processed response from Claude
 */
export const sendMessageToClaude = async (
  messages: ChatMessage[],
  userMessage: ChatMessage,
  contextData: ContextData,
  trackingActive: boolean,
  startTracking: () => void,
  stopTracking: () => void,
  setTrackingActive: (active: boolean) => void
): Promise<string> => {
  const handlers = { startTracking, stopTracking, setTrackingActive };
  
  try {
    // Get AI settings 
    const { enableContext } = getAISettings();
    
    // Format messages for Anthropic
    const formattedMessages = formatMessagesForClaude(messages, userMessage);

    // Prepare context data to send to Claude
    const contextDataToSend = prepareContextData(enableContext, contextData, trackingActive);

    // Call Supabase Edge Function with retry capability
    const maxRetries = 2;
    let retries = 0;
    let data, error;

    while (retries <= maxRetries) {
      try {
        const response = await supabase.functions.invoke('anthropic-chat', {
          body: {
            messages: formattedMessages,
            systemPrompt: SYSTEM_PROMPTS.AGRICULTURAL_ASSISTANT,
            contextData: contextDataToSend
          }
        });
        
        data = response.data;
        error = response.error;
        
        if (!error) break; // Success, exit retry loop
        
        retries++;
        // Wait before retrying (exponential backoff: 500ms, 1000ms)
        if (retries <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500 * retries));
        }
      } catch (err) {
        // Network or unexpected error
        retries++;
        if (retries > maxRetries) throw err;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500 * retries));
      }
    }

    if (error) {
      throw new Error(error.message || MESSAGES.CONNECTION_ERROR);
    }

    // Extract response content
    const assistantResponse = extractResponseContent(data);
    
    // Process action commands in response
    const cleanedResponse = processActionCommands(
      assistantResponse,
      trackingActive,
      handlers
    );

    return cleanedResponse;
  } catch (error) {
    console.error('Erreur lors de la communication avec Claude:', error);
    
    // Return a user-friendly error message based on the type of error
    if (error instanceof Error) {
      // Use the error message if it's already formatted
      if (error.message.includes('Erreur API Claude') || 
          error.message === MESSAGES.INVALID_RESPONSE) {
        throw error;
      }
      
      // Network or unexpected error
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError')) {
        throw new Error(MESSAGES.CONNECTION_ERROR);
      }
      
      throw new Error(`Erreur: ${error.message}`);
    }
    
    // Fallback for unknown error types
    throw new Error('Une erreur inattendue est survenue. Veuillez réessayer.');
  }
};

/**
 * Generate a context-aware prompt based on user input and available context
 * @param {string} userInput - User's raw input text
 * @param {ContextData} contextData - Available context data
 * @returns {string} - Enhanced prompt with contextual information
 */
export const generateContextAwarePrompt = (userInput: string, contextData: ContextData): string => {
  let enhancedPrompt = userInput;
  
  // Add location context if available
  if (contextData.currentPosition) {
    const { lat, lng } = contextData.currentPosition;
    enhancedPrompt += `\n\nMa position actuelle: [${lat.toFixed(5)}, ${lng.toFixed(5)}]`;
  }
  
  // Add active field context if present
  if (contextData.activeField) {
    enhancedPrompt += `\n\nJe suis actuellement sur le champ: ${contextData.activeField.name}`;
  }
  
  // Add weather context if available
  if (contextData.weather?.current) {
    enhancedPrompt += `\n\nConditions météo actuelles: ${contextData.weather.current}`;
  }
  
  return enhancedPrompt;
};
