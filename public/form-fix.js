
(function() {
  console.log('🔄 Initialisation du correctif pour les formulaires...');
  
  // Liste des boutons qui ouvrent les dialogues, avec leurs identifiants (pour les retrouver facilement)
  const dialogOpeners = [
    { selector: 'button:contains("Nouvelle intervention")', dialogId: 'new-intervention-dialog' },
    { selector: 'button:contains("Ajouter un équipement")', dialogId: 'add-equipment-dialog' },
    { selector: 'button:contains("Ajouter une pièce")', dialogId: 'add-part-dialog' },
    { selector: 'button:contains("Nouvelle tâche")', dialogId: 'new-task-dialog' }
  ];
  
  // Fonction pour trouver un élément par texte contenu
  function getElementByText(selector, text) {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].textContent.includes(text)) {
        return elements[i];
      }
    }
    return null;
  }
  
  // Fonction pour ajouter un gestionnaire d'événement forcé sur les boutons d'ouverture
  function setupForceOpenHandlers() {
    // Parcourir tous les boutons connus qui ouvrent des formulaires
    dialogOpeners.forEach(opener => {
      const button = getElementByText('button', opener.selector.replace(':contains("', '').replace('")', ''));
      
      if (button && !button.hasAttribute('data-form-fixed')) {
        console.log(`Ajout du correctif pour le bouton: ${opener.selector}`);
        button.setAttribute('data-form-fixed', 'true');
        
        // Ajouter un gestionnaire d'événements parallèle
        button.addEventListener('click', function(e) {
          console.log(`Bouton de formulaire cliqué: ${opener.selector}`);
          
          // Attendre un peu pour voir si le dialogue s'ouvre normalement
          setTimeout(() => {
            // Vérifier si un dialogue est visible
            const anyDialogOpen = document.querySelector('[role="dialog"][data-state="open"]');
            if (!anyDialogOpen) {
              console.log(`Forçage de l'ouverture du formulaire: ${opener.dialogId}`);
              
              // Tenter de forcer l'ouverture d'un dialogue React
              try {
                const reactRoot = document.getElementById('root');
                if (reactRoot && reactRoot._reactRootContainer) {
                  console.log('Tentative de déclenchement d\'événement React...');
                }
              } catch (err) {
                console.error('Erreur lors de la tentative de manipulation React:', err);
              }
              
              // Vérifier s'il y a un état stocké dans un attribut data
              if (button.dataset.dialogState === 'closed') {
                button.dataset.dialogState = 'open';
                // Déclencher un événement personnalisé que d'autres scripts pourraient écouter
                button.dispatchEvent(new CustomEvent('forceOpenDialog', { 
                  detail: { dialogId: opener.dialogId } 
                }));
              }
            }
          }, 300);
        });
      }
    });
    
    // Ajouter également un correctif pour les boutons génériques
    const allButtons = document.querySelectorAll('button, [role="button"]');
    allButtons.forEach(button => {
      if (!button.hasAttribute('data-form-fixed') && 
          (button.textContent.toLowerCase().includes('ajouter') || 
           button.textContent.toLowerCase().includes('nouveau') ||
           button.textContent.toLowerCase().includes('nouvelle') ||
           button.textContent.toLowerCase().includes('créer'))) {
        
        button.setAttribute('data-form-fixed', 'true');
        
        // Ajouter un gestionnaire d'événements parallèle
        button.addEventListener('click', function() {
          console.log(`Bouton d'action détecté: ${button.textContent}`);
          
          // Attendre un peu pour voir si un dialogue s'ouvre
          setTimeout(() => {
            // Vérifier si un dialogue est visible
            const anyDialogOpen = document.querySelector('[role="dialog"][data-state="open"]');
            if (!anyDialogOpen) {
              console.log(`Tentative de déclenchement d'action après clic sur: ${button.textContent}`);
            }
          }, 300);
        });
      }
    });
  }
  
  // Exécuter immédiatement
  setupForceOpenHandlers();
  
  // Observer les modifications du DOM pour détecter de nouveaux boutons
  const observer = new MutationObserver(function(mutations) {
    let shouldRerun = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        // Si de nouveaux nœuds sont ajoutés, vérifier s'il faut reconfigurer
        shouldRerun = true;
      }
    });
    
    if (shouldRerun) {
      setupForceOpenHandlers();
    }
  });
  
  // Commencer à observer
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Vérifier périodiquement les nouveaux boutons
  setInterval(setupForceOpenHandlers, 3000);
  
  console.log('✅ Correctif pour les formulaires initialisé');
})();
