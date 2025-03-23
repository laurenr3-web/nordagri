
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PartsHeaderProps {
  openAddCategoryDialog: () => void;
  openAddPartDialog: () => void;
}

const PartsHeader: React.FC<PartsHeaderProps> = ({ 
  openAddCategoryDialog, 
  openAddPartDialog 
}) => {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="chip chip-secondary mb-2">Inventory Management</div>
          <h1 className="text-3xl font-medium tracking-tight mb-1">Parts Catalog</h1>
          <p className="text-muted-foreground">
            Manage your agricultural equipment parts inventory
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button className="gap-2" onClick={openAddCategoryDialog}>
            <Plus size={16} />
            <span>Add Category</span>
          </Button>
          <Button className="gap-2" onClick={openAddPartDialog}>
            <Plus size={16} />
            <span>Add Parts</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PartsHeader;
