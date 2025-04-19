
import { useState, useEffect } from 'react';

// Defining proper interfaces for the Web Speech API
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionError {
  error: string;
}

// Declare global interfaces for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
}

/**
 * Hook pour utiliser la reconnaissance vocale dans le navigateur
 * Note: Cette fonctionnalité n'est pas supportée par tous les navigateurs
 */
export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);

  // Vérifier si le navigateur supporte la reconnaissance vocale
  const browserSupportsSpeechRecognition = typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Votre navigateur ne supporte pas la reconnaissance vocale.');
      return;
    }

    // Get the appropriate constructor
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      const recognitionInstance = new SpeechRecognitionConstructor();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'fr-FR';
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let transcriptText = '';
        // Process results properly
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          transcriptText += transcript;
        }
        setTranscript(transcriptText);
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionError) => {
        setError(`Erreur de reconnaissance vocale: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [browserSupportsSpeechRecognition]);

  const startListening = () => {
    setError(null);
    if (!recognition) return;
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Erreur lors du démarrage de la reconnaissance vocale:", err);
      setError('Impossible de démarrer la reconnaissance vocale.');
    }
  };

  const stopListening = () => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setIsListening(false);
    } catch (err) {
      console.error("Erreur lors de l'arrêt de la reconnaissance vocale:", err);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
};

export default useSpeechRecognition;
