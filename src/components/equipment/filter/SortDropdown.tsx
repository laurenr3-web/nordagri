
import React from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  sortBy: string;
  sortOrder: string;
  setSortBy: (value: string) => void;
  setSortOrder: (value: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ 
  sortBy, 
  sortOrder, 
  setSortBy, 
  setSortOrder 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" size="sm">
          <SlidersHorizontal size={16} />
          <span>Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select a field to sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Order</DropdownMenuLabel>
        <div className="flex p-2 gap-2">
          <Button 
            variant={sortOrder === 'asc' ? 'default' : 'outline'} 
            size="sm" 
            className="flex-1 gap-1"
            onClick={() => setSortOrder('asc')}
          >
            {sortOrder === 'asc' && <Check size={14} />} Ascending
          </Button>
          <Button 
            variant={sortOrder === 'desc' ? 'default' : 'outline'} 
            size="sm" 
            className="flex-1 gap-1"
            onClick={() => setSortOrder('desc')}
          >
            {sortOrder === 'desc' && <Check size={14} />} Descending
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
