
// Script de réparation spécifique pour les composants Radix UI et boutons désactivés
(function() {
  console.log("🛠️ Réparation des composants Radix UI et des boutons désactivés...");
  
  function fixRadixComponents() {
    // 1. Réparer les boutons Radix UI bloqués
    document.querySelectorAll('[id^="radix-"],[data-state="closed"]').forEach(element => {
      // Ne pas retraiter les éléments déjà corrigés
      if (element.hasAttribute('data-radix-fixed')) return;
      
      // Marquer comme corrigé
      element.setAttribute('data-radix-fixed', 'true');
      
      // S'assurer que le bouton peut recevoir des clics
      element.style.pointerEvents = 'auto';
      
      // Ajouter un gestionnaire d'événements direct
      element.addEventListener('click', function(e) {
        console.log("Clic sur élément Radix:", this);
        
        // Simuler le comportement attendu manuellement
        const targetId = this.getAttribute('aria-controls');
        if (targetId) {
          const target = document.getElementById(targetId);
          if (target) {
            if (target.style.display === 'none') {
              target.style.display = 'block';
              this.setAttribute('aria-expanded', 'true');
              this.setAttribute('data-state', 'open');
            } else {
              target.style.display = 'none';
              this.setAttribute('aria-expanded', 'false');
              this.setAttribute('data-state', 'closed');
            }
          }
        }
      });
    });
    
    // 2. Réactiver les boutons submit désactivés
    document.querySelectorAll('button[disabled]').forEach(button => {
      // Ne pas retraiter les éléments déjà corrigés
      if (button.hasAttribute('data-button-fixed')) return;
      
      // Marquer comme corrigé
      button.setAttribute('data-button-fixed', 'true');
      
      // Enlever l'attribut disabled
      button.removeAttribute('disabled');
      
      // Enlever les classes CSS qui le rendent visuellement désactivé
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      
      // Ajouter une classe pour indiquer qu'il a été réparé
      button.classList.add('fixed-button');
      
      // Ajouter un gestionnaire d'événements pour simuler la soumission
      button.addEventListener('click', function(e) {
        console.log("Clic sur bouton réactivé:", this);
        const form = this.closest('form');
        if (form) {
          console.log("Tentative de soumission du formulaire:", form);
          form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
        }
      });
    });
  }
  
  // Exécuter après le chargement complet
  if (document.readyState === 'complete') {
    fixRadixComponents();
  } else {
    window.addEventListener('load', fixRadixComponents);
  }
  
  // Exécuter périodiquement pour capturer les nouveaux éléments
  setInterval(fixRadixComponents, 2000);
})();
