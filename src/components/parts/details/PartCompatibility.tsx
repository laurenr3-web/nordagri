
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PartCompatibilityProps {
  compatibility: string[] | undefined;
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Transformation sécurisée de la liste de compatibilité
  const safeCompatibility = React.useMemo(() => {
    if (!compatibility) return [];
    
    // If compatibility is already an array, use it directly
    if (Array.isArray(compatibility)) {
      return compatibility;
    }
    
    // TypeScript needs explicit type narrowing here since it's unsure about the type
    // We shouldn't reach this case given the type definition, but handling it anyway
    return [];
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
