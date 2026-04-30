
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WearInfo {
  unite: string;
  valeur: number;
  formattedValue: string;
  lastUpdate: string | null;
}

interface EquipmentWearData {
  unite_d_usure?: string; 
  valeur_actuelle?: number;
  last_wear_update?: string | Date | null;
}

export function useEquipmentWear(equipment: EquipmentWearData): WearInfo {
  return useMemo(() => {
    const unite = equipment.unite_d_usure || 'heures';
    const valeur = equipment.valeur_actuelle || 0;

    // For time-based equipment ("jours"), the wear value is derived from
    // the date of the last maintenance/update, not from a manual counter.
    let formattedValue: string;
    if (unite === 'jours') {
      if (equipment.last_wear_update) {
        const last = new Date(equipment.last_wear_update).getTime();
        const days = Math.max(0, Math.floor((Date.now() - last) / 86400000));
        formattedValue = `${days.toLocaleString('fr-FR')} jour${days > 1 ? 's' : ''}`;
      } else {
        formattedValue = '— jours';
      }
    } else {
      formattedValue = `${valeur.toLocaleString('fr-FR')} `;
      switch (unite) {
        case 'heures':
          formattedValue += 'h';
          break;
        case 'kilometres':
          formattedValue += 'km';
          break;
        case 'acres':
          formattedValue += 'acres';
          break;
        default:
          formattedValue += unite;
      }
    }

    // Format last update date
    const lastUpdate = equipment.last_wear_update 
      ? formatDistanceToNow(new Date(equipment.last_wear_update), { 
          addSuffix: true,
          locale: fr 
        })
      : null;

    return {
      unite,
      valeur,
      formattedValue,
      lastUpdate
    };
  }, [equipment.unite_d_usure, equipment.valeur_actuelle, equipment.last_wear_update]);
}
