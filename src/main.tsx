
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize theme from localStorage
const initializeTheme = () => {
  const darkMode = localStorage.getItem('darkMode');
  const highContrast = localStorage.getItem('highContrast') === 'true';
  const reduceMotion = localStorage.getItem('animations') === 'false';
  
  // Seulement ajouter la classe dark si darkMode est explicitement "true"
  if (darkMode === 'true') {
    document.documentElement.classList.add('dark');
  } else if (darkMode === 'false') {
    // S'assurer d'enlever la classe si darkMode est explicitement à "false"
    document.documentElement.classList.remove('dark');
  }
  
  if (highContrast) {
    document.documentElement.classList.add('high-contrast');
  }
  
  if (reduceMotion) {
    document.documentElement.classList.add('reduce-motion');
  }
};

// Run theme initialization
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
