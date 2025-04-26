
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PartCompatibilityProps {
  compatibility: string[] | undefined;
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Transformation sécurisée de la liste de compatibilité
  const safeCompatibility = React.useMemo(() => {
    if (!compatibility) return [];
    return Array.isArray(compatibility) 
      ? compatibility 
      : compatibility.split(',').map(s => s.trim()).filter(Boolean);
  }, [compatibility]);
  
  return (
    <div>
      <h3 className="text-sm text-muted-foreground mb-2">Équipements compatibles</h3>
      <div className="flex flex-wrap gap-2">
        {safeCompatibility.length > 0 ? (
          safeCompatibility.map((equipment, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1">
              {equipment}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Aucune information de compatibilité disponible</span>
        )}
      </div>
    </div>
  );
};

export default PartCompatibility;
