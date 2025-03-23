
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AddCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: string) => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onAddCategory 
}) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() !== '') {
      onAddCategory(newCategory.trim());
      toast.success("Category added", {
        description: `"${newCategory.trim()}" has been added as a category.`
      });
      setNewCategory('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a custom category for your equipment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input 
            placeholder="Enter new category name" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)} 
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
