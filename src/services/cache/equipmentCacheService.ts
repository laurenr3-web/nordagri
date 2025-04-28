
import { EquipmentOption } from '@/hooks/equipment/useEquipments';

// Clé pour stocker les données dans le localStorage
const EQUIPMENT_CACHE_KEY = 'equipment_cache';

/**
 * Mettre en cache les équipements pour une utilisation hors ligne
 * @param equipments Liste des équipements à mettre en cache
 */
export function cacheEquipments(equipments: EquipmentOption[]): void {
  try {
    localStorage.setItem(EQUIPMENT_CACHE_KEY, JSON.stringify(equipments));
    console.log('Équipements mis en cache:', equipments.length);
  } catch (error) {
    console.error('Erreur lors de la mise en cache des équipements:', error);
  }
}

/**
 * Récupérer les équipements mis en cache
 * @returns Liste des équipements ou null si aucun cache n'est disponible
 */
export function getCachedEquipments(): EquipmentOption[] | null {
  try {
    const cachedData = localStorage.getItem(EQUIPMENT_CACHE_KEY);
    if (!cachedData) return null;
    
    const parsedData = JSON.parse(cachedData) as EquipmentOption[];
    console.log('Équipements récupérés du cache:', parsedData.length);
    return parsedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des équipements en cache:', error);
    return null;
  }
}

/**
 * Vider le cache des équipements
 */
export function clearEquipmentCache(): void {
  try {
    localStorage.removeItem(EQUIPMENT_CACHE_KEY);
    console.log('Cache des équipements vidé');
  } catch (error) {
    console.error('Erreur lors du vidage du cache des équipements:', error);
  }
}
