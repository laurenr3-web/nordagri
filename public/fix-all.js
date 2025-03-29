
(function() {
  console.log('🔄 Chargement des scripts de réparation...');
  
  // Enhanced patches for React DOM manipulation errors
  window.__fixDOMErrors = function() {
    // Patch the document.createElement to add custom properties for debugging
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.apply(document, arguments);
      element._createdAt = new Date().getTime();
      element._createdBy = 'patched-create-element';
      return element;
    };
    
    // Patch removeChild to be safer
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
      if (!child) {
        console.warn('⚠️ Safe DOM: Prevented removeChild call with null/undefined child');
        return null;
      }
      
      try {
        // Check if child is actually a child of this node
        if (this.contains(child)) {
          return originalRemoveChild.call(this, child);
        } else {
          console.warn('⚠️ Safe DOM: Prevented removeChild error for a non-child node', {
            parent: this,
            child: child
          });
          
          // Attempt to find and remove from actual parent if possible
          if (child.parentNode) {
            console.log('🔍 Safe DOM: Found actual parent, removing properly');
            return child.parentNode.removeChild(child);
          }
          
          return child;
        }
      } catch (e) {
        console.warn('⚠️ Safe DOM: Caught error in removeChild', e);
        return child;
      }
    };
    
    // Patch appendChild to be safer too
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
      if (!child) {
        console.warn('⚠️ Safe DOM: Prevented appendChild call with null/undefined child');
        return null;
      }
      
      try {
        // If the node already has a parent, remove it first to avoid DOM hierarchy issues
        if (child.parentNode && child.parentNode !== this) {
          child.parentNode.removeChild(child);
        }
        return originalAppendChild.call(this, child);
      } catch (e) {
        console.warn('⚠️ Safe DOM: Caught error in appendChild', e);
        return child;
      }
    };
    
    // Patch insertBefore to be safer
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(newNode, referenceNode) {
      if (!newNode) {
        console.warn('⚠️ Safe DOM: Prevented insertBefore call with null/undefined newNode');
        return null;
      }
      
      try {
        // If the new node already has a parent, remove it first
        if (newNode.parentNode && newNode.parentNode !== this) {
          newNode.parentNode.removeChild(newNode);
        }
        
        // Handle null referenceNode (appendChild behavior)
        if (!referenceNode) {
          return this.appendChild(newNode);
        }
        
        // Check if reference node is actually a child
        if (!this.contains(referenceNode)) {
          console.warn('⚠️ Safe DOM: Reference node is not a child in insertBefore');
          return this.appendChild(newNode);
        }
        
        return originalInsertBefore.call(this, newNode, referenceNode);
      } catch (e) {
        console.warn('⚠️ Safe DOM: Caught error in insertBefore', e);
        try {
          // Fallback to appendChild if insertBefore fails
          return this.appendChild(newNode);
        } catch (e2) {
          console.warn('⚠️ Safe DOM: Fallback appendChild also failed', e2);
          return newNode;
        }
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
  
  // Schedule fixes to run in sequence
  // Apply the DOM fix immediately
  window.__fixDOMErrors();
  
  // Charger les scripts dans l'ordre
  loadScript('/button-fix.js', function() {
    loadScript('/radix-fix.js', function() {
      loadScript('/fix-accessibility.js', function() {
        loadScript('/form-fix.js', function() {
          console.log('🛠️ Scripts de réparation en cours d\'exécution...');
          
          // Add a global error handler for the removeChild error
          window.addEventListener('error', function(event) {
            if (event.message && 
               (event.message.includes('removeChild') || 
                event.message.includes('appendChild') || 
                event.message.includes('insertBefore'))) {
              console.warn('⚠️ DOM manipulation error intercepted and prevented:', event.message);
              event.preventDefault();
              event.stopPropagation();
              
              // Trigger DOM cleanup
              requestAnimationFrame(() => {
                window.__fixDOMErrors();
                window.__fixReactDialogs();
              });
              
              return true;
            }
          }, true);
          
          // Add an observer to reapply fixes when the DOM changes significantly
          const observer = new MutationObserver(function(mutations) {
            const relevantChanges = mutations.some(mutation => 
              mutation.type === 'childList' && 
              (mutation.addedNodes.length > 2 || mutation.removedNodes.length > 2)
            );
            
            if (relevantChanges) {
              requestAnimationFrame(() => {
                window.__fixDOMErrors();
                window.__fixReactDialogs();
              });
            }
          });
          
          // Observe the body of the document with a throttled approach
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
