
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

// Enregistrer le service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker enregistré:', registration);
      })
      .catch((error) => {
        console.error('Erreur Service Worker:', error);
      });
  });
}

// Run theme initialization
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
