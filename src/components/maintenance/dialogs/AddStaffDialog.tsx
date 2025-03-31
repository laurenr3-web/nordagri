
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
  setStaffName: (name: string) => void;
  onAddStaff: () => void;
}

const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  staffName,
  setStaffName,
  onAddStaff,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStaff();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un membre du personnel</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau technicien ou responsable pour les tâches de maintenance.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Prénom Nom"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffDialog;
