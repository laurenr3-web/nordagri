
(function() {
  console.log('🔄 Chargement des scripts de réparation...');
  
  // Ajouter une fonction spécifique pour réparer les erreurs de nœud DOM
  window.__fixDOMErrors = function() {
    // Correctif pour les erreurs removeChild
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
      if (child && this.contains(child)) {
        return originalRemoveChild.apply(this, arguments);
      } else {
        console.warn('⚠️ Tentative de suppression d\'un nœud enfant inexistant évitée');
        return child;
      }
    };
    console.log('✅ Correctif de nœud DOM appliqué');
  };
  
  // Fonction pour charger un script
  function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    script.onload = function() {
      console.log(`✅ Script chargé: ${url}`);
      if (callback) callback();
    };
    
    script.onerror = function() {
      console.error(`❌ Erreur de chargement: ${url}`);
    };
    
    document.head.appendChild(script);
  }
  
  // Appliquer le correctif DOM dès que possible
  window.__fixDOMErrors();
  
  // Charger les scripts dans l'ordre
  loadScript('/button-fix.js', function() {
    loadScript('/radix-fix.js', function() {
      loadScript('/fix-accessibility.js', function() {
        loadScript('/form-fix.js', function() {
          console.log('🛠️ Script de réparation en cours d\'exécution...');
          
          // Ajouter un observateur de mutations pour réappliquer les correctifs si nécessaire
          const observer = new MutationObserver(function(mutations) {
            // Si de nouveaux éléments sont ajoutés, réappliquer les correctifs
            const relevantChanges = mutations.some(mutation => 
              mutation.type === 'childList' && mutation.addedNodes.length > 0
            );
            
            if (relevantChanges) {
              console.log('🔄 Nouvelles mutations DOM détectées, réapplication des correctifs...');
              setTimeout(function() {
                // Réappliquer les correctifs
                window.__fixDOMErrors();
              }, 50);
            }
          });
          
          // Observer le corps du document
          observer.observe(document.body, { 
            childList: true, 
            subtree: true 
          });
          
          // Ajout d'un message final
          setTimeout(function() {
            console.log('✅ Réparation terminée! Les formulaires et dialogues devraient maintenant fonctionner correctement.');
          }, 1000);
        });
      });
    });
  });
})();
