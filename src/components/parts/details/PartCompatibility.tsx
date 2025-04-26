
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { assertIsArray } from '@/utils/typeAssertions';

interface PartCompatibilityProps {
  compatibility: string[] | undefined;
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Ensure compatibility is always an array with enhanced type safety
  const safeCompatibility = React.useMemo(() => {
    try {
      // If undefined or null, return empty array
      if (!compatibility) return [];
      
      // Use type assertion to ensure we're dealing with an array
      return assertIsArray<string>(compatibility);
    } catch (error) {
      // If assertion fails, log error and return empty array
      console.error("Type error in compatibility data:", error);
      return [];
    }
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
