
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
    const uniteRaw = equipment.unite_d_usure || 'heures';
    const unite = uniteRaw.toLowerCase();
    const isDay = ['jours','jour','days','day','j'].includes(unite);
    const valeur = equipment.valeur_actuelle || 0;

    // For time-based equipment ("jours"), the wear value is derived from
    // a baseline value plus the days elapsed since last_wear_update.
    // This way, the counter auto-increments by +1 every day, just like
    // an hour meter — users only need to set/correct the baseline.
    let formattedValue: string;
    if (isDay) {
      let totalDays = valeur;
      if (equipment.last_wear_update) {
        const last = new Date(equipment.last_wear_update).getTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - last) / 86400000));
        totalDays = valeur + elapsed;
      }
      formattedValue = `${totalDays.toLocaleString('fr-FR')} jour${totalDays > 1 ? 's' : ''}`;
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
