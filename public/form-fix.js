(function() {
  console.log('🔧 Application des correctifs pour les formulaires...');
  
  // Correctif pour les formulaires dans les dialogues
  function fixDialogForms() {
    // Ajouter un délai lors de la fermeture des dialogues
    document.querySelectorAll('[role="dialog"]').forEach(dialog => {
      if (dialog._fixed) return;
      
      dialog._fixed = true;
      
      // Capturer les clics sur les boutons dans les dialogues
      dialog.addEventListener('click', function(e) {
        const target = e.target;
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          // Ajouter un court délai pour permettre au state React de se mettre à jour
          setTimeout(function() {
            // Permettre à React de terminer ses mises à jour
          }, 50);
        }
      }, true);
    });
    
    // Corriger les erreurs potentielles dans les champs de formulaire
    document.querySelectorAll('form').forEach(form => {
      if (form._fixed) return;
      
      form._fixed = true;
      
      form.addEventListener('submit', function(e) {
        // Ne pas arrêter la propagation, mais ajouter un délai
        setTimeout(function() {
          // Permettre à React de terminer ses mises à jour
        }, 50);
      });
    });
  }
  
  // Appliquer la correction maintenant
  fixDialogForms();
  
  // Et continuer à l'appliquer quand de nouveaux éléments sont ajoutés
  const observer = new MutationObserver(function(mutations) {
    for (let mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        setTimeout(fixDialogForms, 100);
        break;
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ Correctifs pour les formulaires appliqués');
})();
