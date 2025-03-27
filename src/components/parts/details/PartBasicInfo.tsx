
import React from 'react';
import { Tag, Factory } from 'lucide-react';
import { Part } from '@/types/Part';

interface PartBasicInfoProps {
  part: Part;
}

const PartBasicInfo: React.FC<PartBasicInfoProps> = ({ part }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm text-muted-foreground">Category</h3>
        <p className="font-medium flex items-center gap-2">
          <Tag size={16} className="text-muted-foreground" />
          {part.category.charAt(0).toUpperCase() + part.category.slice(1)}
        </p>
      </div>
      
      <div>
        <h3 className="text-sm text-muted-foreground">Part Number</h3>
        <p className="font-medium">{part.partNumber}</p>
      </div>
      
      <div>
        <h3 className="text-sm text-muted-foreground">Manufacturer</h3>
        <p className="font-medium flex items-center gap-2">
          <Factory size={16} className="text-muted-foreground" />
          {part.manufacturer}
        </p>
      </div>
    </div>
  );
};

export default PartBasicInfo;
