
/**
 * Convertit les valeurs de compatibilité en tableau de nombres
 * Cette fonction gère différents formats de compatibilité et les normalise
 */
export function compatibilityToNumbers(compatibility: any): number[] {
  // Si c'est déjà un tableau
  if (Array.isArray(compatibility)) {
    return compatibility.map(id => {
      // Si c'est une chaîne qui peut être convertie en nombre
      if (typeof id === 'string' && !isNaN(Number(id))) {
        return Number(id);
      }
      // Si c'est déjà un nombre
      else if (typeof id === 'number') {
        return id;
      }
      // Pour tout autre format, on le garde tel quel (cela pourrait générer des erreurs plus tard)
      else {
        console.warn('Format de compatibilité non pris en charge:', id);
        return 0; // Valeur par défaut
      }
    }).filter(id => id > 0); // Filtrer les valeurs invalides
  }
  
  // Si c'est null ou undefined
  if (compatibility == null) {
    return [];
  }
  
  // Si c'est un objet (comme PostgreSQL JSONB)
  if (typeof compatibility === 'object') {
    try {
      return Object.values(compatibility).map(Number).filter(id => !isNaN(id));
    } catch (error) {
      console.error('Erreur lors de la conversion de la compatibilité:', error);
      return [];
    }
  }
  
  // Si c'est une chaîne (comme une liste séparée par des virgules)
  if (typeof compatibility === 'string') {
    try {
      return compatibility.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    } catch (error) {
      console.error('Erreur lors de la conversion de la compatibilité:', error);
      return [];
    }
  }
  
  // Par défaut, renvoyer un tableau vide
  return [];
}
