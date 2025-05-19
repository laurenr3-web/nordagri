
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileCheck } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { useInterventionReportForm } from './hooks/useInterventionReportForm';
import { InterventionDetailsSection } from './report-dialog/InterventionDetailsSection';
import { ReportForm } from './report-dialog/ReportForm';
import { DialogFooterActions } from './report-dialog/DialogFooterActions';

export interface InterventionReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervention: Intervention | null;
  onSubmit: (intervention: Intervention, report: any) => void;
  availableParts?: Array<{ id: number; name: string; quantity: number; }>;
}

const InterventionReportDialog: React.FC<InterventionReportDialogProps> = ({
  open,
  onOpenChange,
  intervention,
  onSubmit,
  availableParts = []
}) => {
  const {
    form,
    handleSubmit,
    handleExportToPDF,
    addPart,
    removePart,
    updatePartQuantity
  } = useInterventionReportForm({ intervention, onSubmit, onOpenChange });

  if (!intervention) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileCheck className="mr-2 h-5 w-5" />
            Rapport d'intervention
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="pr-4 max-h-[calc(90vh-180px)]">
          <InterventionDetailsSection intervention={intervention} />
          
          <ReportForm 
            form={form} 
            availableParts={availableParts}
            addPart={addPart}
            removePart={removePart}
            updatePartQuantity={updatePartQuantity}
          />
          
          <DialogFooterActions 
            onCancel={() => onOpenChange(false)}
            onExportPDF={handleExportToPDF}
            onSubmit={form.handleSubmit(handleSubmit)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InterventionReportDialog;
