
(function() {
  console.log('🔄 Amélioration de l\'accessibilité en cours...');
  
  let fixedButtons = 0;
  let fixedDialogs = 0;
  
  // Function to fix buttons and forms
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
    
    // Add extra handling for form submission buttons
    document.querySelectorAll('button[type="submit"]').forEach(button => {
      if (!button.hasAttribute('data-submit-fixed')) {
        button.setAttribute('data-submit-fixed', 'true');
        
        // Capture original click function
        const originalOnClick = button.onclick;
        
        // Replace with enhanced version
        button.onclick = function(e) {
          console.log('Form submit button clicked:', button.textContent);
          if (originalOnClick) {
            // Try original handler
            return originalOnClick.call(this, e);
          }
        };
      }
    });
    
    // Fix dialog accessibility
    document.querySelectorAll('[role="dialog"]').forEach(dialog => {
      if (!dialog.hasAttribute('data-dialog-fixed')) {
        dialog.setAttribute('data-dialog-fixed', 'true');
        
        // Ensure dialog has proper attributes
        if (!dialog.hasAttribute('aria-modal')) {
          dialog.setAttribute('aria-modal', 'true');
        }
        
        // Add high z-index to dialog content
        dialog.style.zIndex = '9999';
        
        // Add background if transparent
        if (getComputedStyle(dialog).backgroundColor === 'rgba(0, 0, 0, 0)') {
          dialog.style.backgroundColor = 'var(--background, white)';
        }
        
        fixedDialogs++;
      }
    });
  }
  
  // Run immediately
  fixAccessibilityIssues();
  
  // Set up an observer to catch dynamically added elements
  const observer = new MutationObserver(fixAccessibilityIssues);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Run periodically to catch any missed elements
  setInterval(fixAccessibilityIssues, 2000);
  
  // Extra helper function to manually force dialog opening
  window.openDialog = function(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
      const trigger = dialog.querySelector('[data-state="closed"]');
      if (trigger) {
        console.log('Forcing dialog open:', dialogId);
        trigger.click();
      }
    }
  };
  
  // Report results
  setTimeout(() => {
    console.log(`✅ Accessibilité améliorée: ${fixedButtons} boutons et ${fixedDialogs} dialogues réparés`);
  }, 1000);
})();
