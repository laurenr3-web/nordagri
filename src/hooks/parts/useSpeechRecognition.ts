
import { useState, useEffect, useCallback } from 'react';

// Define type for window with SpeechRecognition
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    try {
      const windowWithSpeech = window as WindowWithSpeechRecognition;
      const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'fr-FR';
        
        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          setTranscript(transcriptResult);
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setError(event.error);
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          if (isListening) {
            try {
              recognitionInstance.start();
            } catch (e) {
              console.error('Error restarting recognition:', e);
            }
          }
        };
        
        setRecognition(recognitionInstance);
      } else {
        setError("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setError("Erreur lors de l'initialisation de la reconnaissance vocale.");
    }
    
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
        setError(null);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setError("Erreur lors du démarrage de la reconnaissance vocale.");
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported: !!recognition
  };
};

export default useSpeechRecognition;
