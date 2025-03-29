
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
  
  // Optimize input event handling with debouncing
  function optimizeInputHandling() {
    const inputElements = document.querySelectorAll('input, textarea, select');
    inputElements.forEach(el => {
      const originalOnInput = el.oninput;
      let debounceTimer;
      
      el.oninput = function(e) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (originalOnInput) originalOnInput.call(this, e);
        }, 50);
      };
    });
  }
  
  // Apply form optimizations
  function applyFormOptimizations() {
    optimizeFormRendering();
    optimizeInputHandling();
    
    console.log('✅ Form optimizations applied');
  }
  
  // Apply optimizations when DOM is ready
  if (document.readyState === 'complete') {
    applyFormOptimizations();
  } else {
    window.addEventListener('load', applyFormOptimizations);
  }
})();
