
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Check, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FilterDropdownProps {
  statusOptions: string[];
  typeOptions: string[];
  manufacturerOptions: string[];
  yearOptions: number[];
  filters: {
    status: string[];
    type: string[];
    manufacturer: string[];
    year: number[];
  };
  activeFilterCount: number;
  isFilterActive: (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => boolean;
  toggleFilter: (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => void;
  clearFilters: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  statusOptions = [],
  typeOptions = [],
  manufacturerOptions = [],
  yearOptions = [],
  filters = { status: [], type: [], manufacturer: [], year: [] },
  activeFilterCount = 0,
  isFilterActive,
  toggleFilter,
  clearFilters,
  getStatusColor,
  getStatusText
}) => {
  // Ensure all arrays have default values to prevent mapping over undefined
  const safeStatusOptions = statusOptions || [];
  const safeTypeOptions = typeOptions || [];
  const safeManufacturerOptions = manufacturerOptions || [];
  const safeYearOptions = yearOptions || [];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[20px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64">
        <DropdownMenuGroup>
          <div className="p-2 font-medium">Status</div>
          <div className="px-2 pb-2 grid grid-cols-2 gap-1">
            {safeStatusOptions.map(status => (
              <DropdownMenuItem
                key={`status-${status}`}
                className="gap-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  toggleFilter('status', status);
                }}
              >
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                <span>{getStatusText(status)}</span>
                {isFilterActive('status', status) && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <div className="p-2 font-medium">Type</div>
          <div className="px-2 pb-2">
            {safeTypeOptions.map(type => (
              <DropdownMenuItem
                key={`type-${type}`}
                className="gap-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  toggleFilter('type', type);
                }}
              >
                <span>{type}</span>
                {isFilterActive('type', type) && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <div className="p-2 font-medium">Manufacturer</div>
          <div className="px-2 pb-2">
            {safeManufacturerOptions.map(manufacturer => (
              <DropdownMenuItem
                key={`manufacturer-${manufacturer}`}
                className="gap-2 cursor-pointer truncate"
                onSelect={(e) => {
                  e.preventDefault();
                  toggleFilter('manufacturer', manufacturer);
                }}
              >
                <span>{manufacturer}</span>
                {isFilterActive('manufacturer', manufacturer) && <Check className="ml-auto h-4 w-4 flex-shrink-0" />}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
        
        {activeFilterCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-center cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                clearFilters();
              }}
            >
              Clear all filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
