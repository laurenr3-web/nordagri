
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturers: string[];
  filterManufacturers: string[];
  toggleManufacturerFilter: (manufacturer: string) => void;
  filterMinPrice: string;
  setFilterMinPrice: (value: string) => void;
  filterMaxPrice: string;
  setFilterMaxPrice: (value: string) => void;
  filterInStock: boolean;
  setFilterInStock: (value: boolean) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onOpenChange,
  manufacturers,
  filterManufacturers,
  toggleManufacturerFilter,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  filterInStock,
  setFilterInStock,
  resetFilters,
  applyFilters
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Parts</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your search
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Manufacturer</h3>
            <div className="grid grid-cols-2 gap-2">
              {manufacturers.map((manufacturer) => (
                <div key={manufacturer} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`manufacturer-${manufacturer}`} 
                    checked={filterManufacturers.includes(manufacturer)}
                    onCheckedChange={() => toggleManufacturerFilter(manufacturer)}
                  />
                  <Label htmlFor={`manufacturer-${manufacturer}`}>{manufacturer}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Price Range</h3>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Min"
                type="number"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                className="w-20"
              />
              <span>to</span>
              <Input
                placeholder="Max"
                type="number"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                className="w-20"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="in-stock"
              checked={filterInStock}
              onCheckedChange={(checked) => setFilterInStock(checked as boolean)}
            />
            <Label htmlFor="in-stock">In stock only</Label>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetFilters}>Reset</Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
