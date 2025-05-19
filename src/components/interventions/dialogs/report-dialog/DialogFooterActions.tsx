
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { CheckCircle, Download } from 'lucide-react';

interface DialogFooterActionsProps {
  onCancel: () => void;
  onExportPDF: () => void;
  onSubmit: () => void;
}

export const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({
  onCancel,
  onExportPDF,
  onSubmit
}) => {
  return (
    <DialogFooter className="pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Annuler
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onExportPDF}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exporter PDF
      </Button>
      <Button 
        type="button"
        onClick={onSubmit}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Valider l'intervention
      </Button>
    </DialogFooter>
  );
};
