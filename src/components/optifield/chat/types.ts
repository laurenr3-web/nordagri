
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

export interface AISettings {
  model: string;
  temperature: number;
  enableContext: boolean;
}

export interface ContextData {
  currentPosition?: { lat: number; lng: number };
  fields?: Array<any>;
  equipment?: Array<any>;
  activeSession?: any;
  activeField?: { name: string; [key: string]: any };
  weather?: {
    current?: string;
    forecast?: string;
  };
}

export type ActionCommand = 
  | '[ACTION:START_TRACKING]' 
  | '[ACTION:STOP_TRACKING]' 
  | '[ACTION:WEATHER_INFO]' 
  | string; // Pour les commandes dynamiques comme FIELD_INFO
