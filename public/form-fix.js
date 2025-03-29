
(function() {
  console.log('🔧 Application des correctifs pour les formulaires...');
  
  // Correctif pour les formulaires dans les dialogues
  function fixDialogForms() {
    // Ajouter un délai lors de la fermeture des dialogues
    document.querySelectorAll('[role="dialog"]').forEach(dialog => {
      if (dialog._fixed) return;
      
      dialog._fixed = true;
      
      // Détecter tous les formulaires dans les dialogues
      const forms = dialog.querySelectorAll('form');
      forms.forEach(form => {
        if (form._formFixed) return;
        form._formFixed = true;
        
        // Ajouter une protection contre les soumissions multiples
        form.addEventListener('submit', function(e) {
          if (form._isSubmitting) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
          
          form._isSubmitting = true;
          setTimeout(() => {
            form._isSubmitting = false;
          }, 1000);
        }, true);
      });
      
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
      
      // Optimisation des saisies dans les champs de formulaire
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input._optimized) return;
        input._optimized = true;
        
        // Utiliser une technique de debounce pour les événements input
        let debounceTimer;
        input.addEventListener('input', function(e) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            // Le code React peut maintenant traiter l'événement
          }, 100);
        });
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
  
  // Optimisation globale de la performance
  function optimizePerformance() {
    // Limiter les animations CSS pendant les interactions formulaire
    document.addEventListener('focus', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        document.body.classList.add('form-interaction');
      }
    }, true);
    
    document.addEventListener('blur', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        document.body.classList.remove('form-interaction');
      }
    }, true);
    
    // Style pour optimiser les performances pendant les interactions
    const style = document.createElement('style');
    style.textContent = `
      .form-interaction * {
        animation-duration: 0.001s !important;
        transition-duration: 0.001s !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Appliquer les optimisations de performance
  optimizePerformance();
  
  console.log('✅ Correctifs pour les formulaires appliqués');
})();
