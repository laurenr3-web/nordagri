
(function() {
  console.log('🔄 Initialisation du correctif pour Radix UI...');
  
  // Observer to watch for dialog elements being added to the DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            // Find dialog triggers and ensure they work
            const triggers = node.querySelectorAll('[data-state="closed"]');
            triggers.forEach(trigger => {
              if (!trigger.getAttribute('data-fixed')) {
                trigger.setAttribute('data-fixed', 'true');
                
                // Add a parallel click handler
                trigger.addEventListener('click', function(e) {
                  console.log('Dialog trigger clicked:', trigger);
                  // Let the original event flow but ensure state changes
                  setTimeout(() => {
                    if (trigger.getAttribute('data-state') === 'closed') {
                      console.log('Dialog still closed after click, forcing open');
                      // Try to force open if still closed
                      const openEvent = new CustomEvent('openchange', { detail: { open: true } });
                      trigger.dispatchEvent(openEvent);
                    }
                  }, 50);
                });
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
  
  console.log('✅ Correctif pour Radix UI initialisé');
})();
