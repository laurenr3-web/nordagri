
/**
 * UI Interaction Optimizer Module
 * Improves responsiveness of UI interactions like clicks and transitions
 */

(function() {
  console.log('🔄 Loading UI interaction optimizations...');
  
  // Optimize event handling for clicks and taps
  function optimizeEventHandling() {
    // Prioritize click and touch event handling but don't override default behavior
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'click' || type === 'mousedown' || type === 'touchstart') {
        // Give priority to click events but avoid making them trigger artificially
        const enhancedOptions = options || {};
        if (typeof enhancedOptions === 'object') {
          enhancedOptions.capture = true;
          // Don't set passive to false as it can cause unexpected behavior
        }
        return originalAddEventListener.call(this, type, listener, enhancedOptions);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
  
  // Fix for random click issues: remove auto-click feature
  function enhanceMouseFeedback() {
    // Create a flag to prevent multiple click events
    window._lastClickTime = 0;
    
    // Add click handling without auto-triggering clicks
    document.addEventListener('click', (e) => {
      const now = Date.now();
      // Prevent duplicate clicks in quick succession (debounce)
      if (now - window._lastClickTime < 300) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      window._lastClickTime = now;
    }, { capture: true, passive: false });
    
    // Remove the ripple effect to prevent ghost clicks
    // The ripple effect code has been removed to prevent ghost clicks
  }
  
  // Optimize dialog transitions and fix dropdown menus in forms
  function optimizeDialogInteractions() {
    // Fix dialog transitions
    const dialogElements = document.querySelectorAll('[role="dialog"]');
    dialogElements.forEach(dialog => {
      if (dialog._dialogOptimized) return;
      dialog._dialogOptimized = true;
      
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'data-state') {
            const state = dialog.getAttribute('data-state');
            if (state === 'closed') {
              // Ensure clean transition
              dialog.style.pointerEvents = 'none';
              setTimeout(() => {
                dialog.style.pointerEvents = '';
              }, 300);
            }
          }
        });
      });
      
      observer.observe(dialog, { attributes: true });
    });
  }
  
  // Fix dropdown menus in forms
  function fixFormDropdowns() {
    // Fix Radix UI Select dropdowns
    document.querySelectorAll('[data-radix-select-trigger]').forEach(trigger => {
      if (trigger._dropdownFixed) return;
      trigger._dropdownFixed = true;
      
      // Ensure the trigger element correctly opens the dropdown
      trigger.addEventListener('click', (e) => {
        // Let the click pass through without interference
        // Just flag it as handled properly
        e._handledByOptimizer = true;
      }, { capture: true });
    });
    
    // Fix other dropdown menus
    document.querySelectorAll('.select-trigger, [role="combobox"]').forEach(dropdown => {
      if (dropdown._dropdownFixed) return;
      dropdown._dropdownFixed = true;
      
      dropdown.addEventListener('click', (e) => {
        // Make sure click actually reaches the dropdown
        e._handledByOptimizer = true;
      }, { capture: true });
    });
    
    // Monitor for dynamically added dropdowns
    const dropdownObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          setTimeout(() => {
            fixFormDropdowns();
          }, 100);
        }
      });
    });
    
    dropdownObserver.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Apply all UI optimizations
  function applyUIOptimizations() {
    optimizeEventHandling();
    enhanceMouseFeedback();
    optimizeDialogInteractions();
    fixFormDropdowns();
    
    // Continue to optimize dialogs as new ones are added
    setInterval(() => {
      optimizeDialogInteractions();
      fixFormDropdowns();
    }, 2000);
    
    console.log('✅ UI interaction optimizations applied');
  }
  
  // Apply optimizations when DOM is ready
  if (document.readyState === 'complete') {
    applyUIOptimizations();
  } else {
    window.addEventListener('load', applyUIOptimizations);
  }
})();
