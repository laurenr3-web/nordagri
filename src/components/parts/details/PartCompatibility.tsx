
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PartCompatibilityProps {
  compatibility: string[];
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  return (
    <div>
      <h3 className="text-sm text-muted-foreground mb-2">Compatible Equipment</h3>
      <div className="flex flex-wrap gap-2">
        {compatibility.map((equipment, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1">
            {equipment}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PartCompatibility;
