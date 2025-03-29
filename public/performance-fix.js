
/**
 * Performance Optimizer Module
 * Coordinates loading of performance optimization modules
 */

(function() {
  console.log('🔧 Loading performance optimizations...');
  
  // Load the form optimizer
  function loadFormOptimizer() {
    const script = document.createElement('script');
    script.src = '/form-optimizer.js';
    script.async = true;
    
    script.onload = function() {
      console.log('✅ Form optimizer loaded');
    };
    
    script.onerror = function() {
      console.error('❌ Failed to load form optimizer');
      // Attempt fallback direct inline fix
      document.querySelectorAll('[role="combobox"], select').forEach(el => {
        el.addEventListener('click', e => e.stopPropagation(), true);
      });
    };
    
    document.head.appendChild(script);
  }
  
  // Load the UI interaction optimizer
  function loadUIOptimizer() {
    const script = document.createElement('script');
    script.src = '/ui-interaction-optimizer.js';
    script.async = true;
    
    script.onload = function() {
      console.log('✅ UI interaction optimizer loaded');
    };
    
    script.onerror = function() {
      console.error('❌ Failed to load UI interaction optimizer');
      // Attempt fallback direct inline fix
      window._lastClickTime = 0;
      document.addEventListener('click', e => {
        const now = Date.now();
        if (now - window._lastClickTime < 300) {
          e.preventDefault();
          return false;
        }
        window._lastClickTime = now;
      }, true);
    };
    
    document.head.appendChild(script);
  }
  
  // Emergency fix for dropdown menus if scripts fail to load
  function applyEmergencyDropdownFix() {
    // Ensure dropdowns are visible with correct z-index
    const style = document.createElement('style');
    style.textContent = `
      [data-radix-popper-content-wrapper],
      [role="listbox"],
      .select-content {
        z-index: 9999 !important;
        background-color: var(--background, white) !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Emergency dropdown fix applied');
  }
  
  // Load all optimization modules
  function loadOptimizers() {
    // Apply emergency fix immediately
    applyEmergencyDropdownFix();
    
    // Then load the full optimizers
    loadFormOptimizer();
    loadUIOptimizer();
  }
  
  // Start loading optimizers
  loadOptimizers();
  
  console.log('✅ Performance optimization coordinator initialized');
})();
