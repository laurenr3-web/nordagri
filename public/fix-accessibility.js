
// Script de correction des problèmes d'accessibilité
(function() {
  console.log("🔧 Correction des problèmes d'accessibilité en cours...");
  
  function fixAccessibilityIssues() {
    // 1. Corriger les boutons sans attribut title
    document.querySelectorAll('button:not([title])').forEach(button => {
      // Extraire le texte du bouton ou utiliser une valeur par défaut
      const buttonText = button.textContent?.trim() || 
                        button.getAttribute('aria-label') ||
                        "Action";
      
      // Ajouter l'attribut title
      button.setAttribute('title', buttonText);
      
      // Ajouter également aria-label si manquant
      if (!button.hasAttribute('aria-label')) {
        button.setAttribute('aria-label', buttonText);
      }
    });
    
    // 2. Corriger les éléments avec role="button" sans title
    document.querySelectorAll('[role="button"]:not([title])').forEach(elem => {
      const elemText = elem.textContent?.trim() || "Action";
      elem.setAttribute('title', elemText);
      
      if (!elem.hasAttribute('aria-label')) {
        elem.setAttribute('aria-label', elemText);
      }
    });
    
    // 3. Corriger les éléments de formulaire sans label accessible
    document.querySelectorAll('input:not([aria-label]):not([title]), textarea:not([aria-label]):not([title])').forEach(input => {
      const inputType = input.type || "text";
      const inputId = input.id || "";
      const inputName = input.name || "";
      
      // Si l'élément a un id et qu'il existe un label qui le cible, ne rien faire
      if (inputId && document.querySelector(`label[for="${inputId}"]`)) {
        return;
      }
      
      // Créer un label descriptif
      const labelText = inputId || inputName || `Champ ${inputType}`;
      
      // Ajouter des attributs d'accessibilité
      input.setAttribute('aria-label', labelText);
      
      // Ajouter un placeholder seulement si c'est un champ de texte et qu'il n'en a pas déjà un
      if ((inputType === 'text' || inputType === 'search' || inputType === 'email' || inputType === 'url' || inputType === 'tel' || inputType === 'number' || inputType === 'password') && !input.hasAttribute('placeholder')) {
        input.setAttribute('placeholder', labelText);
      }
    });
    
    // 4. Corriger les iframes sans titre
    document.querySelectorAll('iframe:not([title])').forEach(frame => {
      frame.setAttribute('title', 'Contenu intégré');
    });
    
    // 5. Assurer que tous les élements cliquables ont un rôle approprié
    document.querySelectorAll('div[onclick], span[onclick]').forEach(elem => {
      if (!elem.hasAttribute('role')) {
        elem.setAttribute('role', 'button');
      }
      
      // Rendre l'élément focusable s'il ne l'est pas déjà
      if (!elem.hasAttribute('tabindex')) {
        elem.setAttribute('tabindex', '0');
      }
    });
    
    // 6. Ajouter de l'aide contextuelle aux formulaires
    document.querySelectorAll('form').forEach(form => {
      if (!form.hasAttribute('aria-describedby')) {
        // Chercher des messages d'erreur ou d'aide
        const helpTexts = form.querySelectorAll('.text-destructive, .error-message, .help-text');
        
        if (helpTexts.length > 0) {
          // S'assurer que chaque élément d'aide a un ID
          helpTexts.forEach((help, index) => {
            if (!help.id) {
              help.id = `form-help-${Math.random().toString(36).substring(2, 9)}`;
            }
          });
          
          // Collecter les IDs
          const helpIds = Array.from(helpTexts).map(help => help.id).join(' ');
          form.setAttribute('aria-describedby', helpIds);
        }
      }
    });
  }
  
  // Exécuter immédiatement
  fixAccessibilityIssues();
  
  // Réexécuter quand le DOM change
  const observer = new MutationObserver(function(mutations) {
    fixAccessibilityIssues();
  });
  
  // Observer les changements dans tout le document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  
  // Également réexécuter périodiquement pour les cas où l'observation pourrait manquer
  setInterval(fixAccessibilityIssues, 3000);
  
  // Ajouter un message dans la console pour confirmer
  console.log("✅ Corrections d'accessibilité installées et en cours d'exécution");
})();
