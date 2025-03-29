
/**
 * Fix All Module - Main entry point
 * Coordinates the loading of all fix modules
 */

(function() {
  console.log('🔄 Loading fix-all coordinator...');
  
  // Load the script loader which will handle loading all other scripts
  const scriptLoader = document.createElement('script');
  scriptLoader.src = '/script-loader.js';
  scriptLoader.async = true;
  
  scriptLoader.onload = function() {
    console.log('✅ Script loader initialized');
  };
  
  scriptLoader.onerror = function() {
    console.error('❌ Failed to load script loader');
    
    // Fallback: try to load core fixes directly
    const domSafety = document.createElement('script');
    domSafety.src = '/dom-safety.js';
    document.head.appendChild(domSafety);
  };
  
  document.head.appendChild(scriptLoader);
})();
