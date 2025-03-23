
import { AISettings } from '../types';

export const getAISettings = (): AISettings => {
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
