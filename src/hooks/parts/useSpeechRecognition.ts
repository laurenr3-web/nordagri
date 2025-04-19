
import { useState, useEffect } from 'react';

// Define the window interface to include Speech Recognition
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

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
  const windowWithSpeechRecognition = window as WindowWithSpeechRecognition;
  const browserSupportsSpeechRecognition = typeof window !== 'undefined' && 
    !!(windowWithSpeechRecognition.SpeechRecognition || windowWithSpeechRecognition.webkitSpeechRecognition);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Votre navigateur ne supporte pas la reconnaissance vocale.');
      return;
    }

    // Get the appropriate constructor
    const SpeechRecognitionConstructor = windowWithSpeechRecognition.SpeechRecognition || 
      windowWithSpeechRecognition.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      const recognitionInstance = new SpeechRecognitionConstructor() as SpeechRecognitionInstance;
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'fr-FR';
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let transcriptText = '';
        // Process results properly
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result[0]) {
            transcriptText += result[0].transcript;
          }
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
