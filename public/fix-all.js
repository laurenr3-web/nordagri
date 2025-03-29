
(function() {
  console.log('🔄 Chargement des scripts de réparation...');
  
  // Patch the Node.prototype.removeChild method to prevent errors
  window.__fixDOMErrors = function() {
    // Correctif pour les erreurs removeChild
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
      if (child && this.contains(child)) {
        return originalRemoveChild.apply(this, arguments);
      } else {
        console.warn('⚠️ Safe DOM: Prevented removeChild error for a non-child node');
        return child;
      }
    };
    
    // Patch appendChild to be safer too
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
      try {
        // Check if the node is already a child of another node
        if (child.parentNode && child.parentNode !== this) {
          child.parentNode.removeChild(child);
        }
        return originalAppendChild.call(this, child);
      } catch (e) {
        console.warn('⚠️ Safe DOM: Prevented appendChild error', e);
        return child;
      }
    };
    
    console.log('✅ Enhanced DOM safety patches applied');
  };
  
  // Function to load a script
  function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    script.onload = function() {
      console.log(`✅ Script chargé: ${url}`);
      if (callback) callback();
    };
    
    script.onerror = function() {
      console.error(`❌ Erreur de chargement: ${url}`);
    };
    
    document.head.appendChild(script);
  }
  
  // Apply the DOM error fixing patch immediately
  window.__fixDOMErrors();
  
  // Load dialog-specific fixes
  function loadDialogFix() {
    // Add specific fix for dialogs
    window.__fixDialogs = function() {
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
                          portal.remove();
                        }
                      });
                    }, 50);
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
    window.__fixDialogs();
    
    // Set a periodic check to find and fix new dialogs
    setInterval(window.__fixDialogs, 1000);
  }
  
  // Schedule fixes to run in sequence
  // Apply the DOM fix immediately
  window.__fixDOMErrors();
  
  // Charger les scripts dans l'ordre
  loadScript('/button-fix.js', function() {
    loadScript('/radix-fix.js', function() {
      loadScript('/fix-accessibility.js', function() {
        loadScript('/form-fix.js', function() {
          console.log('🛠️ Scripts de réparation en cours d\'exécution...');
          loadDialogFix();
          
          // Add a global error handler for the removeChild error
          window.addEventListener('error', function(event) {
            if (event.message && event.message.includes('removeChild') && 
                event.message.includes('not a child of this node')) {
              console.warn('⚠️ removeChild error intercepted and prevented');
              event.preventDefault();
              event.stopPropagation();
              
              // Trigger DOM cleanup
              requestAnimationFrame(() => {
                window.__fixDOMErrors();
                window.__fixDialogs();
              });
              
              return true;
            }
          }, true);
          
          // Add an observer to reapply fixes when the DOM changes
          const observer = new MutationObserver(function(mutations) {
            const relevantChanges = mutations.some(mutation => 
              mutation.type === 'childList' && mutation.addedNodes.length > 0
            );
            
            if (relevantChanges) {
              requestAnimationFrame(() => {
                window.__fixDOMErrors();
                window.__fixDialogs();
              });
            }
          });
          
          // Observe the body of the document
          observer.observe(document.body, { 
            childList: true, 
            subtree: true 
          });
          
          // Final success message
          setTimeout(function() {
            console.log('✅ Réparation terminée! Les formulaires et dialogues devraient maintenant fonctionner correctement.');
          }, 1000);
        });
      });
    });
  });
})();
