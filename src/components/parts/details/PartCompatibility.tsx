
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PartCompatibilityProps {
  compatibility: string[] | undefined;
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Ensure compatibility is always an array
  const safeCompatibility = React.useMemo(() => {
    // If undefined or null, return empty array
    if (!compatibility) return [];
    
    // If already an array, use it directly
    if (Array.isArray(compatibility)) {
      return compatibility;
    }
    
    // This shouldn't happen based on the type definition, but handle just in case
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
