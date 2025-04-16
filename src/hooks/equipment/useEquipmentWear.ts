
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WearInfo {
  unite: string;
  valeur: number;
  formattedValue: string;
  lastUpdate: string | null;
}

export function useEquipmentWear(equipment: { 
  unite_d_usure: string; 
  valeur_actuelle: number;
  last_wear_update?: string | Date | null;
}): WearInfo {
  return useMemo(() => {
    const unite = equipment.unite_d_usure || 'heures';
    const valeur = equipment.valeur_actuelle || 0;
    
    // Format the value based on the unit type
    let formattedValue = `${valeur.toLocaleString('fr-FR')} `;
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
