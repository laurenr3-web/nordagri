
import { EquipmentOption } from '@/hooks/equipment/useEquipments';

// Clé de cache pour les équipements
const EQUIPMENT_CACHE_KEY = 'nordagri_equipment_cache';
const EQUIPMENT_CACHE_TIMESTAMP_KEY = 'nordagri_equipment_cache_timestamp';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Enregistre les équipements dans le cache local
 */
export function cacheEquipments(equipments: EquipmentOption[]): void {
  try {
    localStorage.setItem(EQUIPMENT_CACHE_KEY, JSON.stringify(equipments));
    localStorage.setItem(EQUIPMENT_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Erreur lors de la mise en cache des équipements:', error);
  }
}

/**
 * Récupère les équipements depuis le cache local
 */
export function getCachedEquipments(): EquipmentOption[] | null {
  try {
    const cachedData = localStorage.getItem(EQUIPMENT_CACHE_KEY);
    const timestamp = localStorage.getItem(EQUIPMENT_CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !timestamp) return null;
    
    // Vérifier si le cache a expiré
    const cacheTime = parseInt(timestamp);
    if (Date.now() - cacheTime > CACHE_EXPIRY_MS) {
      // Le cache a expiré, on le supprime
      localStorage.removeItem(EQUIPMENT_CACHE_KEY);
      localStorage.removeItem(EQUIPMENT_CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Erreur lors de la récupération du cache des équipements:', error);
    return null;
  }
}

/**
 * Vérifie si un équipement existe dans le cache local
 */
export function equipmentExistsInCache(equipmentId: number): boolean {
  try {
    const cachedEquipments = getCachedEquipments();
    if (!cachedEquipments) return false;
    
    return cachedEquipments.some(eq => parseInt(eq.value) === equipmentId);
  } catch (error) {
    console.error('Erreur lors de la vérification du cache des équipements:', error);
    return false;
  }
}

/**
 * Met à jour le hook useEquipments pour utiliser le cache en cas de besoin
 */
export function updateUseEquipmentHook() {
  // Cette fonction sera appelée pour mettre à jour le hook useEquipments
  // avec les données du cache local si nécessaire
  // (Cette fonction est un placeholder pour une implémentation future)
}
