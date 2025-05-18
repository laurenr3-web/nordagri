
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MobileInterventionForm } from '../../form/MobileInterventionForm';
import { InterventionFormValues } from '@/types/Intervention';
import { useIsMobile } from '@/hooks/use-mobile';

interface RequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InterventionFormValues) => Promise<void>;
  equipments?: { id: number; name: string }[];
  technicians?: { id: string; name: string }[];
  isLoadingEquipment?: boolean;
  isLoadingTechnicians?: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  equipments = [],
  technicians = [],
  isLoadingEquipment = false,
  isLoadingTechnicians = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (values: InterventionFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const formContent = (
    <MobileInterventionForm
      onSubmit={handleSubmit}
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
            <SheetTitle>Créer une demande d'intervention</SheetTitle>
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
          <DialogTitle>Créer une demande d'intervention</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
