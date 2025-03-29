
(function() {
  console.log('🔄 Chargement des scripts de réparation...');
  
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
  
  // Charger les scripts dans l'ordre
  loadScript('/button-fix.js', function() {
    loadScript('/radix-fix.js', function() {
      loadScript('/fix-accessibility.js', function() {
        loadScript('/form-fix.js', function() {
          console.log('🛠️ Script de réparation en cours d\'exécution...');
          
          // Ajout d'un message final
          setTimeout(function() {
            console.log('✅ Réparation terminée! Les boutons devraient maintenant fonctionner.');
          }, 1000);
        });
      });
    });
  });
})();
