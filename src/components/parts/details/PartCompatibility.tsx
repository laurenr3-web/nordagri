
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PartCompatibilityProps {
  compatibility: string[];
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Ensure compatibility is always an array
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
          <span className="text-sm text-muted-foreground">No compatible equipment found</span>
        )}
      </div>
    </div>
  );
};

export default PartCompatibility;
