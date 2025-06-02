
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

// Configuration de production améliorée
const isProduction = import.meta.env.PROD;

// Diagnostic de configuration en production
if (isProduction) {
  console.log('NordAgri - Mode Production');
  console.log('Variables d\'environnement:', {
    SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    PERPLEXITY_KEY: !!import.meta.env.VITE_PERPLEXITY_API_KEY
  });
}

// Enregistrer le service worker seulement en production et avec vérification
if ('serviceWorker' in navigator && isProduction) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker enregistré:', registration);
      })
      .catch((error) => {
        console.error('Erreur Service Worker:', error);
        // En cas d'erreur du SW, ne pas bloquer l'application
      });
  });
} else if (!isProduction) {
  console.log('Service Worker désactivé en développement');
}

// Gestion d'erreur globale pour les erreurs non capturées
window.addEventListener('error', (event) => {
  console.error('Erreur globale capturée:', event.error);
  
  // Si c'est une erreur de configuration critique, afficher un message
  if (event.error?.message?.includes('Configuration') || 
      event.error?.message?.includes('Variables')) {
    console.error('Erreur de configuration critique détectée');
  }
});

// Gestion d'erreur pour les promesses rejetées
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesse rejetée non gérée:', event.reason);
  
  // Empêcher que l'erreur remonte et cause une page blanche
  if (event.reason?.message?.includes('Configuration') || 
      event.reason?.message?.includes('Variables')) {
    event.preventDefault();
    console.error('Erreur de configuration gérée, empêchant la page blanche');
  }
});

// Run theme initialization
initializeTheme();

// Initialisation robuste de l'application
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Element root non trouvé');
  }
  
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Erreur lors de l\'initialisation de l\'application:', error);
  
  // Fallback d'urgence - afficher un message d'erreur dans le DOM
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        max-width: 500px;
        text-align: center;
      ">
        <h1 style="color: #dc2626; margin-bottom: 20px;">Erreur de chargement</h1>
        <p style="margin-bottom: 20px; color: #666;">
          L'application ne peut pas se charger correctement.
        </p>
        <p style="margin-bottom: 30px; color: #666;">
          Veuillez vérifier que les variables d'environnement sont configurées sur votre plateforme d'hébergement.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          Recharger la page
        </button>
      </div>
    </div>
  `;
}
