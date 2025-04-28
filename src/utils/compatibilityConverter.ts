
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

/**
 * Convertit un tableau de nombres en chaîne formatée pour la base de données
 * Cette fonction prend un tableau de nombres et le convertit en format attendu par la BDD
 */
export function compatibilityToStrings(compatibility: number[] | any): string[] {
  // Si compatibility est undefined ou null, renvoyer un tableau vide
  if (compatibility == null) {
    return [];
  }
  
  // Si c'est déjà un tableau, convertir chaque élément en chaîne
  if (Array.isArray(compatibility)) {
    return compatibility.map(id => String(id));
  }
  
  // Si c'est une chaîne unique, la diviser et la convertir en tableau de chaînes
  if (typeof compatibility === 'string') {
    return compatibility.split(',').map(id => id.trim()).filter(Boolean);
  }
  
  // Si c'est un nombre unique, le convertir en chaîne dans un tableau
  if (typeof compatibility === 'number') {
    return [String(compatibility)];
  }
  
  // Pour tout autre type, renvoyer un tableau vide
  console.warn('Format de compatibilité inattendu lors de la conversion en chaînes:', compatibility);
  return [];
}

/**
 * Parse une chaîne de compatibilité (format "1, 2, 3") en tableau de nombres
 * Utile pour les formulaires où la compatibilité est entrée comme texte
 */
export function parseCompatibilityString(compatibilityStr: string): number[] {
  if (!compatibilityStr) {
    return [];
  }
  
  // Diviser la chaîne par des virgules, supprimer les espaces, convertir en nombres
  return compatibilityStr
    .split(',')
    .map(item => {
      const trimmed = item.trim();
      const num = parseInt(trimmed, 10);
      return isNaN(num) ? 0 : num;
    })
    .filter(num => num > 0); // Filtrer les valeurs invalides ou zéro
}

