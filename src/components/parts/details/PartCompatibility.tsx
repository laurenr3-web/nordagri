
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface PartCompatibilityProps {
  compatibility: string[];
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  if (!compatibility || compatibility.length === 0) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Compatibilité</h3>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <Info className="h-4 w-4 mr-2" />
          <span>Aucune information de compatibilité disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Compatibilité</h3>
      <div className="flex flex-wrap gap-1">
        {compatibility.map((item, index) => (
          <Badge key={index} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PartCompatibility;
