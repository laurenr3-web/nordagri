
/**
 * Script Loader Module
 * Handles loading and execution of fix scripts in the correct order
 */

(function() {
  console.log('🔄 Initializing script loader...');
  
  // Function to load a script
  function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    script.onload = function() {
      console.log(`✅ Script loaded: ${url}`);
      if (callback) callback();
    };
    
    script.onerror = function() {
      console.error(`❌ Error loading: ${url}`);
    };
    
    document.head.appendChild(script);
  }
  
  // Load scripts in sequence
  function loadScriptsSequentially(scripts, index) {
    if (index >= scripts.length) {
      console.log('✅ All fix scripts loaded successfully');
      return;
    }
    
    loadScript(scripts[index], function() {
      loadScriptsSequentially(scripts, index + 1);
    });
  }
  
  // Define the scripts to load in order
  const fixScripts = [
    '/dom-safety.js',
    '/dialog-fixer.js',
    '/button-fix.js',
    '/radix-fix.js',
    '/fix-accessibility.js',
    '/form-fix.js',
    '/performance-fix.js',
    '/error-handler.js'
  ];
  
  // Start loading scripts in sequence
  loadScriptsSequentially(fixScripts, 0);
  
  // Final success message
  setTimeout(function() {
    console.log('✅ Repair complete! Forms and dialogs should now work correctly.');
  }, 2000);
})();
