
/**
 * UI Interaction Optimizer Module
 * Improves responsiveness of UI interactions like clicks and transitions
 */

(function() {
  console.log('🔄 Loading UI interaction optimizations...');
  
  // Optimize event handling for clicks and taps
  function optimizeEventHandling() {
    // Prioritize click and touch event handling
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'click' || type === 'mousedown' || type === 'touchstart') {
        // Give priority to click events
        const enhancedOptions = options || {};
        if (typeof enhancedOptions === 'object') {
          enhancedOptions.capture = true;
          enhancedOptions.passive = false;
        }
        return originalAddEventListener.call(this, type, listener, enhancedOptions);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
  
  // Add visual feedback for click interactions
  function enhanceMouseFeedback() {
    // Add subtle visual indicator for clicks
    document.body.addEventListener('mousedown', (e) => {
      // Mark the event as having been handled quickly
      e._handledQuickly = true;
    }, { capture: true, passive: false });
    
    // Add click ripple effect
    document.body.addEventListener('mousedown', (e) => {
      const clickIndicator = document.createElement('div');
      clickIndicator.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        animation: clickRipple 0.5s ease-out forwards;
      `;
      clickIndicator.style.left = `${e.clientX}px`;
      clickIndicator.style.top = `${e.clientY}px`;
      document.body.appendChild(clickIndicator);
      
      setTimeout(() => {
        if (clickIndicator.parentNode) {
          document.body.removeChild(clickIndicator);
        }
      }, 500);
    }, { passive: true });
    
    // Add ripple animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes clickRipple {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.5;
        }
        100% {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Optimize dialog transitions
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
  
  // Apply all UI optimizations
  function applyUIOptimizations() {
    optimizeEventHandling();
    enhanceMouseFeedback();
    optimizeDialogInteractions();
    
    // Continue to optimize dialogs as new ones are added
    setInterval(() => {
      optimizeDialogInteractions();
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
