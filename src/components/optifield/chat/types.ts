
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
