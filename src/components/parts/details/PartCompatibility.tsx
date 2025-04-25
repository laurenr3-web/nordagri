
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PartCompatibilityProps {
  compatibility: string[] | undefined;
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Ensure we have a valid array to iterate over
  const safeCompatibility = Array.isArray(compatibility) ? compatibility : [];
  
  return (
    <div>
      <h3 className="text-sm text-muted-foreground mb-2">Compatible Equipment</h3>
      <div className="flex flex-wrap gap-2">
        {safeCompatibility.length > 0 ? (
          safeCompatibility.map((equipment, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1">
              {equipment}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No compatibility information available</span>
        )}
      </div>
    </div>
  );
};

export default PartCompatibility;
