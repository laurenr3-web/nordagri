
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize theme from localStorage
const initializeTheme = () => {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  const highContrast = localStorage.getItem('highContrast') === 'true';
  const reduceMotion = localStorage.getItem('animations') === 'false';
  
  if (darkMode) {
    document.documentElement.classList.add('dark');
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
