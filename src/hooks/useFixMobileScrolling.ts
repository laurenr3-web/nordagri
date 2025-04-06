import { useEffect } from 'react';

/**
 * Hook pour corriger les problèmes de défilement sur mobile dans les dialogues
 * 
 * Ce hook peut être ajouté au layout principal pour appliquer automatiquement
 * la correction à tous les dialogues existants sans avoir à les modifier
 */
export function useFixMobileScrolling() {
  useEffect(() => {
    // Fonction pour permettre le défilement dans les dialogues/modales sur mobile
    const fixMobileScrolling = () => {
      // Sélectionner tous les contenus de dialogue
      const dialogContents = document.querySelectorAll('[role="dialog"] > div');
      
      dialogContents.forEach(dialog => {
        if (dialog instanceof HTMLElement) {
          // Vérifier si le style n'a pas déjà été appliqué
          if (dialog.style.maxHeight !== '80vh') {
            console.log('Fixing mobile scrolling for dialog:', dialog);
            
            // Appliquer les styles pour permettre le défilement
            dialog.style.maxHeight = '80vh';
            dialog.style.overflowY = 'auto';
            dialog.style.WebkitOverflowScrolling = 'touch';
            
            // Ajouter un padding en bas pour éviter que le dernier élément soit caché
            const currentPadding = window.getComputedStyle(dialog).paddingBottom;
            const paddingValue = parseInt(currentPadding);
            if (!isNaN(paddingValue) && paddingValue < 20) {
              dialog.style.paddingBottom = '20px';
            }
          }
        }
      });
    };
    
    // Appliquer le correctif lors du montage du composant
    fixMobileScrolling();
    
    // Observer le DOM pour détecter l'ouverture de nouvelles modales
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // Appliquer le correctif avec un léger délai pour s'assurer que le DOM est complètement chargé
          setTimeout(fixMobileScrolling, 100);
        }
      });
    });
    
    // Démarrer l'observation du body
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Nettoyer l'observateur lors du démontage du composant
    return () => observer.disconnect();
  }, []);
}

export default useFixMobileScrolling;
