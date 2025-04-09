
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Equipment } from '@/hooks/equipment/useEquipmentTable';
import { useState } from 'react';

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Equipment>) => void;
  title: string;
  equipment?: Equipment;
}

const EquipmentFormDialog: React.FC<EquipmentFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  equipment
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: equipment?.name || '',
    type: equipment?.type || '',
    manufacturer: equipment?.manufacturer || '',
    model: equipment?.model || '',
    year: equipment?.year || '',
    serialNumber: equipment?.serialNumber || '',
    status: equipment?.status || 'operational',
    location: equipment?.location || '',
    notes: equipment?.notes || '',
    image: equipment?.image || ''
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nom de l'équipement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type || ''}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tractor">Tracteur</SelectItem>
                  <SelectItem value="harvester">Moissonneuse</SelectItem>
                  <SelectItem value="seeder">Semoir</SelectItem>
                  <SelectItem value="sprayer">Pulvérisateur</SelectItem>
                  <SelectItem value="irrigation">Irrigation</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricant</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer || ''}
                onChange={handleChange}
                placeholder="Fabricant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                placeholder="Modèle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year || ''}
                onChange={handleChange}
                placeholder="Année"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Numéro de série</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber || ''}
                onChange={handleChange}
                placeholder="Numéro de série"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">État</Label>
              <Select
                value={formData.status || 'operational'}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="État de l'équipement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Opérationnel</SelectItem>
                  <SelectItem value="maintenance">En maintenance</SelectItem>
                  <SelectItem value="repair">En réparation</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Emplacement</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="Emplacement"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="image">URL de l'image</Label>
              <Input
                id="image"
                name="image"
                value={formData.image || ''}
                onChange={handleChange}
                placeholder="URL de l'image"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Notes additionnelles"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentFormDialog;
