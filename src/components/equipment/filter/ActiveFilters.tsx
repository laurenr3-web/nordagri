
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  filters,
  toggleFilter,
  clearFilters,
  getStatusColor,
  getStatusText,
  activeFilterCount
}) => {
  if (activeFilterCount === 0) return null;
  
  return (
    <div className="mt-4 flex items-center flex-wrap gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filters.status.map(status => (
        <Button 
          key={`status-${status}`} 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs gap-1"
          onClick={() => toggleFilter('status', status)}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(status)}`}></span>
          {getStatusText(status)}
          <X size={12} />
        </Button>
      ))}
      
      {filters.type.map(type => (
        <Button 
          key={`type-${type}`} 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs gap-1"
          onClick={() => toggleFilter('type', type)}
        >
          {type}
          <X size={12} />
        </Button>
      ))}
      
      {filters.manufacturer.map(manufacturer => (
        <Button 
          key={`manufacturer-${manufacturer}`} 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs gap-1"
          onClick={() => toggleFilter('manufacturer', manufacturer)}
        >
          {manufacturer}
          <X size={12} />
        </Button>
      ))}
      
      {filters.year.map(year => (
        <Button 
          key={`year-${year}`} 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs gap-1"
          onClick={() => toggleFilter('year', year)}
        >
          {year}
          <X size={12} />
        </Button>
      ))}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 text-xs"
        onClick={clearFilters}
      >
        Clear all
      </Button>
    </div>
  );
};

export default ActiveFilters;
