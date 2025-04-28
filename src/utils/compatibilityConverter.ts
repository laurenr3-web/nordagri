
/**
 * Convertit une chaîne de compatibilité en tableau de nombres
 * @param compatibilityString Chaîne au format "1, 2, 3" ou similaire
 * @returns Tableau d'IDs numériques
 */
export function parseCompatibilityString(compatibilityString: string | undefined | null): number[] {
  if (!compatibilityString) return [];
  
  return compatibilityString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
}

/**
 * S'assure que la compatibilité est sous forme de tableau de nombres
 * @param compatibility Compatibilité sous une forme quelconque
 * @returns Tableau normalisé de nombres
 */
export function compatibilityToNumbers(compatibility: any): number[] {
  // Si c'est undefined ou null
  if (!compatibility) return [];
  
  // Si c'est déjà un tableau
  if (Array.isArray(compatibility)) {
    return compatibility
      .map(id => {
        // Si l'élément est une chaîne, essayer de le convertir en nombre
        if (typeof id === 'string') {
          const num = Number(id);
          return isNaN(num) ? null : num;
        }
        // Si c'est déjà un nombre, le garder
        else if (typeof id === 'number') {
          return id;
        }
        // Sinon, ignorer cet élément
        return null;
      })
      .filter((id): id is number => id !== null);
  }
  
  // Si c'est une chaîne, la traiter comme une liste séparée par des virgules
  if (typeof compatibility === 'string') {
    return parseCompatibilityString(compatibility);
  }
  
  // Par défaut, retourner un tableau vide
  return [];
}

/**
 * Convertit un tableau de nombres en chaîne formatée
 * @param compatibilityArray Tableau de nombres
 * @returns Chaîne formatée "1, 2, 3"
 */
export function numberArrayToString(compatibilityArray: number[]): string {
  if (!Array.isArray(compatibilityArray)) return '';
  return compatibilityArray.join(', ');
}
