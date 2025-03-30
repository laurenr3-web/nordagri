
import React from 'react';

// Suggestions prédéfinies pour la recherche de pièces
const SUGGESTED_PARTS = [
  { ref: "0118-2672", name: "Filtre à huile", manufacturer: "John Deere" },
  { ref: "0118-2672", name: "Capteur de pression", manufacturer: "Case IH" },
  { ref: "0118-2672", name: "Joint d'étanchéité", manufacturer: "Kubota" },
  { ref: "RE504836", name: "Filtre à carburant", manufacturer: "John Deere" },
  { ref: "84475542", name: "Filtre à air", manufacturer: "Case IH" },
  { ref: "HH164-32430", name: "Courroie", manufacturer: "Kubota" },
  { ref: "87300041", name: "Capteur", manufacturer: "New Holland" },
  { ref: "3595175M1", name: "Joint", manufacturer: "Massey Ferguson" },
];

interface PerplexitySuggestionsProps {
  onSuggestionClick: (part: {ref: string, name: string, manufacturer: string}) => void;
}

const PerplexitySuggestions: React.FC<PerplexitySuggestionsProps> = ({ onSuggestionClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {SUGGESTED_PARTS.map((part, index) => (
        <div 
          key={index}
          className="cursor-pointer p-3 border rounded-md hover:bg-accent/5"
          onClick={() => onSuggestionClick(part)}
        >
          <p className="font-medium text-sm">{part.name}</p>
          <p className="text-xs text-muted-foreground">
            {part.manufacturer} - Réf: {part.ref}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PerplexitySuggestions;
