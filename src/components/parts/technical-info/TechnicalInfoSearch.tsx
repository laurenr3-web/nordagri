
import React from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';

// Suggestions prédéfinies pour la recherche de pièces techniques
const TECHNICAL_SUGGESTIONS: ComboboxOption[] = [
  { label: "John Deere 0118-2672 - Filtre à huile", value: "JD0118-2672" },
  { label: "Case IH 0118-2672 - Capteur de pression", value: "CASE0118-2672" },
  { label: "Kubota 0118-2672 - Joint d'étanchéité", value: "KUB0118-2672" },
  { label: "John Deere RE504836 - Filtre à carburant", value: "RE504836" },
  { label: "Case IH 84475542 - Filtre à air", value: "84475542" },
];

interface TechnicalInfoSearchProps {
  currentPartNumber: string;
  onSelect: (value: string) => void;
}

export const TechnicalInfoSearch: React.FC<TechnicalInfoSearchProps> = ({
  currentPartNumber,
  onSelect
}) => {
  const handleComboboxSelect = (value: string) => {
    // Extraire les informations de la suggestion
    const suggestion = TECHNICAL_SUGGESTIONS.find(s => s.value === value);
    
    if (suggestion) {
      // Extraire la référence et le fabricant du libellé
      const parts = suggestion.label.split(' - ')[0].split(' ');
      if (parts.length >= 2) {
        const reference = parts[parts.length - 1];
        const manufacturer = parts.slice(0, parts.length - 1).join(' ');
        onSelect(value);
      }
    } else {
      // Si la valeur n'est pas dans les suggestions, la traiter comme une référence directe
      onSelect(value);
    }
  };
  
  return (
    <div>
      <Combobox
        options={TECHNICAL_SUGGESTIONS}
        placeholder="Rechercher une pièce..."
        onSelect={handleComboboxSelect}
        defaultValue={currentPartNumber}
        className="w-full md:max-w-md"
      />
    </div>
  );
};
