
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DialogWrapper from './DialogWrapper';

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newStaffName: string;
  setNewStaffName: (name: string) => void;
  onAddStaff: () => void;
}

const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  newStaffName,
  setNewStaffName,
  onAddStaff,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStaff();
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Ajouter une personne"
      description="Entrez le nom de la personne à ajouter à votre équipe."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="staff-name">Nom</Label>
          <Input
            id="staff-name"
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            placeholder="Nom de la personne"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit">Ajouter</Button>
        </div>
      </form>
    </DialogWrapper>
  );
};

export default AddStaffDialog;
