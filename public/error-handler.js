
/**
 * Error Handler Module
 * Provides global error handling for DOM manipulation errors
 */

(function() {
  console.log('🔄 Loading error handler...');
  
  // Add a global error handler for DOM manipulation errors
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
        if (window.__fixDOMErrors) {
          window.__fixDOMErrors();
        }
        if (window.__fixReactDialogs) {
          window.__fixReactDialogs();
        }
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
        if (window.__fixDOMErrors) {
          window.__fixDOMErrors();
        }
        if (window.__fixReactDialogs) {
          window.__fixReactDialogs();
        }
      });
    }
  });
  
  // Observe the body of the document with a throttled approach
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  console.log('✅ Error handler loaded');
})();
