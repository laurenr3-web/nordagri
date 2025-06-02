
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { productionConfig } from '@/config/productionConfig';

// Initialize theme from localStorage
const initializeTheme = () => {
  try {
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
  } catch (error) {
    console.warn('Erreur initialisation thème:', error);
  }
};

// Enhanced service worker registration for nordagri.ca
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker enregistré:', registration);
        
        // Vérifier les mises à jour plus fréquemment sur nordagri.ca
        if (productionConfig.currentDomain === 'nordagri.ca') {
          setInterval(() => {
            registration.update();
          }, 30000); // Vérifier toutes les 30 secondes
        }
      })
      .catch((error) => {
        console.error('Erreur Service Worker:', error);
      });
  });
}

// Enhanced error handling for nordagri.ca
window.addEventListener('error', (event) => {
  console.error('Erreur globale capturée:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    domain: productionConfig.currentDomain,
    timestamp: new Date().toISOString()
  });
  
  // Log spécial pour nordagri.ca
  if (productionConfig.currentDomain === 'nordagri.ca') {
    console.error('🚨 Erreur critique sur nordagri.ca:', event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejetée non gérée:', {
    reason: event.reason,
    domain: productionConfig.currentDomain,
    timestamp: new Date().toISOString()
  });
});

// Log de démarrage pour nordagri.ca
if (productionConfig.currentDomain === 'nordagri.ca') {
  console.log('🚀 Démarrage OptiTractor sur nordagri.ca:', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    config: productionConfig
  });
}

// Run theme initialization
try {
  initializeTheme();
} catch (error) {
  console.warn('Erreur lors de l\'initialisation du thème:', error);
}

// Enhanced root creation with error handling
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Element root non trouvé');
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  if (productionConfig.currentDomain === 'nordagri.ca') {
    console.log('✅ OptiTractor initialisé avec succès sur nordagri.ca');
  }
} catch (error) {
  console.error('❌ Erreur critique lors de l\'initialisation:', error);
  
  // Fallback d'urgence pour nordagri.ca
  document.body.innerHTML = `
    <div style="display: flex; items-center: justify-center; min-height: 100vh; padding: 20px;">
      <div style="text-align: center; max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">Erreur de chargement</h1>
        <p style="margin-bottom: 16px;">OptiTractor rencontre des difficultés techniques.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
          Recharger la page
        </button>
        <details style="margin-top: 16px; text-align: left;">
          <summary>Détails techniques</summary>
          <pre style="background: #f3f4f6; padding: 8px; border-radius: 4px; overflow: auto; font-size: 12px;">${error.message || 'Erreur inconnue'}</pre>
        </details>
      </div>
    </div>
  `;
}
