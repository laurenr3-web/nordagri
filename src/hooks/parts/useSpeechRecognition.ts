
import { useState, useEffect } from 'react';

// Define the interface for the window with speech recognition
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Check if speech recognition is available in this browser
  const isSpeechRecognitionSupported = (): boolean => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  };

  // Get the appropriate speech recognition constructor
  const getSpeechRecognition = (): any => {
    // Cast window to our extended type
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    return windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
  };
  
  const startListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    
    try {
      const SpeechRecognitionConstructor = getSpeechRecognition();
      const recognition = new SpeechRecognitionConstructor();
      
      recognition.continuous = false;
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
      };
      
      recognition.onerror = (event: any) => {
        setError(`Error occurred: ${event.error}`);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      
      // Store recognition instance for cleanup
      return recognition;
    } catch (err) {
      setError('Failed to initialize speech recognition');
      setIsListening(false);
      console.error('Speech recognition error:', err);
      return null;
    }
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    isSupported: isSpeechRecognitionSupported(),
  };
};
