
import { Equipment } from '@/data/models/equipment';

/**
 * Vérifie si une valeur est un équipement valide
 * @param value La valeur à vérifier
 * @returns Booléen indiquant si la valeur est un équipement valide
 */
export function isEquipment(value: unknown): value is Equipment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

/**
 * Vérifie si un tableau contient uniquement des équipements valides
 * @param value Le tableau à vérifier
 * @returns Booléen indiquant si le tableau ne contient que des équipements valides
 */
export function isEquipmentArray(value: unknown): value is Equipment[] {
  return (
    Array.isArray(value) &&
    value.every(item => isEquipment(item))
  );
}

/**
 * Vérifie si une chaîne représente un ID d'équipement valide
 * @param value La chaîne à vérifier
 * @returns Booléen indiquant si la chaîne est un ID valide
 */
export function isEquipmentId(value: unknown): value is string | number {
  return (
    (typeof value === 'string' && /^\d+$/.test(value)) ||
    (typeof value === 'number' && Number.isInteger(value) && value > 0)
  );
}

/**
 * Vérifie si un tableau contient uniquement des IDs d'équipement valides
 * @param value Le tableau à vérifier
 * @returns Booléen indiquant si le tableau ne contient que des IDs valides
 */
export function isEquipmentIdArray(value: unknown): value is (string | number)[] {
  return (
    Array.isArray(value) &&
    value.every(item => isEquipmentId(item))
  );
}

/**
 * Normalise un ID d'équipement en nombre
 * @param id L'ID à normaliser (chaîne ou nombre)
 * @returns L'ID normalisé en nombre
 */
export function normalizeEquipmentId(id: string | number): number {
  return typeof id === 'string' ? parseInt(id, 10) : id;
}

/**
 * Transforme un tableau de chaînes en tableau avec typage strict
 * @param value Le tableau à transformer
 * @returns Le tableau typé ou un tableau vide
 */
export function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}
