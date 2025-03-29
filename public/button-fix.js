
(function() {
  console.log('🔄 Initialisation du correctif pour les boutons...');
  
  // Observer to watch for button elements being added to the DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            const buttons = node.querySelectorAll('button, [role="button"]');
            buttons.forEach(button => {
              if (!button.getAttribute('data-button-fixed')) {
                button.setAttribute('data-button-fixed', 'true');
                
                // Create a wrapper for the original click handler
                const originalOnClick = button.onclick;
                button.onclick = function(e) {
                  console.log('Button clicked:', button.textContent?.trim());
                  
                  // Prevent default to avoid double triggers
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Use timeout to avoid React DOM manipulation errors
                  setTimeout(() => {
                    if (originalOnClick) {
                      const result = originalOnClick.call(this, e);
                      return result;
                    }
                  }, 10);
                };
              }
            });
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ Correctif pour les boutons initialisé');
})();
