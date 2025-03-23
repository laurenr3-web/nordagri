
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SortDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const SortDialog: React.FC<SortDialogProps> = ({
  isOpen,
  onOpenChange,
  sortBy,
  setSortBy
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sort Parts</DialogTitle>
          <DialogDescription>
            Choose how to sort the parts catalog
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            onOpenChange(false);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
              <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SortDialog;
