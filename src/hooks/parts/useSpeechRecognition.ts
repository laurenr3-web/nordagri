
import { useState, useEffect } from 'react';

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
  const [recognition, setRecognition] = useState<any>(null);

  // Vérifier si le navigateur supporte la reconnaissance vocale
  const browserSupportsSpeechRecognition = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Votre navigateur ne supporte pas la reconnaissance vocale.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'fr-FR';
    
    recognitionInstance.onresult = (event: any) => {
      const transcriptResult = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setTranscript(transcriptResult);
    };
    
    recognitionInstance.onerror = (event: any) => {
      setError(`Erreur de reconnaissance vocale: ${event.error}`);
      setIsListening(false);
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
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
    browserSupportsSpeechRecognition: !!browserSupportsSpeechRecognition
  };
};

export default useSpeechRecognition;
