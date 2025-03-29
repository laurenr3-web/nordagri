
// Script de réparation pour l'accessibilité et l'interactivité des boutons
(function() {
  console.log("🔧 Script de réparation des boutons en cours d'exécution...");
  
  // Fonction pour réparer tous les boutons
  function fixAllButtons() {
    // Sélectionner tous les boutons sans attribut 'title'
    const buttons = document.querySelectorAll('button:not([title])');
    
    buttons.forEach(button => {
      // Ajouter un titre basé sur le texte du bouton ou un titre générique
      let buttonText = button.textContent?.trim() || "";
      if (buttonText === "" && button.querySelector("svg")) {
        // Si c'est un bouton avec uniquement une icône
        const ariaLabel = button.getAttribute('aria-label');
        buttonText = ariaLabel || "Bouton avec icône";
      }
      button.setAttribute('title', buttonText || "Bouton");
      
      // Fixer les problèmes d'accessibilité
      if (!button.getAttribute('aria-label') && buttonText) {
        button.setAttribute('aria-label', buttonText);
      }
    });
    
    // Rendre tous les éléments de formulaire sélectionnables
    const formElements = document.querySelectorAll('input, textarea, select');
    formElements.forEach(el => {
      el.classList.add('selectable-text');
    });
    
    // Ajout d'attributs pour améliorer l'accessibilité des éléments interactifs
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], [role="tab"]');
    interactiveElements.forEach(el => {
      if (!el.getAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });
    
    console.log(`✅ Accessibilité améliorée: ${buttons.length} boutons réparés`);
  }
  
  // S'assurer que tous les clics fonctionnent correctement
  function improveClickEvents() {
    // Cibler les éléments problématiques connus
    const elements = document.querySelectorAll('button, [role="button"], select, input[type="checkbox"], input[type="radio"]');
    
    elements.forEach(el => {
      // Vérifier si l'élément n'a pas déjà été traité
      if (!el.hasAttribute('data-click-fixed')) {
        el.setAttribute('data-click-fixed', 'true');
        
        // Capturer les clics en phase de capture
        el.addEventListener('click', (e) => {
          // Empêcher la propagation du clic aux parents
          e.stopPropagation();
        }, true);
      }
    });
  }
  
  // Exécuter au chargement initial
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      fixAllButtons();
      improveClickEvents();
    });
  } else {
    fixAllButtons();
    improveClickEvents();
  }
  
  // Réexécuter périodiquement pour les nouveaux éléments
  setInterval(fixAllButtons, 3000);
  setInterval(improveClickEvents, 3000);
})();
