
(function() {
  console.log('🔄 Initialisation du correctif pour les boutons...');
  
  // Observer to watch for button elements being added to the DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            // Fix all buttons in this node and its children
            fixButtons(node);
          }
        });
      }
    });
  });
  
  function fixButtons(container) {
    const buttons = container.querySelectorAll('button, [role="button"]');
    buttons.forEach(button => {
      if (!button.getAttribute('data-button-fixed')) {
        button.setAttribute('data-button-fixed', 'true');
        
        // Add parallel event handler
        button.addEventListener('click', function(e) {
          console.log('🖱️ Clic capturé sur', button);
          
          // Only prevent default if it's not a native button
          if (button.getAttribute('role') === 'button' && button.tagName !== 'BUTTON') {
            e.preventDefault();
          }
          
          // For buttons that trigger dialogs
          setTimeout(() => {
            // Check for any nearby dialog trigger elements
            const dialogTriggers = document.querySelectorAll('[data-state="closed"]');
            dialogTriggers.forEach(trigger => {
              if (trigger.getAttribute('data-state') === 'closed') {
                // Force click on dialog trigger if it's nearby or related
                if (button.contains(trigger) || trigger.contains(button)) {
                  console.log('Forçage de l\'ouverture du dialogue associé');
                  trigger.click();
                }
              }
            });
          }, 50);
        });
      }
    });
  }
  
  // Initial fix for existing buttons
  fixButtons(document);
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Periodically check for unfixed buttons
  setInterval(() => {
    fixButtons(document);
  }, 2000);
  
  console.log('✅ Correctif pour les boutons initialisé');
})();
