
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
    };
    
    document.head.appendChild(script);
  }
  
  // Load all optimization modules
  function loadOptimizers() {
    loadFormOptimizer();
    loadUIOptimizer();
  }
  
  // Start loading optimizers
  loadOptimizers();
  
  console.log('✅ Performance optimization coordinator initialized');
})();
