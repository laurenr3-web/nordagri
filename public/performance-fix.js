
(function() {
  console.log('🔧 Application des améliorations de performance...');
  
  // Optimiser le traitement des événements pour réduire la latence des clics
  function optimizeEventHandling() {
    // Cache pour les gestionnaires d'événements
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'click' || type === 'mousedown' || type === 'touchstart') {
        // Donner la priorité aux événements de clic
        const enhancedOptions = options || {};
        if (typeof enhancedOptions === 'object') {
          enhancedOptions.capture = true;
          enhancedOptions.passive = false;
        }
        return originalAddEventListener.call(this, type, listener, enhancedOptions);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Débouncer pour les entrées de formulaire
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
  
  // Optimiser le rendu des formulaires en désactivant les animations pendant la saisie
  function optimizeFormRendering() {
    const formStyle = document.createElement('style');
    formStyle.textContent = `
      .form-focused * {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(formStyle);
    
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
  
  // Optimiser les dialogues pour des transitions plus fluides
  function optimizeDialogs() {
    // Intercepter les transitions pour s'assurer qu'elles sont terminées
    const dialogElements = document.querySelectorAll('[role="dialog"]');
    dialogElements.forEach(dialog => {
      if (dialog._dialogOptimized) return;
      dialog._dialogOptimized = true;
      
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'data-state') {
            const state = dialog.getAttribute('data-state');
            if (state === 'closed') {
              // Assurer une transition propre
              dialog.style.pointerEvents = 'none';
              setTimeout(() => {
                dialog.style.pointerEvents = '';
              }, 300);
            }
          }
        });
      });
      
      observer.observe(dialog, { attributes: true });
    });
  }
  
  // Améliorer la réactivité en optimisant la gestion des événements
  function enhanceMouseEvents() {
    // Prévenez les événements de souris inutiles
    document.body.addEventListener('mousedown', (e) => {
      // Marquer l'événement comme ayant été traité rapidement
      e._handledQuickly = true;
    }, { capture: true, passive: false });
    
    // Ajouter un indicateur visuel subtil pour les clics
    document.body.addEventListener('mousedown', (e) => {
      const clickIndicator = document.createElement('div');
      clickIndicator.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        animation: clickRipple 0.5s ease-out forwards;
      `;
      clickIndicator.style.left = `${e.clientX}px`;
      clickIndicator.style.top = `${e.clientY}px`;
      document.body.appendChild(clickIndicator);
      
      setTimeout(() => {
        document.body.removeChild(clickIndicator);
      }, 500);
    }, { passive: true });
    
    // Ajouter le style d'animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes clickRipple {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.5;
        }
        100% {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Appliquer toutes les optimisations
  function applyOptimizations() {
    optimizeEventHandling();
    optimizeFormRendering();
    optimizeDialogs();
    enhanceMouseEvents();
    
    // Continuer à optimiser pendant que l'utilisateur navigue
    setInterval(() => {
      optimizeDialogs();
    }, 2000);
  }
  
  // Démarrer l'optimisation après le chargement complet
  if (document.readyState === 'complete') {
    applyOptimizations();
  } else {
    window.addEventListener('load', applyOptimizations);
  }
  
  console.log('✅ Améliorations de performance appliquées');
})();
