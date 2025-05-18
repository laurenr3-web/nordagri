
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InterventionFormValues } from '@/types/Intervention';
import { MobileInterventionForm } from './form/MobileInterventionForm';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const handleCancel = () => {
    onOpenChange(false);
  };

  const formContent = (
    <MobileInterventionForm
      onSubmit={onCreate}
      onCancel={handleCancel}
      equipments={equipments}
      technicians={technicians}
      isLoadingEquipment={isLoadingEquipment}
      isLoadingTechnicians={isLoadingTechnicians}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Nouvelle Intervention</SheetTitle>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Intervention</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default NewInterventionDialog;
