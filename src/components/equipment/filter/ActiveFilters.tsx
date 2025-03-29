
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActiveFiltersProps {
  filters: {
    status: string[];
    type: string[];
    manufacturer: string[];
    year: number[];
  };
  toggleFilter: (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => void;
  clearFilters: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  activeFilterCount: number;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters = { status: [], type: [], manufacturer: [], year: [] },
  toggleFilter,
  clearFilters,
  getStatusColor,
  getStatusText,
  activeFilterCount
}) => {
  if (activeFilterCount === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {(filters.status || []).map(status => (
        <Badge 
          key={`active-status-${status}`} 
          variant="outline"
          className="flex items-center gap-1 pl-1"
        >
          <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
          <span>Status: {getStatusText(status)}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 ml-1 hover:bg-muted rounded-full"
            onClick={() => toggleFilter('status', status)}
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      ))}
      
      {(filters.type || []).map(type => (
        <Badge 
          key={`active-type-${type}`} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <span>Type: {type}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 ml-1 hover:bg-muted rounded-full"
            onClick={() => toggleFilter('type', type)}
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      ))}
      
      {(filters.manufacturer || []).map(manufacturer => (
        <Badge 
          key={`active-manufacturer-${manufacturer}`} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <span>Manufacturer: {manufacturer}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 ml-1 hover:bg-muted rounded-full"
            onClick={() => toggleFilter('manufacturer', manufacturer)}
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      ))}
      
      {activeFilterCount > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-6"
          onClick={clearFilters}
        >
          Clear all
        </Button>
      )}
    </div>
  );
};

export default ActiveFilters;
