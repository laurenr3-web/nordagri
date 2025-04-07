
import { useEffect } from 'react';

/**
 * Custom hook to fix mobile scrolling issues in form dialogs
 * by applying proper CSS styles to modal dialogs and forms
 */
const useFixMobileScrolling = () => {
  useEffect(() => {
    // Function to apply scrolling fixes to a dialog element
    const applyScrollFix = (element: HTMLElement) => {
      if (!element) return;
      
      // Apply proper overflow settings for mobile scrolling
      element.style.maxHeight = '80vh';
      element.style.overflowY = 'auto';
      // Use this instead of WebkitOverflowScrolling which is deprecated
      element.style.overscrollBehavior = 'touch';
      element.classList.add('dialog-mobile-friendly');
    };

    // Observer to watch for dialog elements being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Find dialog content within added nodes
              const dialogElements = node.querySelectorAll('.dialog-content, [role="dialog"], .form-scrollable');
              dialogElements.forEach((el) => {
                if (el instanceof HTMLElement) {
                  applyScrollFix(el);
                }
              });
              
              // Also check if the node itself is a dialog
              if (node.classList.contains('dialog-content') || 
                  node.getAttribute('role') === 'dialog' || 
                  node.classList.contains('form-scrollable')) {
                applyScrollFix(node);
              }
            }
          });
        }
      });
    });

    // Start observing the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up the observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);
};

export default useFixMobileScrolling;
