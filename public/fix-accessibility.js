
(function() {
  console.log('🔄 Amélioration de l\'accessibilité en cours...');
  
  let fixedButtons = 0;
  
  // Function to fix buttons
  function fixAccessibilityIssues() {
    // Fix buttons without accessible names
    document.querySelectorAll('button:not([aria-label]):not([title]):empty').forEach(button => {
      if (!button.hasAttribute('data-a11y-fixed')) {
        // Try to determine a name from nearby content
        let name = '';
        
        // Check for icon child
        const iconChild = button.querySelector('svg');
        if (iconChild && iconChild.getAttribute('data-icon')) {
          name = iconChild.getAttribute('data-icon') || '';
        }
        
        // If still empty, try to get name from context
        if (!name) {
          // Check if it's a close button
          if (button.classList.contains('close') || 
              button.textContent === '×' || 
              button.innerHTML.includes('close')) {
            name = 'Fermer';
          }
          // Check if it's in a dialog
          else if (button.closest('[role="dialog"]')) {
            name = 'Action dialogue';
          }
          else {
            name = 'Action';
          }
        }
        
        button.setAttribute('aria-label', name);
        button.setAttribute('data-a11y-fixed', 'true');
        fixedButtons++;
      }
    });
  }
  
  // Run immediately
  fixAccessibilityIssues();
  
  // Set up an observer to catch dynamically added buttons
  const observer = new MutationObserver(fixAccessibilityIssues);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Run periodically to catch any missed elements
  setInterval(fixAccessibilityIssues, 2000);
  
  // Report results
  setTimeout(() => {
    console.log(`✅ Accessibilité améliorée: ${fixedButtons} boutons réparés`);
  }, 1000);
})();
