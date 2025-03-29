
/**
 * Dialog Fixer Module
 * Improves React dialog components behavior
 */

(function() {
  console.log('🔄 Loading dialog fixes...');
  
  // Add specific fix for React dialog components
  window.__fixReactDialogs = function() {
    // Improve React Portal cleanup
    const portalContainers = document.querySelectorAll('[data-radix-portal]');
    portalContainers.forEach(portal => {
      if (!portal._enhanced) {
        portal._enhanced = true;
        
        // Create a MutationObserver to monitor the portal
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              // When children are removed, check if portal is empty and remove it
              if (portal.childNodes.length === 0) {
                setTimeout(() => {
                  // Double-check it's still empty before removing
                  if (portal.childNodes.length === 0 && portal.parentNode) {
                    console.log('🧹 Cleaning up empty portal');
                    portal.parentNode.removeChild(portal);
                  }
                }, 100);
              }
            }
          });
        });
        
        observer.observe(portal, { childList: true });
      }
    });
    
    // Fix dialog state tracking
    const dialogElements = document.querySelectorAll('[role="dialog"]');
    dialogElements.forEach(dialog => {
      if (!dialog._dialogFixed) {
        dialog._dialogFixed = true;
        
        // Add a data attribute to track dialog state
        dialog.setAttribute('data-dialog-managed', 'true');
        
        // Create a MutationObserver to monitor attribute changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-state') {
              const state = dialog.getAttribute('data-state');
              console.log(`Dialog state change detected: ${state}`);
              
              // If dialog is closing, ensure clean DOM updates
              if (state === 'closed') {
                requestAnimationFrame(() => {
                  // Give React a chance to complete its updates
                  setTimeout(() => {
                    // Clean up any orphaned Portal elements
                    const portals = document.querySelectorAll('[data-radix-portal]');
                    portals.forEach(portal => {
                      if (!portal.hasChildNodes()) {
                        try {
                          if (portal.parentNode) {
                            portal.parentNode.removeChild(portal);
                          }
                        } catch (e) {
                          console.warn('Error removing empty portal:', e);
                        }
                      }
                    });
                  }, 100);
                });
              }
            }
          });
        });
        
        observer.observe(dialog, { attributes: true });
      }
    });
  };
  
  // Apply dialog fixes
  window.__fixReactDialogs();
  
  // Set a periodic check to find and fix new dialogs
  setInterval(window.__fixReactDialogs, 1000);
})();
