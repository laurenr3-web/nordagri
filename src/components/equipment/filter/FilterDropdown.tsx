
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  statusOptions,
  typeOptions,
  manufacturerOptions,
  yearOptions,
  filters,
  activeFilterCount,
  isFilterActive,
  toggleFilter,
  clearFilters,
  getStatusColor,
  getStatusText
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" size="sm">
          <Filter size={16} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground w-5 h-5 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        {statusOptions.map(status => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={isFilterActive('status', status)}
            onCheckedChange={() => toggleFilter('status', status)}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`}></span>
            {getStatusText(status)}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
        {typeOptions.map(type => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={isFilterActive('type', type)}
            onCheckedChange={() => toggleFilter('type', type)}
          >
            {type}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter by Manufacturer</DropdownMenuLabel>
        {manufacturerOptions.map(manufacturer => (
          <DropdownMenuCheckboxItem
            key={manufacturer}
            checked={isFilterActive('manufacturer', manufacturer)}
            onCheckedChange={() => toggleFilter('manufacturer', manufacturer)}
          >
            {manufacturer}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter by Year</DropdownMenuLabel>
        {yearOptions.map(year => (
          <DropdownMenuCheckboxItem
            key={year}
            checked={isFilterActive('year', year)}
            onCheckedChange={() => toggleFilter('year', year)}
          >
            {year}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
