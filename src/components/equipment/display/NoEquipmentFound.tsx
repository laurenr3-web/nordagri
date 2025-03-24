
import React from 'react';
import { Button } from '@/components/ui/button';

interface NoEquipmentFoundProps {
  resetFilters: () => void;
}

const NoEquipmentFound: React.FC<NoEquipmentFoundProps> = ({ resetFilters }) => {
  return (
    <div className="mt-10 text-center">
      <p className="text-muted-foreground">No equipment found matching your criteria.</p>
      <Button variant="link" onClick={resetFilters}>
        Reset filters
      </Button>
    </div>
  );
};

export default NoEquipmentFound;
