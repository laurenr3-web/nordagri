
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    if (newCategory.trim() === '') {
      toast.error("Le nom de la catégorie ne peut pas être vide");
      return;
    }
    
    onAddCategory(newCategory.trim());
    setNewCategory('');
    onOpenChange(false);
    toast.success(`Catégorie "${newCategory.trim()}" ajoutée avec succès`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
          <DialogDescription>
            Créez une catégorie personnalisée pour votre équipement
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input 
            placeholder="Entrez le nom de la catégorie" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)} 
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCategory}>
              Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
