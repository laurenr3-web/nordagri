
/**
 * Assure qu'un ID est converti en nombre
 * 
 * @param id L'ID qui peut être une chaîne ou un nombre
 * @returns L'ID converti en nombre
 */
export function ensureNumberId(id: number | string): number {
  if (typeof id === 'string') {
    return parseInt(id, 10);
  }
  return id;
}
