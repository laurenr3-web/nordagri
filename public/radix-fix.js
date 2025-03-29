
(function() {
  console.log('🔄 Initialisation du correctif pour Radix UI...');
  
  // Tracking state for dialogs
  const dialogStates = new Map();
  
  // Observer to watch for dialog elements being added to the DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            // Fix dialog triggers
            fixDialogTriggers(node);
            
            // Fix dialog content
            fixDialogContent(node);
          }
        });
      }
    });
  });
  
  function fixDialogTriggers(container) {
    // Find dialog triggers and ensure they work
    const triggers = container.querySelectorAll('[data-state]');
    triggers.forEach(trigger => {
      if (!trigger.getAttribute('data-radix-fixed')) {
        trigger.setAttribute('data-radix-fixed', 'true');
        
        // Track dialog state changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-state') {
              const newState = trigger.getAttribute('data-state');
              console.log('Dialog state changed:', newState, 'for', trigger);
              dialogStates.set(trigger, newState);
            }
          });
        });
        
        observer.observe(trigger, { attributes: true });
        
        // Add a parallel click handler for dialog triggers
        if (trigger.getAttribute('data-state') === 'closed') {
          trigger.addEventListener('click', function(e) {
            console.log('Dialog trigger clicked:', trigger);
            
            // Don't interfere with the native click, just enhance it
            setTimeout(() => {
              if (trigger.getAttribute('data-state') === 'closed') {
                console.log('Dialog still closed after click, forcing open');
                // Try to force open if still closed
                // For Radix dialogs
                const event = new CustomEvent('openChange', { detail: { open: true } });
                trigger.dispatchEvent(event);
                
                // For shadcn/ui dialog
                const content = document.querySelector('[role="dialog"]');
                if (content && !content.classList.contains('data-[state=open]:animate-in')) {
                  content.classList.add('data-[state=open]:animate-in');
                  content.setAttribute('data-state', 'open');
                }
              }
            }, 100);
          });
        }
      }
    });
  }
  
  function fixDialogContent(container) {
    // Fix dialog content
    const dialogContent = container.querySelectorAll('[role="dialog"]');
    dialogContent.forEach(content => {
      if (!content.getAttribute('data-radix-fixed')) {
        content.setAttribute('data-radix-fixed', 'true');
        
        // Ensure dialog has high z-index
        if (parseInt(getComputedStyle(content).zIndex) < 50) {
          content.style.zIndex = '9999';
        }
        
        // Ensure dialog has a background
        const bg = getComputedStyle(content).backgroundColor;
        if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
          content.style.backgroundColor = 'var(--background, white)';
        }
      }
    });
  }
  
  // Fix existing elements
  fixDialogTriggers(document);
  fixDialogContent(document);
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Periodically check for dialogs
  setInterval(() => {
    fixDialogTriggers(document);
    fixDialogContent(document);
  }, 2000);
  
  console.log('✅ Correctif pour Radix UI initialisé');
})();
