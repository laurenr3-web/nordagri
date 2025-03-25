
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface NoEquipmentFoundProps {
  resetFilters: () => void;
  isLoading?: boolean;
}

const NoEquipmentFound: React.FC<NoEquipmentFoundProps> = ({ resetFilters, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="mt-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading equipment data...</p>
      </div>
    );
  }
  
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
