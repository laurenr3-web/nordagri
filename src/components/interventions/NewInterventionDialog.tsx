
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InterventionFormValues } from '@/types/Intervention';
import BasicInfoFields from './form/BasicInfoFields';
import SchedulingFields from './form/SchedulingFields';
import DetailsFields from './form/DetailsFields';
import { useInterventionForm } from './form/useInterventionForm';
import { Loader2 } from 'lucide-react';

interface NewInterventionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (intervention: InterventionFormValues) => Promise<void>;
  equipments?: { id: number; name: string }[];
  technicians?: { id: string; name: string }[];
  isLoadingEquipment?: boolean;
  isLoadingTechnicians?: boolean;
}

const NewInterventionDialog: React.FC<NewInterventionDialogProps> = ({ 
  open, 
  onOpenChange,
  onCreate,
  equipments = [],
  technicians = [],
  isLoadingEquipment = false,
  isLoadingTechnicians = false
}) => {
  // Ne pas utiliser de données fictives si on a des équipements réels
  const defaultEquipments = equipments;
  const defaultTechnicians = technicians.length > 0 ? technicians : [
    { id: "1", name: "Robert Taylor" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "David Chen" },
    { id: "4", name: "Maria Rodriguez" }
  ];
  
  const { form, onSubmit, handleEquipmentChange, isSubmitting } = useInterventionForm({
    onCreate,
    onClose: () => onOpenChange(false),
    equipments: defaultEquipments
  });
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isSubmitting) onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Intervention</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BasicInfoFields 
                form={form} 
                equipments={defaultEquipments} 
                isLoadingEquipment={isLoadingEquipment}
                handleEquipmentChange={handleEquipmentChange}
              />
              
              <SchedulingFields form={form} />
              
              <DetailsFields 
                form={form} 
                technicians={defaultTechnicians}
                isLoadingTechnicians={isLoadingTechnicians}
              />
            </div>
          
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer l'intervention"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewInterventionDialog;
