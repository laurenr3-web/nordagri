
/**
 * Form Optimizer Module
 * Optimizes form rendering and interactions for better performance
 */

(function() {
  console.log('🔄 Loading form optimizations...');
  
  // Optimize form rendering by disabling animations during input
  function optimizeFormRendering() {
    // Add style to disable animations when a form is being interacted with
    const formStyle = document.createElement('style');
    formStyle.textContent = `
      .form-focused * {
        transition: none !important;
        animation: none !important;
      }
      
      /* Ensure dropdown menus are visible */
      [data-radix-popper-content-wrapper] {
        z-index: 9999 !important;
        background-color: var(--background, white) !important;
        opacity: 1 !important;
      }
      
      /* Fix select dropdown visibility */
      [role="listbox"] {
        z-index: 9999 !important;
        background-color: var(--background, white) !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(formStyle);
    
    // Add event listeners to toggle form-focused class
    document.addEventListener('focusin', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        const form = e.target.closest('form');
        if (form) form.classList.add('form-focused');
      }
    }, true);
    
    document.addEventListener('focusout', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        const form = e.target.closest('form');
        if (form) form.classList.remove('form-focused');
      }
    }, true);
  }
  
  // Fix dropdown menus in forms
  function fixFormDropdowns() {
    // Find all select/dropdown elements that might need fixing
    const selectElements = document.querySelectorAll('select, [role="combobox"], [data-radix-select-trigger]');
    
    selectElements.forEach(select => {
      if (select._selectFixed) return;
      select._selectFixed = true;
      
      // Prevent any interference with dropdown opening
      select.addEventListener('click', function(e) {
        // Don't interfere with the click, just mark it as properly handled
        e._handledByFormOptimizer = true;
      }, true);
      
      // Make sure popovers stay open as needed
      if (select.getAttribute('aria-expanded') === 'true') {
        // This is a select that's already open, make sure it stays visible
        const selectId = select.id;
        if (selectId) {
          const relatedContent = document.querySelector(`[aria-labelledby="${selectId}"]`);
          if (relatedContent) {
            relatedContent.style.display = 'block';
            relatedContent.style.visibility = 'visible';
            relatedContent.style.opacity = '1';
          }
        }
      }
    });
    
    // Monitor for new select elements
    const selectObserver = new MutationObserver((mutations) => {
      let shouldCheckSelects = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          shouldCheckSelects = true;
        }
      });
      
      if (shouldCheckSelects) {
        setTimeout(() => {
          fixFormDropdowns();
        }, 100);
      }
    });
    
    selectObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Optimize input event handling with debouncing
  function optimizeInputHandling() {
    const inputElements = document.querySelectorAll('input, textarea, select');
    inputElements.forEach(el => {
      if (el._inputOptimized) return;
      el._inputOptimized = true;
      
      const originalOnInput = el.oninput;
      let debounceTimer;
      
      el.oninput = function(e) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (originalOnInput) originalOnInput.call(this, e);
        }, 50);
      };
      
      // Make sure clicks work properly on input elements
      el.addEventListener('click', (e) => {
        e._handledByFormOptimizer = true;
      }, true);
    });
    
    // Monitor for dynamically added inputs
    const inputObserver = new MutationObserver((mutations) => {
      let shouldCheckInputs = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          shouldCheckInputs = true;
        }
      });
      
      if (shouldCheckInputs) {
        setTimeout(() => {
          const newInputs = document.querySelectorAll('input:not([_inputOptimized]), textarea:not([_inputOptimized]), select:not([_inputOptimized])');
          if (newInputs.length > 0) {
            optimizeInputHandling();
          }
        }, 100);
      }
    });
    
    inputObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Apply form optimizations
  function applyFormOptimizations() {
    optimizeFormRendering();
    optimizeInputHandling();
    fixFormDropdowns();
    
    // Check periodically for new elements that need optimization
    setInterval(() => {
      fixFormDropdowns();
    }, 2000);
    
    console.log('✅ Form optimizations applied');
  }
  
  // Apply optimizations when DOM is ready
  if (document.readyState === 'complete') {
    applyFormOptimizations();
  } else {
    window.addEventListener('load', applyFormOptimizations);
  }
})();
